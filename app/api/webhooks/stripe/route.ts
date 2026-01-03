import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as fs from 'fs';
import * as path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: "2024-06-20", // Removed to fix type error
});

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            await createOrderInSanity(session);
        } catch (error) {
            console.error("Error creating order in Sanity:", error);
            return NextResponse.json({ error: "Error creating order" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
    const {
        id,
        amount_total,
        currency,
        metadata,
        payment_intent,
        customer,
        total_details,
        customer_details,
    } = session;

    console.log("---------------- WEBHOOK STRIPE DEBUG ----------------");

    try {
        const logPath = path.join(process.cwd(), 'webhook_debug.log');
        const logMessage = `[${new Date().toISOString()}] Webhook received. Event: ${event.type}. Session ID: ${id}. Metadata: ${JSON.stringify(metadata)}\n`;
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        console.error("Failed to write log", e);
    }

    console.log("Session ID:", id);
    console.log("Metadata:", JSON.stringify(metadata, null, 2));
    console.log("Clerk User ID from Metadata:", metadata?.clerkUserId);
    console.log("------------------------------------------------------");

    const { clerkUserId, productIds, quantities } = metadata || {};

    // Map items from metadata strings
    const productIdArray = productIds ? productIds.split(",") : [];
    const quantityArray = quantities ? quantities.split(",").map(Number) : [];

    const items = productIdArray.map((productId, index) => ({
        _key: crypto.randomUUID(),
        product: {
            _type: "reference",
            _ref: productId,
        },
        quantity: quantityArray[index] || 1,
        priceAtPurchase: 0, // Ideally we should probably fetch the latest price or store it in metadata too, but for now 0 or fetch from sanity? 
        // Actually, Stripe session object has line_items if expanded, but usually webhook payload for session.completed might not have line_items expanded by default unless configured.
        // But for simplicity let's assume valid product refs. The priceAtPurchase is required by schema.
        // Let's try to get it from the session amount or just put a placeholder if we can't easily get per-item price here without more calls.
        // BETTER APPROACH: Fetch the line items from Stripe using the session ID to get accurate prices.
    }));

    // Fetch line items to get accurate prices
    const lineItems = await stripe.checkout.sessions.listLineItems(id, {
        limit: 100,
    });

    const sanityItems = lineItems.data.map((item) => ({
        _key: crypto.randomUUID(),
        product: {
            _type: "reference",
            _ref: (item.price?.product as string) || "", // We passed product_data, but we might not have the Sanity ID directly in the stripe product object unless we put it in metadata there too.
            // Wait, in checkout/route.ts we didn't put Sanity ID in stripe product metadata.
            // But we have `productIdArray` from the session metadata! 
            // We need to match line items to our products.
            // This is tricky if order isn't guaranteed. 
            // Revert to using metadata arrays which we trust for the refs.
        },
        quantity: item.quantity,
        priceAtPurchase: (item.price?.unit_amount || 0) / 100,
    }));

    // Correcting the loop to strictly use our metadata for refs, but prices from lineItems.
    // Assuming the order is preserved (Stripe usually preserves order but let's be careful).
    // Actually, `items.map` in checkout route creates line_items in order.

    const finalItems = productIdArray.map((productId, index) => {
        const stripeItem = lineItems.data[index]
        return {
            _key: crypto.randomUUID(),
            product: {
                _type: "reference",
                _ref: productId,
            },
            quantity: quantityArray[index] || 1,
            priceAtPurchase: (stripeItem?.price?.unit_amount || 0) / 100,
        }
    })

    const order = {
        _type: "order",
        orderNumber: crypto.randomUUID(),
        stripePaymentId: id,
        clerkUserId: clerkUserId,
        email: customer_details?.email,
        total: (amount_total || 0) / 100,
        status: "paid",
        address: {
            name: customer_details?.name,
            line1: customer_details?.address?.line1,
            line2: customer_details?.address?.line2,
            city: customer_details?.address?.city,
            postcode: customer_details?.address?.postal_code,
            country: customer_details?.address?.country,
        },
        items: finalItems,
    };

    return await backendClient.create(order);
}

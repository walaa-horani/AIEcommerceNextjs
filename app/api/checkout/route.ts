import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: "2024-06-20", // Removed to fix type error
});
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
    const { userId } = await auth();

    try {
        const logPath = path.join(process.cwd(), 'checkout_debug.log');
        const logMessage = `[${new Date().toISOString()}] Checkout initiated. UserId: ${userId}\n`;
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        console.error("Failed to write log", e);
    }

    console.log("---------------- CHECKOUT ROUTE DEBUG ----------------");
    console.log("User ID from auth():", userId);
    console.log("------------------------------------------------------");
    const { items } = await req.json();
    const customer = await client.fetch(
        `*[_type=="customer" && clerkUserId==$id][0]`,
        { id: userId }
    );

    const session = await stripe.checkout.sessions.create({
        customer: customer?.stripeCustomerId,
        mode: "payment",
        payment_method_types: ["card"],

        line_items: items.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.imageUrl ? [item.imageUrl] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        })),

        // 👇 أهم جزء
        metadata: {
            clerkUserId: userId ?? "",
            productIds: items.map((i: any) => i._id).join(","),
            quantities: items.map((i: any) => i.quantity).join(","),
        },

        shipping_address_collection: {
            allowed_countries: ["US", "CA", "GB", "AE"],
        },

        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
}

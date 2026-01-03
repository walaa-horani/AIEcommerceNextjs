import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error(
            "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
        );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured -- no svix headers", {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occured", {
            status: 400,
        });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        const email = email_addresses[0]?.email_address;
        const name = `${first_name} ${last_name}`.trim();

        console.log("Creating new user in Sanity:", id);

        // CREATE A STRIPE CUSTOMER
        // We need to initialize stripe here or import a shared instance.
        // Importing strict instance is better. 
        try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                // apiVersion: "2024-06-20", // using latest or default from package
            });

            const customer = await stripe.customers.create({
                email: email,
                name: name,
                metadata: {
                    clerkUserId: id, // Optional: link back to Clerk in Stripe
                }
            });

            await backendClient.create({
                _type: "customer",
                _id: `customer-${id}`, // Deterministic ID based on Clerk ID
                clerkUserId: id,
                email: email,
                name: name,
                stripeCustomerId: customer.id,
            });

            console.log("User successfully created in Sanity and Stripe");

        } catch (err) {
            console.error("Error creating user/customer:", err)
            return new Response("Error creating user", { status: 500 });
        }
    }

    if (eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;
        const name = `${first_name} ${last_name}`.trim();

        console.log("Updating user in Sanity:", id);

        try {
            await backendClient
                .patch(`customer-${id}`) // Assuming we used deterministic ID
                .set({
                    email: email,
                    name: name,
                })
                .commit();
        } catch (err) {
            // If patch fails (maybe doc doesn't exist?), we could try createIfNotExists but usually update follows create.
            console.error("Error updating user in Sanity:", err);
            return new Response("Error updating user", { status: 500 });
        }
    }

    // Handle user.deleted if needed
    if (eventType === "user.deleted") {
        const { id } = evt.data;
        if (id) {
            await backendClient.delete(`customer-${id}`).catch(err => console.error("Error deleting user:", err));
        }
    }

    return new Response("", { status: 200 });
}

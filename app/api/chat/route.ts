import { NextResponse } from "next/server";
import OpenAI from "openai";
import { client } from "@/sanity/lib/client";
import { ORDERS_BY_USER } from "@/sanity/queries/orders";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
    {
        name: "getUserOrders",
        description: "Get all orders for a user",
        parameters: {
            type: "object",
            properties: {
                clerkUserId: { type: "string" },
            },
            required: ["clerkUserId"],
        },
    },
];

async function getUserOrders(clerkUserId: string) {
    return await client.fetch(ORDERS_BY_USER, {
        clerkUserId,
    });
}

export async function POST(req: Request) {
    const { message, clerkUserId } = await req.json();


    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `
You are an ecommerce support assistant.
The current user's clerkUserId is: ${clerkUserId}.
You must NEVER ask for the user ID.
`,
            },
            {
                role: "user",
                content: message,
            },
        ],
        functions,
        function_call: "auto",
    });

    const msg = completion.choices[0].message;


    if (msg.function_call?.name === "getUserOrders") {
        const orders = await getUserOrders(clerkUserId);




        return NextResponse.json({
            type: "orders",
            orders: orders.map((o: any) => ({
                orderNumber: o.orderNumber,
                status: o.status,
                total: o.total,
                items: o.items?.map((i: any) => ({
                    name: i.product?.name,
                    image: i.product?.image?.asset?.url,
                    quantity: i.quantity,
                    price: i.priceAtPurchase,
                })),
            })),
        });
    }


    return NextResponse.json({
        reply: msg.content,
    });
}

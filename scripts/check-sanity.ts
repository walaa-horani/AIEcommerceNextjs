import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

async function checkData() {
    console.log("Checking Sanity Data...");

    // Check Customers
    const customers = await client.fetch('*[_type == "customer"]');
    console.log(`Found ${customers.length} customers.`);
    if (customers.length > 0) {
        console.log("Customer Sample:", JSON.stringify(customers[0], null, 2));
    }

    // Check Orders
    const orders = await client.fetch('*[_type == "order"]{orderNumber, clerkUserId}');
    console.log(`Found ${orders.length} orders.`);
    console.log(JSON.stringify(orders, null, 2));
}

checkData();

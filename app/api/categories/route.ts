import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
    const categories = await client.fetch(`*[_type == "category"]{
    _id,
    title
  }`);

    return NextResponse.json(categories);
}

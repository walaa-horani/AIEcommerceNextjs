import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import slugify from "slugify";

export async function POST(req: Request) {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const category = formData.get("category") as string;
    const image = formData.get("image") as File;

    if (!name || !price || !category || !image) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const asset = await writeClient.assets.upload("image", image);

    await writeClient.create({
        _type: "product",
        name,
        description,
        slug: {
            _type: "slug",
            current: slugify(name, { lower: true, strict: true }),
        },
        price,
        stock,
        category: {
            _type: "reference",
            _ref: category,
        },
        images: [
            {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: asset._id,
                },
            },
        ],
    });

    return NextResponse.json({ success: true });
}

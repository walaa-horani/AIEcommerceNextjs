"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/app/store/cart-store";
import { toast } from "sonner";

interface Product {
    _id: string;
    name: string | null;
    slug: string | null;
    price: number | null;
    image?: {
        asset?: {
            url?: string | null;
        } | null;
    } | null;
    images?: Array<{
        asset?: {
            url?: string | null;
        } | null;
    } | null> | null;
    category?: {
        title: string | null;
    } | null;
    stock: number | null;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const imageUrl = product.image?.asset?.url || product.images?.[0]?.asset?.url;
    const isOutOfStock = (product.stock ?? 0) <= 0;
    const isLowStock = (product.stock ?? 0) <= 5 && !isOutOfStock;
    const { addItem } = useCartStore();

    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast.error("This product is out of stock");
            return;
        }
        addItem({
            _id: product._id,
            name: product.name ?? "Untitled Product",
            slug: product.slug ?? "",
            price: product.price ?? 0,
            imageUrl: imageUrl ?? null,
        });
        toast.success(`${product.name ?? "Product"} added to cart!`, {
            description: `$${(product.price ?? 0).toFixed(2)}`,
        });
    }

    return (
        <Card className={cn("overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 group h-full flex flex-col", isOutOfStock && "opacity-75")}>
            <CardContent className="p-0 relative aspect-square bg-gray-100">
                <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name ?? "Product Image"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {isOutOfStock && (
                            <span className="bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded">
                                Out of Stock
                            </span>
                        )}
                        {isLowStock && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                Only {product.stock} left
                            </span>
                        )}
                    </div>
                </Link>
            </CardContent>
            <CardFooter className="p-4 flex flex-col items-start gap-1 flex-grow">
                <div className="flex justify-between w-full items-start gap-2">
                    <div>
                        <Link href={`/product/${product.slug}`} className="hover:underline">
                            <h3 className="font-semibold text-lg line-clamp-1">{product.name ?? "Untitled Product"}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground capitalize">{product.category?.title ?? "Uncategorized"}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">${(product.price ?? 0).toFixed(2)}</p>
                    </div>

                </div>
                <div className="mt-8 w-full ">
                    <button onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={cn(
                            "bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 w-full cursor-pointer transition-colors",
                            isOutOfStock && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>



                </div>
            </CardFooter>
        </Card>
    );
}

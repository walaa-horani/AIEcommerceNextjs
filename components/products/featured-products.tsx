'use client';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

interface Product {
    _id: string;
    name: string | null;
    slug: string | null;
    price: number | null;
    images?: Array<{
        asset?: {
            url?: string | null;
        } | null;
    } | null> | null;
    category?: {
        title: string | null;
    } | null;
    description?: string | null;
    stock: number | null;
}

interface FeaturedProductsProps {
    products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-8">
            <div className="container mx-auto  px-4 md:px-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
                    </div>

                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 4000,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {products.map((product) => (
                                <CarouselItem key={product._id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                    <div className="p-1">
                                        <Card className="overflow-hidden border-0 shadow-none group">
                                            <CardContent className="p-0">
                                                <Link href={`/product/${product.slug}`}>
                                                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                                                        {product.images && product.images[0]?.asset?.url ? (
                                                            <Image
                                                                src={product.images[0].asset.url}
                                                                alt={product.name ?? 'Product Image'}
                                                                fill
                                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                        {(product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0 && (
                                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                Only {product.stock ?? 0} left
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 space-y-1">
                                                        <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors">
                                                            {product.name ?? 'Unknown Product'}
                                                        </h3>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-muted-foreground capitalize">
                                                                {product.category?.title ?? 'Uncategorized'}
                                                            </p>
                                                            <p className="font-semibold text-base">
                                                                ${(product.price ?? 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-4" />
                        <CarouselNext className="hidden md:flex -right-4" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}

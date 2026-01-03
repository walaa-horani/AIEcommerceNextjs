
"use client";
import { useCartStore } from '@/app/store/cart-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';
import { Check, ChevronLeft, Heart, Minus, Package, Plus, Share2, ShoppingCart, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { PRODUCT_BY_SLUG_QUERYResult } from '@/sanity.types';

// Use the Sanity-generated type, but make it non-nullable since we check for null in the page
type Product = NonNullable<PRODUCT_BY_SLUG_QUERYResult>;

interface ProductDetailsProps {
    product: Product;
}
export default function ProductDetails({ product }: ProductDetailsProps) {

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();

    const stock = product.stock ?? 0;
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= 5;

    const selectedImage = product.images?.[selectedImageIndex]?.asset?.url;

    const incrementQuantity = () => {
        if (quantity < stock) {
            setQuantity((q) => q + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((q) => q - 1);
        }
    };

    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast.error("This product is out of stock");
            return;
        }

        for (let i = 0; i < quantity; i++) {
            addItem({
                _id: product._id,
                name: product.name ?? 'Unknown Product',
                slug: product.slug ?? '',
                price: product.price ?? 0,
                imageUrl: product.images?.[0]?.asset?.url || null,
            });
        }

        toast.success(`Added ${quantity} ${product.name ?? 'item'} to cart!`, {
            description: `$${((product.price ?? 0) * quantity).toFixed(2)}`,
        });
    };





    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Products
                    </Link>
                </nav>

                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
                            {selectedImage ? (
                                <Image
                                    src={selectedImage}
                                    alt={product.name ?? 'Product image'}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    No Image Available
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.featured && (
                                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                        Featured
                                    </span>
                                )}
                                {isOutOfStock && (
                                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-white">
                                        Out of Stock
                                    </span>
                                )}
                                {isLowStock && (
                                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                                        Only {stock} left
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((image, index) => (
                                    image.asset?.url && (
                                        <button
                                            key={image._key || index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={cn(
                                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                                selectedImageIndex === index
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-transparent hover:border-gray-300"
                                            )}
                                        >
                                            <Image
                                                src={image.asset.url}
                                                alt={`${product.name ?? 'Product'} thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </button>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        {/* Category */}
                        {product.category && (
                            <Link
                                href={`/?category=${product.category.slug}`}
                                className="mb-2 text-sm font-medium text-primary hover:underline"
                            >
                                {product.category.title}
                            </Link>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="mt-4">
                            <span className="text-3xl font-bold text-primary">
                                ${product.price?.toFixed(2)}
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="mt-6 text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <Separator className="my-6" />

                        {/* Product Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.material && (
                                <div>
                                    <span className="text-gray-500">Material</span>
                                    <p className="font-medium text-gray-900">{product.material}</p>
                                </div>
                            )}
                            {product.color && (
                                <div>
                                    <span className="text-gray-500">Color</span>
                                    <p className="font-medium text-gray-900 capitalize">{product.color}</p>
                                </div>
                            )}
                            {product.dimensions && (
                                <div>
                                    <span className="text-gray-500">Dimensions</span>
                                    <p className="font-medium text-gray-900">{product.dimensions}</p>
                                </div>
                            )}
                            {product.assemblyRequired !== undefined && (
                                <div>
                                    <span className="text-gray-500">Assembly</span>
                                    <p className="font-medium text-gray-900">
                                        {product.assemblyRequired ? "Required" : "Not Required"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator className="my-6" />

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Quantity</span>
                            <div className="flex items-center rounded-lg border bg-white">
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={incrementQuantity}
                                    disabled={quantity >= stock || isOutOfStock}
                                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            {!isOutOfStock && (
                                <span className="text-sm text-gray-500">
                                    {stock} available
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex gap-4">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                size="lg"
                                className="flex-1 h-14 text-base font-semibold"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-4">
                                <Heart className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-4">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck className="h-5 w-5 text-green-600" />
                                <span>Free shipping on orders over $100</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Package className="h-5 w-5 text-blue-600" />
                                <span>Easy 30-day returns</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Check className="h-5 w-5 text-green-600" />
                                <span>Secure checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )


}
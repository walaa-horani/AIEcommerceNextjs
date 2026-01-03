"use client"
import { useCartStore } from '@/app/store/cart-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

function page() {

    const items = useCartStore((state) => state.items);
    const totalPrice = useCartStore((state) => state.totalPrice);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const handleCheckout = async () => {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        });

        const data = await res.json();
        window.location.href = data.url;
    };


    return (
        <div className='container mx-auto px-4 py-8 max-w-6xl'>
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
            </Link>

            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Order Summary - Left Column */}

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-6">Order Summary ({items.length} items)</h2>

                        {items.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Your cart is empty
                            </div>
                        ) : (
                            <div className="divide-y">
                                {items.map((item) => (
                                    <div key={item._id} className="py-6 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                                        <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover object-center"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        ${item.price.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Summary - Right Column */}

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border p-6 shadow-sm sticky top-24">
                        <h2 className="text-lg font-semibold mb-6">Payment Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${totalPrice().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-600">Calculated at checkout</span>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-base font-bold">
                                <span>Total</span>
                                <span>${totalPrice().toFixed(2)}</span>
                            </div>

                            <Button onClick={handleCheckout} className="w-full bg-black hover:bg-gray-800 text-white h-12 mt-4" size="lg">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay with Stripe
                            </Button>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                You&apos;ll be redirected to Stripe&apos;s secure checkout
                            </p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default page
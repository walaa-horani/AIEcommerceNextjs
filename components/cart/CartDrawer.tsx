"use client";

import { useCartStore } from "@/app/store/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const CartDrawer = () => {
    const isOpen = useCartStore((state) => state.isOpen);
    const closeCart = useCartStore((state) => state.closeCart);
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    // Compute totals from items - this will re-render when items change
    const totalItems = useMemo(
        () => items.reduce((total, item) => total + item.quantity, 0),
        [items]
    );
    const totalPrice = useMemo(
        () => items.reduce((total, item) => total + item.price * item.quantity, 0),
        [items]
    );

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Shopping Cart</h2>
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            {totalItems}
                        </span>
                    </div>
                    <button
                        onClick={closeCart}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="rounded-full bg-gray-100 p-6 mb-4">
                                <ShoppingBag className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Your cart is empty
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 mb-6">
                                Add some products to get started!
                            </p>
                            <Button onClick={closeCart} variant="outline">
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex gap-4 rounded-xl bg-gray-50 p-4 hover:bg-gray-100"
                                >
                                    {/* Image */}
                                    <Link
                                        href={`/product/${item.slug}`}
                                        onClick={closeCart}
                                    >
                                        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-200">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Details */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/product/${item.slug}`}
                                                onClick={closeCart}
                                                className="font-medium hover:underline line-clamp-1"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-sm font-semibold text-primary">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item._id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="p-1.5"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item._id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="p-1.5"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    removeItem(item._id)
                                                }
                                                className="p-1.5 text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t bg-gray-50 px-6 py-4 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <Link href="/checkout" onClick={closeCart}>
                            <Button className="w-full">
                                Proceed to Checkout
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;

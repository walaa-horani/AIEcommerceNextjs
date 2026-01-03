"use client";

import { useCartStore } from "@/app/store/cart-store";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
    const clearCart = useCartStore((state) => state.clearCart);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        clearCart();
    }, [clearCart]);

    if (!isMounted) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-green-50 p-6 rounded-full mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold mb-4 tracking-tight">
                Payment Successful!
            </h1>

            <p className="text-gray-600 mb-8 max-w-md">
                Thank you for your order. We've received your payment and will begin processing your order right away. A confirmation email has been sent to you.
            </p>

            <div className="flex gap-4">
                <Link href="/orders">
                    <Button variant="outline">
                        View Order
                    </Button>
                </Link>
                <Link href="/">
                    <Button className="bg-black hover:bg-gray-800 text-white">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        </div>
    );
}

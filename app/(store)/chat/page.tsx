"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

/* ======================
   Types
====================== */
type OrderItem = {
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
};

type Order = {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    items: OrderItem[];
};

type Message =
    | { role: "user"; content: string }
    | { role: "assistant"; content: string }
    | { role: "orders"; orders: Order[] };

/* ======================
   Utils
====================== */
const safeArray = <T,>(value: T[] | undefined | null): T[] =>
    Array.isArray(value) ? value : [];

/* ======================
   Component
====================== */
export default function ChatPage() {
    const { user } = useUser();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    async function sendMessage(customMessage?: string) {
        const text = customMessage ?? message;
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    clerkUserId: user?.id,
                }),
            });

            const data = await res.json();

            if (data?.type === "orders" && Array.isArray(data.orders)) {
                setMessages((prev) => [
                    ...prev,
                    { role: "orders", orders: data.orders as Order[] },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            data?.reply ??
                            "Sorry, I couldn't find any information.",
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex h-[calc(100vh-80px)] max-w-3xl flex-col p-4">
            <h1 className="mb-4 text-xl font-semibold">Order Support Chat</h1>

            {/* ======================
               Chat Box
            ====================== */}
            <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border bg-white p-4">
                {/* Empty State */}
                {messages.length === 0 && !loading && (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-gray-500">
                        <div className="text-xl font-semibold text-gray-800">
                            👋 Hi {user?.firstName ?? "there"}
                        </div>

                        <p className="max-w-xs">
                            Ask me anything about your orders, shipping, or
                            payments.
                        </p>

                        <div className="flex flex-col gap-2">
                            {[
                                "Show my recent orders",
                                "Where is my last order?",
                                "What did I buy last week?",
                            ].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => sendMessage(example)}
                                    className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => {
                    if (msg.role === "orders") {
                        return (
                            <div key={i} className="space-y-4">
                                {safeArray(msg.orders).map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-xl border bg-white p-4 shadow-sm"
                                    >
                                        <div className="mb-2 flex justify-between text-sm font-medium">
                                            <span>
                                                Order #{order.orderNumber}
                                            </span>
                                            <span className="text-gray-600">
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {safeArray(order.items).map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-12 w-12 rounded-lg border object-cover"
                                                        />

                                                        <div className="flex-1 text-sm">
                                                            <p className="font-medium">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-gray-500">
                                                                Qty:{" "}
                                                                {item.quantity}{" "}
                                                                · ${item.price}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className="mt-3 text-right text-sm font-semibold">
                                            Total: ${order.total}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    /* Text bubbles */
                    return (
                        <div
                            key={i}
                            className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                    ? "ml-auto border border-gray-300 bg-white text-gray-900 shadow-sm"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {msg.content}
                        </div>
                    );
                })}

                {/* Loading */}
                {loading && (
                    <div className="flex gap-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200" />
                    </div>
                )}
            </div>

            {/* ======================
               Input
            ====================== */}
            <div className="mt-4 flex gap-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about your order..."
                    className="flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={() => sendMessage()}
                    className="rounded-lg bg-black px-5 py-2 text-sm text-white"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import Image from "next/image";
import { ORDERS_BY_USER } from "@/sanity/queries/orders";

export default async function OrdersPage() {
    const { userId } = await auth();
    console.log("---------------- ORDER PAGE DEBUG ----------------");
    console.log("Current Auth User ID:", userId);
    console.log("--------------------------------------------------");

    if (!userId) {
        return (
            <div className="p-8 text-center text-gray-500">
                You must be signed in to view your orders.
            </div>
        );
    }

    const orders = await client.fetch(ORDERS_BY_USER, {
        clerkUserId: userId,
    });

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Orders</h1>

                {/* Debug Button - visible only in development ideally, or just for this demo */}
                <form action={async () => {
                    "use server";
                    const { cookies } = await import("next/headers");
                    // We can call the API or logic directly. 
                    // Let's just create a quick direct seeded action for simplicity if allowed, 
                    // but calling the API route from client component is easier for "Generate" flow.
                }}>
                    {/* Client side button below */}
                </form>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center">
                    <p className="text-gray-500 mb-4">You haven’t placed any orders yet.</p>

                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <Link
                            key={order._id}
                            href={`/orders/${order._id}`}
                            className="block rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Order</p>
                                    <p className="font-semibold">{order.orderNumber}</p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "paid"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {order.itemImages?.slice(0, 3).map((img: string, i: number) => (
                                        <div
                                            key={i}
                                            className="relative h-10 w-10 overflow-hidden rounded-full border bg-gray-100"
                                        >
                                            {img && (
                                                <Image
                                                    src={img}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {order.itemCount > 3 && (
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                                            +{order.itemCount - 3}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

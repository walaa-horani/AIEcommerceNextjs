import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    _id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
};

type CartState = {
    isOpen: boolean;
    items: CartItem[];
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: Omit<CartItem, "quantity">) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            isOpen: false,
            items: [],

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            addItem: (product) =>
                set((state) => {
                    const existingItem = state.items.find((item) => item._id === product._id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item._id === product._id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }
                    return {
                        items: [...state.items, { ...product, quantity: 1 }],
                    };
                }),

            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter((item) => item._id !== productId),
                })),

            updateQuantity: (productId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((item) => item._id !== productId) };
                    }
                    return {
                        items: state.items.map((item) =>
                            item._id === productId ? { ...item, quantity } : item
                        ),
                    };
                }),

            clearCart: () => set({ items: [] }),

            totalItems: () =>
                get().items.reduce((total, item) => total + item.quantity, 0),

            totalPrice: () =>
                get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: "cart-storage", // localStorage key name
            partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen
        }
    )
);

import ProductCard from "./product-card";

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

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10 text-muted-foreground"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Try adjusting your filters or search query to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}

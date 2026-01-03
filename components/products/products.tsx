import ProductGrid from "./product-grid";
import ProductFilters from "./product-filters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface Category {
    _id: string;
    title: string | null;
    slug: string | null;
}

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

interface ProductsProps {
    products: Product[];
    categories: Category[];
    searchQuery?: string;
}

export default function Products({ products, categories, searchQuery }: ProductsProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                    All Products
                    {searchQuery && <span className="text-muted-foreground ml-2 text-lg font-normal">for &quot;{searchQuery}&quot;</span>}
                </h2>
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="py-6">
                                <ProductFilters categories={categories} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-20">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                                <ProductFilters categories={categories} />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Product Grid */}
                <div className="flex-1">
                    <ProductGrid products={products} />
                </div>
            </div>
        </div>
    );
}

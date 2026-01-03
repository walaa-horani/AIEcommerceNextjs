"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface Category {
    _id: string;
    title: string | null;
    slug: string | null;
}

interface ProductFiltersProps {
    categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [priceRange, setPriceRange] = useState([
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || 5000
    ]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get("category")?.split(",") || []
    );

    // Create Query String
    const createQueryString = useCallback(
        (name: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value === null || value === "") {
                params.delete(name);
            } else {
                params.set(name, value);
            }

            return params.toString();
        },
        [searchParams]
    );

    // Debounced Search Handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get("q") || "")) {
                const params = new URLSearchParams(searchParams.toString());

                if (search) {
                    params.set("q", search);
                    // Clear category when searching to allow global search
                    params.delete("category");
                    setSelectedCategories([]);
                } else {
                    params.delete("q");
                }

                router.push(`/?${params.toString()}`, { scroll: false });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, router, searchParams]);

    // Apply Filters Handler
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Price
        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
        else params.delete("minPrice");

        if (priceRange[1] < 5000) params.set("maxPrice", priceRange[1].toString());
        else params.delete("maxPrice");

        // Categories
        if (selectedCategories.length > 0) {
            // NOTE: Sanity query in page.tsx currently expects single category slug
            // For now, we'll take the first one or logic needs to update.
            // Let's assume we want to support one category for now based on current query structure
            params.set("category", selectedCategories[0]);
        } else {
            params.delete("category");
        }

        router.push(`/?${params.toString()}`, { scroll: false });
    };

    // Handle Category Toggle
    const toggleCategory = (slug: string) => {
        const newSelectedCategories = selectedCategories.includes(slug) ? [] : [slug];
        setSelectedCategories(newSelectedCategories);

        const params = new URLSearchParams(searchParams.toString());

        // Update category param
        if (newSelectedCategories.length > 0) {
            params.set("category", newSelectedCategories[0]);
        } else {
            params.delete("category");
        }

        // Apply any pending price changes from state as well
        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
        else params.delete("minPrice");

        if (priceRange[1] < 5000) params.set("maxPrice", priceRange[1].toString());
        else params.delete("maxPrice");

        // Search is handled by its own effect effectively, but let's ensure we respect current param
        // or current state? Search effect pushes on change. 
        // If we push here, we just modify params. 
        // NOTE: Search effect relies on [search] dependency.

        router.push(`/?${params.toString()}`, { scroll: false });
    };

    // Watch for internal selection changes to trigger router push for non-text inputs
    // Or we can use a "Apply" button. Let's filter on interaction for better UX?
    // Actually, for price slider, we want debounce or apply button. 
    // For checkboxes, instant is okay.

    useEffect(() => {
        // Sync state with URL when URL changes externally (e.g. back button)
        setSearch(searchParams.get("q") || "");
        setPriceRange([
            Number(searchParams.get("minPrice")) || 0,
            Number(searchParams.get("maxPrice")) || 5000
        ]);
        const cat = searchParams.get("category");
        setSelectedCategories(cat ? [cat] : []);
    }, [searchParams]);


    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Search</h3>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Accordion type="single" collapsible defaultValue="categories" className="w-full">
                {/* Categories Filter */}
                <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-1">
                            {categories.map((category) => (
                                <div key={category._id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={category._id}
                                        checked={category.slug ? selectedCategories.includes(category.slug) : false}
                                        onCheckedChange={() => category.slug && toggleCategory(category.slug)}
                                    />
                                    <Label
                                        htmlFor={category._id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {category.title}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Filter */}
                <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-4 px-1">
                            <Slider
                                defaultValue={[0, 5000]}
                                value={priceRange}
                                max={5000}
                                step={10}
                                min={0}
                                onValueChange={setPriceRange}
                                className="my-4"
                            />
                            <div className="flex items-center gap-4">
                                <div className="grid gap-1">
                                    <Label htmlFor="min-price" className="text-xs">Min</Label>
                                    <Input
                                        id="min-price"
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="h-8"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label htmlFor="max-price" className="text-xs">Max</Label>
                                    <Input
                                        id="max-price"
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="h-8"
                                    />
                                </div>
                            </div>
                            <Button size="sm" className="w-full mt-2" onClick={applyFilters}>
                                Apply Price
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

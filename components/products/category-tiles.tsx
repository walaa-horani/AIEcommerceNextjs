import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
    _id: string;
    title: string | null;
    slug: string | null;
    image?: {
        asset?: {
            url?: string | null;
        } | null;
    } | null;
}

interface CategoryTilesProps {
    categories: Category[];
}

export default function CategoryTiles({ categories }: CategoryTilesProps) {
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full py-8 overflow-x-hidden">

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x mx-auto max-w-7xl px-4  sm:px-6 lg:px-8">
                {categories.map((category) => (
                    <Link
                        key={category._id}
                        href={`/?category=${category.slug}`}
                        className="flex-shrink-0 snap-start"
                    >
                        <Card className="w-[160px] md:w-[200px] h-[200px] md:h-[240px] border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
                            <CardContent className="p-0 h-full w-full">
                                <div className="relative h-full w-full">
                                    {category.image?.asset?.url ? (
                                        <Image
                                            src={category.image.asset.url}
                                            alt={category.title ?? "Category"}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 160px, 200px"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                                    {/* Title */}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white font-bold text-lg md:text-xl truncate">
                                            {category.title ?? "Untitled"}
                                        </h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

        </div>
    );
}

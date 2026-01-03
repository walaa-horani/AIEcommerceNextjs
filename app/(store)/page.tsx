// app/page.tsx

import { sanityFetch } from "@/sanity/lib/live";
import { ALL_CATEGORIES } from "@/sanity/queries/categories";
import { FEATURED_PRODUCTS_QUERY, FILTER_PRODUCTS_BY_NAME, FILTER_PRODUCTS_BY_PRICE_ASC, FILTER_PRODUCTS_BY_PRICE_DESC, FILTER_PRODUCTS_BY_RELEVANCE } from "@/sanity/queries/products";
import FeaturedProducts from "@/components/products/featured-products";
import CategoryTiles from "@/components/products/category-tiles";
import Products from "@/components/products/products";
import { Suspense } from "react";



interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    color?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
  }>;
}
export default async function Home({ searchParams }: PageProps) {

  const params = await searchParams;

  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const color = params.color ?? "";
  const material = params.material ?? "";
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0;
  const sort = params.sort ?? "name";
  const inStock = params.inStock === "true";


  const getQuery = () => {
    // If searching and sort is relevance, use relevance query
    if (searchQuery && sort === "relevance") {
      return FILTER_PRODUCTS_BY_RELEVANCE;
    }

    switch (sort) {
      case "price_asc":
        return FILTER_PRODUCTS_BY_PRICE_ASC;
      case "price_desc":
        return FILTER_PRODUCTS_BY_PRICE_DESC;
      case "relevance":
        return FILTER_PRODUCTS_BY_RELEVANCE;
      default:
        return FILTER_PRODUCTS_BY_NAME;
    }
  };

  // Fetch products with filters (server-side via GROQ)
  const { data: products } = await sanityFetch({
    query: getQuery(),
    params: {
      searchQuery,
      categorySlug,
      color,
      material,
      minPrice,
      maxPrice,
      inStock,
    },
  });


  // Fetch categories for filter sidebar
  const { data: categories } = await sanityFetch({
    query: ALL_CATEGORIES,
  });

  // Fetch featured products for carousel
  const { data: featuredProducts } = await sanityFetch({
    query: FEATURED_PRODUCTS_QUERY,
  });
  console.log(categories);
  console.log(products);
  console.log(featuredProducts);
  console.log('Search params:', {
    searchQuery,
    categorySlug,
    minPrice,
    maxPrice
  });
  const selectedQuery = getQuery();
  console.log('Selected query type:', {
    searchQuery,
    sort,
    queryName: selectedQuery === FILTER_PRODUCTS_BY_RELEVANCE ? 'RELEVANCE' :
      selectedQuery === FILTER_PRODUCTS_BY_PRICE_ASC ? 'PRICE_ASC' :
        selectedQuery === FILTER_PRODUCTS_BY_PRICE_DESC ? 'PRICE_DESC' : 'NAME'
  });






  return (

    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Featured Products Carousel */}
      <Suspense fallback={<div>Loading featured products...</div>}>
        <FeaturedProducts products={featuredProducts} />
      </Suspense>


      {/* Page Banner */}

      <div className="border-b pb-2 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Shop {categorySlug ? categorySlug : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Discover quality furniture designed for everyday comfort

          </p>
        </div>
        {/* Category Tiles */}
        <CategoryTiles categories={categories} />
      </div>



      {/* Products Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Products
          categories={categories}
          products={products}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}

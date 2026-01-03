import { client } from '@/sanity/lib/client';
import { PRODUCT_BY_SLUG_QUERY } from '@/sanity/queries/products';
import { notFound } from 'next/navigation';
import React from 'react'
import ProductDetails from './ProductDetails';

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;

    const product = await client.fetch(PRODUCT_BY_SLUG_QUERY, { slug });

    if (!product) {
        notFound();
    }


    return <ProductDetails product={product} />;
}

export default ProductPage
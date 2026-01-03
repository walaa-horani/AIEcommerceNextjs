import { client } from '@/sanity/lib/client';
import { ADMIN_PRODUCTS_OVERVIEW } from '@/sanity/queries/admin';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function AdminDashboard() {
    const products = await client.fetch(ADMIN_PRODUCTS_OVERVIEW);


    return (

        <div className="p-8">
            <div className='flex items-center justify-between'>
                <h1 className="mb-6 text-2xl font-semibold tracking-tight">
                    Product Stock & Pricing
                </h1>
                <Link href="/dashboard/products/new">
                    <Button variant="outline" size="lg" className="gap-2 bg-black text-white p-5">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Products Overview
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {products.map((product: any) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                                            {product.image && (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>

                                    <TableCell>
                                        £{product.price.toFixed(2)}
                                    </TableCell>

                                    <TableCell>
                                        {product.stock <= 3 ? (
                                            <Badge variant="secondary">
                                                Low ({product.stock})
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                {product.stock}
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminDashboard
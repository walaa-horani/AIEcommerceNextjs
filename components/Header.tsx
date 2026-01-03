"use client"
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { Button } from './ui/button'
import { MessageCircle, Package, ShoppingBag, User } from 'lucide-react'
import { useCartStore } from '@/app/store/cart-store'

function Header() {

    const openCart = useCartStore((state) => state.openCart)
    const items = useCartStore((state) => state.items)
    const totalItems = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items])

    return (
        <header className='sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center'>
                    <Link href='/' className='flex items-center'>
                        <Image src='/logo.png' alt='Logo' width={130} height={130} />
                    </Link>
                </div>
                <div className='flex items-center gap-2'>

                    {/* My Orders - Only when signed in */}
                    <SignedIn>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/chat" className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Ask AI</span>
                                </Link>
                            </Button>

                            <Button asChild>
                                <Link href="/orders" className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    <span className="text-sm font-medium">My Orders</span>
                                </Link>
                            </Button>
                        </div>
                    </SignedIn>

                    {/* Cart Button */}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"

                        onClick={openCart}

                    >

                        <ShoppingBag className="h-5 w-5" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                                {totalItems > 99 ? "99+" : totalItems}
                            </span>
                        )}


                    </Button>

                    <SignedIn>

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9",
                                },
                            }}


                        >

                            <UserButton.MenuItems>
                                <UserButton.Link
                                    label="My Orders"
                                    labelIcon={<Package className="h-4 w-4" />}
                                    href="/orders"
                                />
                            </UserButton.MenuItems>



                        </UserButton>


                    </SignedIn>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">Sign in</span>
                            </Button>
                        </SignInButton>
                    </SignedOut>

                </div>

            </div>
        </header>
    )
}

export default Header
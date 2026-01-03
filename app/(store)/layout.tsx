import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { SanityLive } from '@/sanity/lib/live'
import Header from '@/components/Header'
import CartDrawer from '@/components/cart/CartDrawer'
import { Chat } from '@/components/Chat'

function layout({ children }: { children: React.ReactNode }) {


    return (

        <ClerkProvider>
            <Header />
            <CartDrawer />
            <main>{children}</main>
            <Chat />
            <SanityLive />
        </ClerkProvider>
    )
}

export default layout
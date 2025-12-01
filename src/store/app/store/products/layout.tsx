import { CartProvider } from "@/app/context/CartContext";
import React from 'react';

const STOREFRONT_CATALOG_API_BASE = '/api/storefront/catalog';
const STOREFRONT_BASKET_API_BASE = '/api/storefront/basket';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider basketApiUrl={STOREFRONT_BASKET_API_BASE} catalogApiUrl={STOREFRONT_CATALOG_API_BASE}>
            {children}
        </CartProvider>
    );
}


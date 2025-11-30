import { getServiceEndpoint } from '@/service-discovery';
import { CartProvider } from "@/app/context/CartContext";
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const catalogApiUrl = getServiceEndpoint("catalog-api") || 'http://localhost:5000';
    const basketApiUrl = getServiceEndpoint("basket-api") || 'http://localhost:5001';

    return (
        <CartProvider basketApiUrl={basketApiUrl} catalogApiUrl={catalogApiUrl}>
            {children}
        </CartProvider>
    );
}


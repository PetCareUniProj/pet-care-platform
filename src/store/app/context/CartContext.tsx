'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import BasketClient, { BasketItem } from '@/lib/basket-client';

interface CartContextType {
    items: BasketItem[];
    itemCount: number;
    loading: boolean;
    error: string | null;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
    enrichItems: (catalogApiUrl: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; basketApiUrl?: string; catalogApiUrl?: string }> = ({
    children,
    basketApiUrl = '',
    catalogApiUrl = ''
}) => {
    const [items, setItems] = useState<BasketItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [basketClient] = useState(() => new BasketClient(basketApiUrl));

    // Встановлюємо catalogApiUrl в sessionStorage
    useEffect(() => {
        if (catalogApiUrl) {
            sessionStorage.setItem('catalogApiUrl', catalogApiUrl);
        }
    }, [catalogApiUrl]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const basket = await basketClient.getBasket();
            setItems(basket.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cart');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [basketClient]);

    // Fetch cart on mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const enrichItems = useCallback(async (catalogApiUrl: string) => {
        const API_BASE_URL = `${catalogApiUrl.replace(/\/+$/, '')}/api`;

        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                if (item.name && item.price) return item; // Already enriched

                try {
                    const response = await fetch(`${API_BASE_URL}/items/${item.product_id}`);
                    if (response.ok) {
                        const product = await response.json();
                        return {
                            ...item,
                            name: product.name,
                            price: product.price,
                            pictureFileName: product.pictureFileName,
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching product ${item.product_id}:`, error);
                }

                return item;
            })
        );

        setItems(enrichedItems);
    }, [items]);

    const addItem = useCallback(async (productId: number, quantity: number = 1) => {
        setError(null);
        try {
            const basket = await basketClient.addItem(productId, quantity);
            setItems(basket.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add item');
            throw err;
        }
    }, [basketClient]);

    const removeItem = useCallback(async (productId: number) => {
        setError(null);
        try {
            const basket = await basketClient.removeItem(productId);
            setItems(basket.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove item');
            throw err;
        }
    }, [basketClient]);

    const updateQuantity = useCallback(async (productId: number, quantity: number) => {
        setError(null);
        try {
            if (quantity < 1) {
                await removeItem(productId);
            } else {
                const updatedItems = items.map(item =>
                    item.product_id === productId ? { ...item, quantity } : item
                );
                const basket = await basketClient.updateBasket(updatedItems);
                setItems(basket.items);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
            throw err;
        }
    }, [items, removeItem, basketClient]);

    const clearCart = useCallback(async () => {
        setError(null);
        try {
            await basketClient.clearBasket();
            setItems([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear cart');
            throw err;
        }
    }, [basketClient]);

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            loading,
            error,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            fetchCart,
            enrichItems,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};


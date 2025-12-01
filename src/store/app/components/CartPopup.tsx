'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Loader2 } from 'lucide-react';

interface BasketItem {
    product_id: number;
    quantity: number;
    name?: string;
    price?: number;
    image?: string;
}

interface GrpcBasketItem {
    product_id: number;
    quantity: number;
}

interface CartPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onCartUpdate?: (itemCount: number) => void;
}

// gRPC API Configuration
const GRPC_BASE_URL = process.env.NEXT_PUBLIC_BASKET_GRPC_URL || 'http://localhost:5273';

// gRPC Service Implementation
class BasketGrpcService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getBasket(): Promise<GrpcBasketItem[]> {
        try {
            const response = await fetch(`${this.baseUrl}/BasketApi.Basket/GetBasket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching basket:', error);
            throw error;
        }
    }

    async updateBasket(items: GrpcBasketItem[]): Promise<GrpcBasketItem[]> {
        try {
            const response = await fetch(`${this.baseUrl}/BasketApi.Basket/UpdateBasket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    items: items,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error updating basket:', error);
            throw error;
        }
    }

    async deleteBasket(): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/BasketApi.Basket/DeleteBasket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await response.json();
        } catch (error) {
            console.error('Error deleting basket:', error);
            throw error;
        }
    }
}

const basketService = new BasketGrpcService(GRPC_BASE_URL);

const enrichBasketItems = async (grpcItems: GrpcBasketItem[]): Promise<BasketItem[]> => {
    const catalogApiOrigin = process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL ?? 'http://localhost:5251';
    const API_BASE_URL = `${catalogApiOrigin.replace(/\/+$/, '')}/api`;

    const enrichedItems = await Promise.all(
        grpcItems.map(async (item) => {
            try {
                const response = await fetch(`${API_BASE_URL}/items/${item.product_id}`);
                if (response.ok) {
                    const product = await response.json();
                    return {
                        product_id: item.product_id,
                        quantity: item.quantity,
                        name: product.name,
                        price: product.price,
                        image: product.pictureFileName ? `/images/${product.pictureFileName}` : undefined,
                    };
                }
            } catch (error) {
                console.error(`Error fetching product ${item.product_id}:`, error);
            }

            return {
                product_id: item.product_id,
                quantity: item.quantity,
                name: `Product ${item.product_id}`,
                price: 0,
            };
        })
    );

    return enrichedItems;
};

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose, onCartUpdate }) => {
    const [cartItems, setCartItems] = useState<BasketItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchBasket();
        }
    }, [isOpen]);

    useEffect(() => {
        if (onCartUpdate) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            onCartUpdate(totalItems);
        }
    }, [cartItems, onCartUpdate]);

    const fetchBasket = async () => {
        setLoading(true);
        setError(null);
        try {
            const grpcItems = await basketService.getBasket();
            const enrichedItems = await enrichBasketItems(grpcItems);
            setCartItems(enrichedItems);
        } catch (error) {
            console.error('Error fetching basket:', error);
            setError('Failed to load basket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        const previousItems = [...cartItems];
        setCartItems(prev =>
            prev.map(item =>
                item.product_id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        try {
            const grpcItems: GrpcBasketItem[] = cartItems.map(item => ({
                product_id: item.product_id === productId ? productId : item.product_id,
                quantity: item.product_id === productId ? newQuantity : item.quantity,
            }));

            await basketService.updateBasket(grpcItems);
        } catch (error) {
            console.error('Error updating basket:', error);
            setCartItems(previousItems);
            setError('Failed to update quantity. Please try again.');
        }
    };

    const removeItem = async (productId: number) => {
        const previousItems = [...cartItems];
        setCartItems(prev => prev.filter(item => item.product_id !== productId));

        try {
            const grpcItems: GrpcBasketItem[] = cartItems
                .filter(item => item.product_id !== productId)
                .map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                }));

            await basketService.updateBasket(grpcItems);
        } catch (error) {
            console.error('Error removing item:', error);
            setCartItems(previousItems);
            setError('Failed to remove item. Please try again.');
        }
    };

    const clearBasket = async () => {
        const previousItems = [...cartItems];
        setCartItems([]);

        try {
            await basketService.deleteBasket();
        } catch (error) {
            console.error('Error clearing basket:', error);
            setCartItems(previousItems);
            setError('Failed to clear basket. Please try again.');
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) =>
            total + (item.price || 0) * item.quantity, 0
        );
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-bold">Shopping Cart</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
                            <p className="text-xl font-semibold text-gray-600">Your cart is empty</p>
                            <p className="text-gray-400 mt-2">Add some items to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
                                >
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                                🐾
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-base line-clamp-1">
                                                {item.name || `Product ${item.product_id}`}
                                            </h3>
                                            <p className="text-orange-500 font-bold mt-1">
                                                ${(item.price || 0).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.product_id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-colors self-start"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 p-6 space-y-4">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium">Subtotal ({getTotalItems()} items)</span>
                            <span className="font-bold text-2xl">${getTotalPrice().toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            <button className="w-full py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition-colors">
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={clearBasket}
                                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-red-500 hover:text-red-500 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </>
    );
};

export default CartPopup;
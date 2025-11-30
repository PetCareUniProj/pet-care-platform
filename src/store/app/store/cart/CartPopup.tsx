'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

interface CartPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onCartUpdate?: (itemCount: number) => void;
    catalogApiUrl: string;
}

const CartPopup: React.FC<CartPopupProps> = ({
    isOpen,
    onClose,
    onCartUpdate,
    catalogApiUrl
}) => {
    const { items: cartItems, loading, error, updateQuantity, removeItem, clearCart, enrichItems } = useCart();
    const router = useRouter();
    const normalizedCatalogApiUrl = useMemo(() => catalogApiUrl.replace(/\/+$/, ''), [catalogApiUrl]);
    const [imageFallbacks, setImageFallbacks] = useState<Record<string, boolean>>({});

    const getItemTitle = (productId: string | number, name?: string) => name || `Product ${productId}`;

    const getItemImageSrc = (productId: string | number, name: string | undefined, pictureFileName?: string) => {
        const productKey = String(productId);

        if (imageFallbacks[productKey]) {
            const encodedTitle = encodeURIComponent(getItemTitle(productId, name));
            return `https://placehold.co/350/234532/CCCCCC?text=${encodedTitle}`;
        }

        if (pictureFileName) {
            return `${normalizedCatalogApiUrl}/images/${pictureFileName}`;
        }

        return undefined;
    };

    const handleImageError = (productId: string | number) => {
        const productKey = String(productId);

        setImageFallbacks((previous) => {
            if (previous[productKey]) {
                return previous;
            }

            return { ...previous, [productKey]: true };
        });
    };

    useEffect(() => {
        if (isOpen && cartItems.length > 0) {
            enrichItems(normalizedCatalogApiUrl);
        }
    }, [isOpen, cartItems.length, normalizedCatalogApiUrl, enrichItems]);

    useEffect(() => {
        if (onCartUpdate) {
            onCartUpdate(cartItems.reduce((sum, item) => sum + item.quantity, 0));
        }
    }, [cartItems, onCartUpdate]);

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
                            {cartItems.map((item) => {
                                const itemTitle = getItemTitle(item.product_id, item.name);
                                const imageSrc = getItemImageSrc(item.product_id, item.name, item.pictureFileName);

                                return (
                                    <div
                                        key={item.product_id}
                                        className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={itemTitle}
                                                    onError={() => handleImageError(item.product_id)}
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
                                                    {itemTitle}
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
                                );
                            })}
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
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push('/store/checkout/review');
                                }}
                                className="w-full py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={clearCart}
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


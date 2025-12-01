'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { useCart } from '@/app/context/CartContext';
import type { BrandResponse, CategoryResponse, ItemResponse } from '@/lib/api/types/catalog';

interface ProductDetailsClientProps {
    initialProduct: ItemResponse | null;
    initialBrand: BrandResponse | null;
    initialCategories: CategoryResponse[];
    catalogApiUrl: string;
    basketApiUrl: string;
    initialError?: string;
}

export default function ProductDetailsClient({
    initialProduct,
    initialBrand,
    initialCategories,
    catalogApiUrl,
    basketApiUrl,
    initialError,
}: ProductDetailsClientProps) {
    const router = useRouter();
    const { addItem } = useCart();

    const [product] = useState<ItemResponse | null>(initialProduct);
    const [brand] = useState<BrandResponse | null>(initialBrand);
    const [categories] = useState<CategoryResponse[]>(initialCategories);
    const [quantity, setQuantity] = useState(1);
    const [actionError, setActionError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [imageFallback, setImageFallback] = useState(false);
    const normalizedCatalogApiUrl = useMemo(() => catalogApiUrl.replace(/\/+$/, ''), [catalogApiUrl]);
    const pageError = initialError ?? '';

    const handleAddToCart = async () => {
        if (!product) {
            return;
        }

        try {
            setIsAddingToCart(true);
            setActionError('');

            await addItem(product.id, quantity);

            setSuccessMessage(`${product.name} was added to your cart.`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setQuantity(1);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to add item to cart.");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (product && newQuantity > 0 && newQuantity <= product.availableStock) {
            setQuantity(newQuantity);
        }
    };

    if (pageError || !product) {
        return (
            <div className="w-full bg-white">
                <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                    <Navigation catalogApiUrl={catalogApiUrl} basketApiUrl={basketApiUrl} />

                    <div className="container mx-auto px-4 py-12">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go back
                        </button>
                        <div className="bg-white rounded-lg p-8 text-center">
                            <p className="text-red-500 text-lg">{pageError || "Product not found"}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const productTitle = product.name ?? `Product ${product.id}`;
    const placeholderImage = `https://placehold.co/300x300/234532/CCCCCC?text=${encodeURIComponent(productTitle)}`;
    const productImageSrc = !imageFallback && product.pictureFileName
        ? `${normalizedCatalogApiUrl}/images/${product.pictureFileName}`
        : placeholderImage;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                <Navigation catalogApiUrl={catalogApiUrl} basketApiUrl={basketApiUrl} />

                <div className="container mx-auto px-4 py-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to products
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-[20px] p-8 flex items-center justify-center min-h-[500px]">
                            <img
                                src={productImageSrc}
                                alt={productTitle}
                                onError={() => setImageFallback(true)}
                                className="w-full h-full object-contain max-h-96"
                            />
                        </div>

                        <div className="bg-white rounded-[20px] p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                                        {brand && <p className="text-gray-600 text-lg">Brand: {brand.name}</p>}
                                    </div>
                                </div>

                                <div className="text-4xl font-bold text-orange-500 mb-4">
                                    ${product.price.toFixed(2)}
                                </div>

                                <div className="mb-6">
                                    {product.availableStock > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                            <p className="text-green-600 font-semibold">
                                                In stock ({product.availableStock} units)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                                            <p className="text-red-600 font-semibold">Out of stock</p>
                                        </div>
                                    )}
                                </div>

                                {categories.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-gray-600 text-sm mb-2">Categories:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((cat) => (
                                                <span key={cat.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.description && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold mb-3">Description</h2>
                                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                    </div>
                                )}
                            </div>

                            {product.availableStock > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <p className="text-gray-700 font-semibold">Quantity:</p>
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button onClick={() => handleQuantityChange(quantity - 1)} className="p-2 hover:bg-gray-100">
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(event) => handleQuantityChange(parseInt(event.target.value, 10) || 1)}
                                                className="w-16 text-center border-l border-r border-gray-300 py-2 outline-none"
                                                min="1"
                                                max={product.availableStock}
                                            />
                                            <button onClick={() => handleQuantityChange(quantity + 1)} className="p-2 hover:bg-gray-100">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {actionError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                            {actionError}
                                        </div>
                                    )}
                                    {successMessage && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                            {successMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                        className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                                    >
                                        {isAddingToCart ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Add to cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[20px] p-8 mb-12">
                        <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Serial Number</p>
                                <p className="font-semibold text-lg">{product.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Max stock</p>
                                <p className="font-semibold text-lg">{product.maxStockThreshold} units</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Restock threshold</p>
                                <p className="font-semibold text-lg">{product.restockThreshold} units</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">On reorder</p>
                                <p className="font-semibold text-lg">{product.onReorder ? "Yes" : "No"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}


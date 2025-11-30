'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, ArrowLeft, Minus, Plus, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopBar from "@/app/components/TopBar";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useCart } from '@/app/context/CartContext';

interface ItemResponse {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    price: number;
    pictureFileName: string | null;
    catalogBrandId: number;
    availableStock: number;
    restockThreshold: number;
    maxStockThreshold: number;
    onReorder: boolean;
    categoryIds: number[];
}

interface BrandResponse {
    id: number;
    name: string;
}

interface CategoryResponse {
    id: number;
    name: string;
}

export default function ProductPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const router = useRouter();
    const { addItem } = useCart();

    const [product, setProduct] = useState<ItemResponse | null>(null);
    const [brand, setBrand] = useState<BrandResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [catalogApiUrl, setCatalogApiUrl] = useState('');
    const [wishlist, setWishlist] = useState<number[]>([]);

    // Отримуємо API URL з sessionStorage (встановлено на сервері)
    useEffect(() => {
        const storedUrl = sessionStorage.getItem('catalogApiUrl');
        setCatalogApiUrl(storedUrl || 'http://localhost:5000');
    }, []);

    // Завантажуємо дані товару
    useEffect(() => {
        if (!slug || !catalogApiUrl) return;

        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError('');

                // Отримуємо товар
                const productResponse = await fetch(
                    `${catalogApiUrl}/api/catalog/items/${slug}`
                );

                if (!productResponse.ok) {
                    throw new Error('Товар не знайдено');
                }

                const productData: ItemResponse = await productResponse.json();
                setProduct(productData);

                // Отримуємо бренд
                if (productData.catalogBrandId) {
                    try {
                        const brandResponse = await fetch(
                            `${catalogApiUrl}/api/catalog/brand/${productData.catalogBrandId}`
                        );
                        if (brandResponse.ok) {
                            const brandData: BrandResponse = await brandResponse.json();
                            setBrand(brandData);
                        }
                    } catch (err) {
                        console.error('Помилка завантаження бренду:', err);
                    }
                }

                // Отримуємо категорії
                if (productData.categoryIds && productData.categoryIds.length > 0) {
                    try {
                        const categoriesData: CategoryResponse[] = [];
                        for (const categoryId of productData.categoryIds) {
                            const catResponse = await fetch(
                                `${catalogApiUrl}api/catalog/category/${categoryId}`
                            );
                            if (catResponse.ok) {
                                const catData: CategoryResponse = await catResponse.json();
                                categoriesData.push(catData);
                            }
                        }
                        setCategories(categoriesData);
                    } catch (err) {
                        console.error('Помилка завантаження категорій:', err);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Помилка завантаження товару');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [slug, catalogApiUrl]);

    // Завантажуємо бажаний список з localStorage
    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(storedWishlist);
    }, []);

    const handleAddToWishlist = () => {
        if (!product) return;

        const updatedWishlist = wishlist.includes(product.id)
            ? wishlist.filter(id => id !== product.id)
            : [...wishlist, product.id];

        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            setIsAddingToCart(true);
            setError('');

            await addItem(product.id, quantity);

            setSuccessMessage(`${product.name} додано до кошика!`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setQuantity(1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Помилка при додаванні до кошика');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (product && newQuantity > 0 && newQuantity <= product.availableStock) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="text-gray-600">Завантаження товару...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="w-full bg-white">
                <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                    <TopBar />
                    <Navigation catalogApiUrl={catalogApiUrl} basketApiUrl="http://localhost:5001" />


                    <div className="container mx-auto px-4 py-12">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Повернутися назад
                        </button>
                        <div className="bg-white rounded-lg p-8 text-center">
                            <p className="text-red-500 text-lg">{error || 'Товар не знайдено'}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">

            <TopBar />
            <Navigation catalogApiUrl={catalogApiUrl} basketApiUrl="http://localhost:5001" />

            <div className="container mx-auto px-4 py-8">
                {/* Кнопка повернення */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Повернутися до товарів
                </button>

                {/* Основна інформація */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Зображення товару */}
                    <div className="bg-white rounded-[20px] p-8 flex items-center justify-center min-h-[500px]">
                        {product.pictureFileName ? (
                            <img
                                src={`${catalogApiUrl}/images/${product.pictureFileName}`}
                                alt={product.name}
                                className="w-full h-full object-contain max-h-96"
                            />
                        ) : (
                            <div className="text-gray-400 text-8xl">🐾</div>
                        )}
                    </div>

                    {/* Деталі товару */}
                    <div className="bg-white rounded-[20px] p-8 flex flex-col justify-between">
                        {/* Назва та ціна */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                                    {brand && (
                                        <p className="text-gray-600 text-lg">Бренд: {brand.name}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleAddToWishlist}
                                    className={`p-3 rounded-full transition-all ${
                                        wishlist.includes(product.id)
                                            ? 'bg-red-100 text-red-500'
                                            : 'bg-gray-100 text-gray-400 hover:text-red-500'
                                    }`}
                                >
                                    <Heart className="w-6 h-6" fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {/* Ціна */}
                            <div className="text-4xl font-bold text-orange-500 mb-4">
                                ${product.price.toFixed(2)}
                            </div>

                            {/* Статус запасу */}
                            <div className="mb-6">
                                {product.availableStock > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <p className="text-green-600 font-semibold">
                                            Є в наявності ({product.availableStock} шт.)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <p className="text-red-600 font-semibold">Немає в наявності</p>
                                    </div>
                                )}
                            </div>

                            {/* Категорії */}
                            {categories.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-gray-600 text-sm mb-2">Категорії:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <span key={cat.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Опис */}
                            {product.description && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-3">Опис</h2>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Вибір кількості та додавання в кошик */}
                        {product.availableStock > 0 && (
                            <div>
                                {/* Вибір кількості */}
                                <div className="flex items-center gap-4 mb-6">
                                    <p className="text-gray-700 font-semibold">Кількість:</p>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                            className="w-16 text-center border-l border-r border-gray-300 py-2 outline-none"
                                            min="1"
                                            max={product.availableStock}
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Повідомлення */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                        {successMessage}
                                    </div>
                                )}

                                {/* Кнопка додавання в кошик */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                    className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Додавання...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            Додати до кошика
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Характеристики */}
                {product && (
                    <div className="bg-white rounded-[20px] p-8 mb-12">
                        <h2 className="text-2xl font-bold mb-6">Характеристики</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Артикул</p>
                                <p className="font-semibold text-lg">{product.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Максимум запасу</p>
                                <p className="font-semibold text-lg">{product.maxStockThreshold} шт.</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Поріг перезамовлення</p>
                                <p className="font-semibold text-lg">{product.restockThreshold} шт.</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">На замовленні</p>
                                <p className="font-semibold text-lg">{product.onReorder ? 'Так' : 'Ні'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </div>
            <Footer />
        </div>
    );
}


'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import TopBar from "@/app/components/TopBar";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useCart } from '@/app/context/CartContext';
import Link from "next/link";
import type {
    BrandResponse,
    BrandsResponse,
    CategoryResponse,
    CategoriesResponse,
    ItemResponse,
    ItemsResponse
} from "@/lib/api/types/catalog";

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

// Types

interface Pet {
    name: string;
    image: string;
    bgColor: string;
}

interface ProductCardProps {
    product: ItemResponse;
    onAddToWishlist: (product: ItemResponse) => void;
    onAddToCart: (product: ItemResponse) => void;
    catalogImageBase: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToWishlist, onAddToCart, catalogImageBase }) => {
    const [imageFallback, setImageFallback] = useState<boolean>(false);
    const productTitle = product.name ?? `Product ${product.id}`;
    const catalogImageSrc = product.pictureFileName
        ? `${catalogImageBase}/images/${product.pictureFileName}`
        : undefined;
    const imageSrc = imageFallback
        ? `https://placehold.co/350x300/234532/CCCCCC?text=${encodeURIComponent(productTitle)}`
        : catalogImageSrc;

    return (
        <Link href={`/store/products/${product.slug}`}>
            <div className="border border-gray-50 rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                <div className="w-full h-80 bg-gray-100 flex items-center justify-center relative group">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={productTitle}
                            onError={() => setImageFallback(true)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-gray-400 text-6xl">🐾</div>
                    )}
                {/* Add to cart button overlay */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onAddToCart(product);
                    }}
                    disabled={product.availableStock <= 0}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                    <div className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                        <ShoppingCart className="w-5 h-5" />
                        {product.availableStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </div>
                </button>
            </div>
            <div className="p-5 flex justify-between items-start">
                <div>
                    <div className="text-xl font-semibold mb-3">{product.name}</div>
                    <div className="text-base">${product.price?.toFixed(2) || '0.00'}</div>
                    {product.availableStock !== undefined && (
                        <div className="text-sm text-gray-500 mt-1">
                            {product.availableStock > 0 ? `In stock: ${product.availableStock}` : 'Out of stock'}
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onAddToWishlist(product);
                    }}
                    className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors group"
                >
                    <Heart className="w-5 h-5 text-orange-500 group-hover:text-white" />
                </button>
            </div>
        </div>
    </Link>
    );
};

interface PetShopProps {
    basketApiUrl: string;
    catalogApiUrl: string;
    initialItems: ItemResponse[];
    initialCategories: CategoryResponse[];
    initialBrands: BrandResponse[];
    initialTotalItems: number;
    initialPage: number;
    pageSize: number;
}

// Main Component
const PetShop: React.FC<PetShopProps> = ({
    basketApiUrl,
    catalogApiUrl,
    initialItems,
    initialCategories,
    initialBrands,
    initialTotalItems,
    initialPage,
    pageSize,
}) => {
    const API_BASE_URL = normalizeBaseUrl(catalogApiUrl);
    const { addItem: addToCart } = useCart();

    const [items, setItems] = useState<ItemResponse[]>(initialItems);
    const [categories, setCategories] = useState<CategoryResponse[]>(initialCategories);
    const [brands, setBrands] = useState<BrandResponse[]>(initialBrands);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
    const [pageSizeState] = useState<number>(pageSize);
    const [totalItems, setTotalItems] = useState<number>(initialTotalItems);
    const [sortBy, setSortBy] = useState<string>('name');

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedCategories, selectedBrands, sortBy]);

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await fetchItems();

            if (categories.length === 0) {
                await fetchCategories();
            }

            if (brands.length === 0) {
                await fetchBrands();
            }

            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    const fetchItems = async (): Promise<ItemsResponse> => {
        try {
            const params = new URLSearchParams({
                Page: currentPage.toString(),
                PageSize: pageSizeState.toString(),
                SortBy: sortBy
            });

            if (selectedCategories.length > 0) {
                params.append('CategoryId', selectedCategories[0].toString());
            }
            if (selectedBrands.length > 0) {
                params.append('BrandId', selectedBrands[0].toString());
            }

            const response = await fetch(`${API_BASE_URL}/items?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }

            const data: ItemsResponse = await response.json();
            setItems(data.items || []);
            setTotalItems(data.total || 0);

            return data;
        } catch (err) {
            console.error('Error fetching items:', err);
            setItems([]);
            throw err;
        }
    };

    const fetchCategories = async (): Promise<CategoriesResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/category?PageSize=25`);

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data: CategoriesResponse = await response.json();
            setCategories(data.items || []);

            return data;
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories([]);
            throw err;
        }
    };

    const fetchBrands = async (): Promise<BrandsResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/brand?PageSize=25`);

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const data: BrandsResponse = await response.json();
            setBrands(data.items || []);

            return data;
        } catch (err) {
            console.error('Error fetching brands:', err);
            setBrands([]);
            throw err;
        }
    };

    const toggleCategory = (categoryId: number): void => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [categoryId]
        );
        setCurrentPage(1);
    };

    const toggleBrand = (brandId: number): void => {
        setSelectedBrands(prev =>
            prev.includes(brandId)
                ? prev.filter(b => b !== brandId)
                : [brandId]
        );
        setCurrentPage(1);
    };

    const handleAddToWishlist = (product: ItemResponse): void => {
        console.log('Added to wishlist:', product);
        alert(`Added ${product.name} to wishlist!`);
    };

    const handleAddToCart = async (product: ItemResponse): Promise<void> => {
        if (product.availableStock <= 0) {
            alert('This product is out of stock');
            return;
        }

        setAddingToCart(product.id);
        try {
            await addToCart(product.id, 1);
            alert(`${product.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        } finally {
            setAddingToCart(null);
        }
    };

    const totalPages: number = Math.ceil(totalItems / pageSizeState);

    const pets: Pet[] = [
        { name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop', bgColor: 'bg-gradient-to-l from-orange-400 to-amber-500' },
        { name: 'Hamster', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Dog', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Parrot', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Rabbit', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Turtle', image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' }
    ];

    return (
        <div className="w-full bg-white">
            {/* Hero Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                <div className="w-32 h-32 absolute left-[543px] top-[229px] rotate-[-105deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />

                <TopBar />
                <Navigation basketApiUrl={basketApiUrl} catalogApiUrl={catalogApiUrl}/>

                <div className="w-full max-w-7xl relative flex flex-wrap justify-between items-center py-16 gap-8">
                    <div className="flex-1 min-w-[300px] flex flex-col gap-11">
                        <div className="flex flex-col gap-5">
                            <span className="text-orange-500 text-base font-bold uppercase">Pet shop</span>
                            <h1 className="text-black text-5xl font-bold leading-tight">If animals could talk, theyd talk about us!</h1>
                        </div>
                        <p className="text-black/80 text-base leading-6 max-w-md">Your trusted partner for quality pet products and exceptional care.</p>
                    </div>

                    <div className="relative w-[536px] h-[515px]">
                        <div className="absolute inset-0">
                            <div className="absolute w-[536px] h-[564px] left-0 top-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[100px] opacity-20" />
                            <div className="absolute w-12 h-12 left-40 top-80 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-30" />
                            <div className="absolute w-20 h-20 left-60 top-40 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl opacity-30" />
                        </div>
                        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=426&h=426&fit=crop" alt="Pet" className="absolute w-96 h-96 left-14 top-28 rounded-3xl object-cover z-10" />
                    </div>
                </div>

                <div className="w-32 h-32 absolute right-40 bottom-0 rotate-[5deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />
            </div>

            {/* Shop by Pet */}
            <div id="shop-by-pet" className="px-16 py-14">
                <div className="flex justify-between items-end mb-14">
                    <h2 className="text-4xl font-semibold">Shop by pet</h2>
                </div>

                <div className="grid grid-cols-6 gap-6 max-w-[1296px] mx-auto">
                    {pets.map((pet, index) => (
                        <div key={index} className="flex flex-col items-center gap-6 cursor-pointer group">
                            <div className={`w-44 h-48 ${pet.bgColor} rounded-2xl relative overflow-hidden`}>
                                <img
                                    src={pet.image}
                                    alt={pet.name}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 object-cover group-hover:scale-110 transition-transform"
                                />
                            </div>
                            <div className="text-xl font-semibold">{pet.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Products Section with Filters */}
            <div className="px-16 py-14 flex gap-6">
                {/* Sidebar Filters */}
                <div className="w-80 flex flex-col gap-7">
                    {/* Categories Filter */}
                    <div className="flex flex-col gap-4">
                        <div className="p-3">
                            <div className="text-xl font-semibold">Filter by categories</div>
                        </div>
                        <div className="pl-3 flex flex-col gap-2">
                            {loading && categories.length === 0 ? (
                                <div className="text-gray-500">Loading categories...</div>
                            ) : (
                                categories.map((category) => (
                                    <div key={category.id} className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={() => toggleCategory(category.id)}
                                                className="w-4 h-4 rounded border-neutral-700/50"
                                            />
                                            <span className="text-base font-medium">{category.name}</span>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Brands Filter */}
                    <div className="flex flex-col gap-4">
                        <div className="p-3">
                            <div className="text-xl font-semibold">Filter by brands</div>
                        </div>
                        <div className="pl-3 flex flex-col gap-2">
                            {loading && brands.length === 0 ? (
                                <div className="text-gray-500">Loading brands...</div>
                            ) : (
                                brands.map((brand) => (
                                    <div key={brand.id} className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={() => toggleBrand(brand.id)}
                                                className="w-4 h-4 rounded border-neutral-700/50"
                                            />
                                            <span className="text-base font-medium">{brand.name}</span>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 flex flex-col gap-14">
                    <div className="flex justify-between items-center">
                        <div className="text-gray-500 text-xl font-medium">
                            Showing {items.length > 0 ? ((currentPage - 1) * pageSizeState + 1) : 0}-{Math.min(currentPage * pageSizeState, totalItems)} of {totalItems} results
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none px-4 py-3 pr-10 rounded-md border-[1.5px] border-gray-500 text-gray-500 text-xl font-medium cursor-pointer bg-white"
                            >
                                <option value="name">Sort by name (A-Z)</option>
                                <option value="-name">Sort by name (Z-A)</option>
                                <option value="price">Sort by price (low to high)</option>
                                <option value="-price">Sort by price (high to low)</option>
                            </select>
                            <ChevronDown className="w-6 h-6 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            Error: {error}. Please check if the API is running.
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 text-xl">
                            No products found. Try adjusting your filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            {items.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToWishlist={handleAddToWishlist}
                                    onAddToCart={handleAddToCart}
                                    catalogImageBase={API_BASE_URL}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-3.5 rounded-lg border-2 border-gray-500 text-gray-500 font-medium text-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-6 h-6" />
                                Previous
                            </button>

                            <div className="flex gap-6">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 px-2 py-1.5 rounded-lg font-semibold text-xl transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-orange-500 text-white'
                                                    : 'border-2 border-gray-500 text-gray-500 hover:bg-orange-500 hover:text-white hover:border-orange-500'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-3.5 rounded-lg border-2 border-gray-500 text-gray-500 font-medium text-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PetShop;


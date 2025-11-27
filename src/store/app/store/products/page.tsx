'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Search, ChevronLeft, ChevronRight, Phone, Mail, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import TopBar from "@/app/components/TopBar";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";

const API_BASE_URL = 'https://localhost:5251/api';

// Types
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

interface ItemsResponse {
    items: ItemResponse[];
    pageSize: number;
    page: number;
    total: number;
    hasNextPage: boolean;
}

interface CategoryResponse {
    id: number;
    name: string;
}

interface CategoriesResponse {
    items: CategoryResponse[];
    pageSize: number;
    page: number;
    total: number;
    hasNextPage: boolean;
}

interface BrandResponse {
    id: number;
    name: string;
}

interface BrandsResponse {
    items: BrandResponse[];
    pageSize: number;
    page: number;
    total: number;
    hasNextPage: boolean;
}

interface Pet {
    name: string;
    image: string;
    bgColor: string;
}

interface ProductCardProps {
    product: ItemResponse;
    onAddToWishlist: (product: ItemResponse) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToWishlist }) => (
    <div className="border border-gray-50 rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow">
        <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
            {product.pictureFileName ? (
                <img src={`/images/${product.pictureFileName}`} alt={product.name} className="w-full h-full object-cover" />
            ) : (
                <div className="text-gray-400 text-6xl">🐾</div>
            )}
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
                onClick={() => onAddToWishlist(product)}
                className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors group"
            >
                <Heart className="w-5 h-5 text-orange-500 group-hover:text-white" />
            </button>
        </div>
    </div>
);

// Main Component
const PetShop: React.FC = () => {
    const [items, setItems] = useState<ItemResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [brands, setBrands] = useState<BrandResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(12);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>('-id');

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedCategories, selectedBrands, sortBy]);

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await Promise.all([
                fetchItems(),
                fetchCategories(),
                fetchBrands()
            ]);

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
                PageSize: pageSize.toString(),
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
            const response = await fetch(`${API_BASE_URL}/category?PageSize=100`);

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
            const response = await fetch(`${API_BASE_URL}/brand?PageSize=100`);

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

    const totalPages: number = Math.ceil(totalItems / pageSize);

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
                <Navigation />

                <div className="w-full max-w-7xl relative flex flex-wrap justify-between items-center py-16 gap-8">
                    <div className="flex-1 min-w-[300px] flex flex-col gap-11">
                        <div className="flex flex-col gap-5">
                            <span className="text-orange-500 text-base font-bold uppercase">Pet shop</span>
                            <h1 className="text-black text-5xl font-bold leading-tight">If animals could talk, they'd talk about us!</h1>
                        </div>
                        <p className="text-black/80 text-base leading-6 max-w-md">Your trusted partner for quality pet products and exceptional care.</p>
                        <button className="px-10 py-4 bg-neutral-950 rounded-xl text-white text-xl font-semibold hover:bg-neutral-800 transition-colors w-fit">
                            Shop Now
                        </button>
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
            <div className="px-16 py-14">
                <div className="flex justify-between items-end mb-14">
                    <h2 className="text-4xl font-semibold">Shop by pet</h2>
                    <div className="flex gap-10">
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center rotate-180 hover:bg-orange-500 transition-colors">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </div>
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
                            Showing {items.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none px-4 py-3 pr-10 rounded-md border-[1.5px] border-gray-500 text-gray-500 text-xl font-medium cursor-pointer bg-white"
                            >
                                <option value="-id">Sort by latest</option>
                                <option value="id">Sort by oldest</option>
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

            {/* Banner Section */}
            <div className="py-14 flex justify-center gap-6">
                <img
                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=636&h=360&fit=crop"
                    alt="Banner"
                    className="w-[636px] h-96 object-cover rounded-[20px]"
                />
                <div className="w-[636px] h-96 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[20px] flex items-center justify-center text-white text-2xl font-bold">
                    Special Offers
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PetShop;
'use client'

import React, { useState } from 'react';
import { ShoppingCart, Heart, Search, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import TopBar from "@/app/components/TopBar";
import Image from "next/image";

export default function Home() {
    const [cartCount] = useState(0);
    const [wishlistCount] = useState(0);

    const categories = [
        { name: 'Accessories', products: 84, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop' },
        { name: 'Food', products: 64, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop' },
        { name: 'Furniture', products: 22, image: 'https://images.unsplash.com/photo-1605641443757-98e0ad36f560?w=400&h=300&fit=crop' },
        { name: 'Bags', products: 16, image: 'https://images.unsplash.com/photo-1553688738-a278b9f063e0?w=400&h=300&fit=crop' }
    ];

    const featuredProducts = [
        { name: 'Premium Dog Food', price: '$19.99', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop' },
        { name: 'Premium Cat Food', price: '$19.99', image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400&h=400&fit=crop' },
        { name: 'Premium Dog Food', price: '$19.99', image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=400&fit=crop' }
    ];

    const bestSellers = [
        { name: 'Cat Bowl', price: '$20.99', image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=300&h=300&fit=crop' },
        { name: 'Cat Bowl', price: '$49.99', image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&h=300&fit=crop' },
        { name: 'Dog Leash', price: '$9.99', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop' },
        { name: 'Premium Cat Food', price: '$19.99', image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=300&h=300&fit=crop' },
        { name: 'Dog Bowl', price: '$19.99', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop' },
        { name: 'Premium Dog Food', price: '$29.99', image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=300&h=300&fit=crop' },
        { name: 'Dog Bed', price: '$49.99', image: 'https://images.unsplash.com/photo-1605641443757-98e0ad36f560?w=300&h=300&fit=crop' },
        { name: 'Premium Dog Food', price: '$19.99', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop' }
    ];

    const pets = [
        { name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop', bgColor: 'bg-gradient-to-l from-orange-400 to-amber-500' },
        { name: 'Hamster', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Dog', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Parrot', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Rabbit', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' },
        { name: 'Turtle', image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&h=200&fit=crop', bgColor: 'bg-gray-50' }
    ];

    const blogPosts = [
        { date: '24 May, 2024', title: 'Urna cras et mauris congue nunc nisi nec tempus cursus', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop' },
        { date: '24 May, 2024', title: 'Id tellus dignissim eu nisl aliquam. Massa id interdum', image: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop' },
        { date: '24 May, 2024', title: 'mus cursus pellentesque blandit tortor suspendisse ornare', image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400&h=400&fit=crop' }
    ];

    return (
        <div className="w-full bg-white">
            {/* Hero Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                {/* Decorative shapes */}
                <div className="w-32 h-32 absolute left-[543px] top-[229px] rotate-[-105deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />

                {/* Top Bar */}
                <TopBar />

                {/* Navigation */}
                <Navigation/>

                {/* Hero Content */}
                <div className="w-full max-w-7xl relative flex flex-wrap justify-between items-center gap-8">
                    <div className="flex-1 min-w-[300px] flex flex-col gap-11">
                        <div className="flex flex-col gap-5">
                            <span className="text-orange-500 text-base font-bold uppercase">Pet shop</span>
                            <h1 className="text-black text-5xl font-bold leading-tight">If animals could talk, they'd talk about us!</h1>
                        </div>
                        <p className="text-black/80 text-base leading-6 max-w-md">At et vehicula sodales est proin turpis pellentesque sinulla a aliquam amet rhoncus quisque eget sit</p>
                        <button className="px-10 py-4 bg-neutral-950 rounded-xl text-white text-xl font-semibold hover:bg-neutral-800 transition-colors w-fit">
                            Shop Now
                        </button>
                    </div>

                    <div className="relative w-[536px] h-[610px]">
                        <div className="absolute inset-0">
                            {/*<div className="absolute w-[536px] h-[564px] left-0 top-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[100px] opacity-20" />*/}
                            <Image
                                src="/shape.svg"
                                width={937}
                                height={902}
                                alt="SVG background"
                                className="absolute left-10"
                            />
                            <div className="absolute w-12 h-12 left-40 top-80 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-30" />
                            <div className="absolute w-20 h-20 left-60 top-40 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl opacity-30" />
                        </div>
                        <Image
                            src="/home-header-dogs.png"
                            width={626}
                            height={626}
                            alt="SVG background"
                            className="absolute left-42 bottom-0 rounded-3xl object-cover z-10"
                        />
                    </div>
                </div>

                {/* Decorative shapes bottom */}
                {/*<div className="w-32 h-32 absolute right-40 bottom-0 rotate-[5deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />*/}
                <div className="w-24 h-28 absolute -left-16 bottom-20 rotate-[-83deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />
            </div>

            {/* Browse by Category */}
            <div className="px-80 py-14">
                <div className="flex justify-between items-start mb-14">
                    <h2 className="text-4xl font-semibold">Browse by category</h2>
                    <div className="flex gap-10">
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center rotate-180 hover:bg-orange-500 transition-colors">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <div key={index} className="rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                            <img src={category.image} alt={category.name} className="w-full h-52 object-cover" />
                            <div className="bg-gray-50 p-5 flex justify-between items-start">
                                <div>
                                    <div className="text-xl font-semibold mb-3">{category.name}</div>
                                    <div className="text-black/60">{category.products} products</div>
                                </div>
                                <button className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                                    <span className="text-orange-500">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Products */}
            <div className="px-80 py-14 pb-28">
                <h2 className="text-4xl font-semibold text-center mb-14">Featured products</h2>
                <div className="grid grid-cols-3 gap-6">
                    {featuredProducts.map((product, index) => (
                        <div key={index} className="border border-gray-50 rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow">
                            <img src={product.image} alt={product.name} className="w-full h-96 object-cover" />
                            <div className="p-5 flex justify-between items-start">
                                <div>
                                    <div className="text-xl font-semibold mb-3">{product.name}</div>
                                    <div className="text-base font-semibold">{product.price}</div>
                                </div>
                                <button className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors group">
                                    <Heart className="w-5 h-5 text-orange-500 group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Shopping Section */}
            <div className="px-80 py-28 bg-gray-50 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[468px] h-[498px] bg-gradient-to-l from-orange-400 to-amber-500 rotate-[167deg] opacity-30" />

                <div className="relative z-10 max-w-xl">
                    <div className="text-orange-500 text-base font-bold uppercase mb-5">Pet shop</div>
                    <h2 className="text-4xl font-bold mb-10 leading-tight">
                        The smarter way to shop<br/>for your pet
                    </h2>
                    <p className="text-black/80 mb-14 leading-6">
                        Lorem ipsum dolor sit amet consectetur. At et vehicula sodales est proin turpis pellentesque sinulla a aliquam amet rhoncus quisque eget sit
                    </p>
                    <button className="px-10 py-4 bg-black text-white rounded-xl text-xl font-semibold hover:bg-neutral-800 transition-colors">
                        Learn More
                    </button>
                </div>

                <img
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop"
                    alt="Pet"
                    className="absolute right-40 top-1/2 -translate-y-1/2 w-96 h-96 object-cover rounded-3xl"
                />
            </div>

            {/* Best Selling Products */}
            <div className="px-80 py-14">
                <h2 className="text-4xl font-semibold text-center mb-14">Best selling products</h2>
                <div className="grid grid-cols-4 gap-6">
                    {bestSellers.map((product, index) => (
                        <div key={index} className="border border-gray-50 rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow">
                            <img src={product.image} alt={product.name} className="w-full h-80 object-cover" />
                            <div className="p-5 flex justify-between items-start">
                                <div>
                                    <div className="text-xl font-semibold mb-3">{product.name}</div>
                                    <div className="text-base">{product.price}</div>
                                </div>
                                <button className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors group">
                                    <Heart className="w-5 h-5 text-orange-500 group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shop by Pet */}
            <div className="px-80 py-14">
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

                <div className="grid grid-cols-6 gap-6">
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

            {/* News & Blog */}
            <div className="px-80 py-14">
                <h2 className="text-4xl font-semibold text-center mb-14">News & Blog</h2>
                <div className="grid grid-cols-3 gap-6">
                    {blogPosts.map((post, index) => (
                        <div key={index} className="rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                            <div className="relative h-96">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                <div className="absolute top-5 left-5 bg-black text-white px-6 py-2 rounded-[20px] text-base font-semibold">
                                    News
                                </div>
                            </div>
                            <div className="py-5">
                                <div className="text-black/60 mb-3 capitalize">{post.date}</div>
                                <div className="text-xl font-semibold capitalize leading-8">{post.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-80 py-16 bg-gray-50 relative overflow-hidden">
                <div className="absolute right-0 top-[327px] w-44 h-48 bg-gradient-to-l from-orange-400 to-amber-500 rotate-[12.88deg]" />

                <div className="relative grid grid-cols-5 gap-8 mb-14">
                    <div className="col-span-2">
                        <div className="text-xl font-bold mb-5">🐾 Pet Shop</div>
                        <p className="text-black mb-5 leading-5">
                            Sed viverra eget fames sit varius. Pellentesque mattis libero viverra dictumst ornaresed justo convallis vitae
                        </p>
                        <div className="flex gap-5">
                            <div className="w-6 h-6 bg-black rounded" />
                            <div className="w-6 h-6 bg-black rounded" />
                            <div className="w-6 h-6 bg-black rounded" />
                            <div className="w-6 h-6 bg-black rounded" />
                        </div>
                    </div>

                    <div>
                        <div className="font-semibold mb-5">Company</div>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="hover:text-orange-500 transition-colors">About Us</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Blog</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Gift cards</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Careers</a>
                        </div>
                    </div>

                    <div>
                        <div className="font-semibold mb-5">Useful Links</div>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="hover:text-orange-500 transition-colors">New products</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Best sellers</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Discount</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">F.A.Q</a>
                        </div>
                    </div>

                    <div>
                        <div className="font-semibold mb-5">Customer Service</div>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Shipping</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Returns</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Order tracking</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-black/10 pt-8 flex justify-between items-center">
                    <div className="text-black/50 text-sm">
                        © Copyright Pet Shop 2024. Design by Figma.guru
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-8 bg-black/80 rounded" />
                        <div className="w-12 h-8 bg-black/80 rounded" />
                        <div className="w-12 h-8 bg-black/80 rounded" />
                        <div className="w-12 h-8 bg-black/80 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
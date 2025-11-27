'use client'

import React from 'react';
import { Search, ShoppingBag, Heart, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Navigation from "@/app/components/Navigation";
import TopBar from "@/app/components/TopBar";

export default function PetShopAbout() {
    return (
        <div className="w-full bg-white flex flex-col items-center overflow-hidden">
            {/* Hero Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                {/* Decorative shapes */}
                <div className="w-32 h-32 absolute left-[543px] top-[229px] rotate-[-105deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />

                {/* Top Bar */}
                <TopBar />

                {/* Navigation */}
                <Navigation/>

                {/* Hero Content */}
                <div className="w-full max-w-7xl relative flex flex-wrap justify-between items-center py-16 gap-8">
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

                    <div className="relative w-[536px] h-[515px]">
                        <div className="absolute inset-0">
                            <div className="absolute w-[536px] h-[564px] left-0 top-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[100px] opacity-20" />
                            <div className="absolute w-12 h-12 left-40 top-80 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-30" />
                            <div className="absolute w-20 h-20 left-60 top-40 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl opacity-30" />
                        </div>
                        <img src="https://placehold.co/426x426" alt="Pet" className="absolute w-96 h-96 left-14 top-28 rounded-3xl object-cover z-10" />
                        <img src="https://placehold.co/142x142" alt="Decoration" className="absolute w-36 h-36 right-0 top-10 rounded-full object-cover z-10" />
                    </div>
                </div>

                {/* Decorative shapes bottom */}
                <div className="w-32 h-32 absolute right-40 bottom-0 rotate-[5deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />
                <div className="w-24 h-28 absolute -left-16 bottom-20 rotate-[-83deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />
            </div>

            {/* About Store Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-14 flex flex-col gap-12">
                <div className="flex flex-col gap-10">
                    <h2 className="text-black text-4xl font-semibold">About our store</h2>
                    <div className="flex flex-wrap gap-28">
                        <p className="flex-1 min-w-[300px] text-black/80 text-base leading-6">
                            At et vehicula sodales est proin turpis pellentesque sinulla a aliquam amet rhoncus quisque eget sit. Sociis blandit et pellentesque aliquet at quisque tortor lacinia nullam. Mattis aenean scelerisque dui libero cras arcu in egestas sagittis.
                        </p>
                        <p className="flex-1 min-w-[300px] text-black/80 text-base leading-6">
                            Aliquet ultrices risus dolor gravida. Faucibus sodales semper a magnis sapien viverra purus sed tortor. Amet risus blandit nunc odio rutrum. Adipiscing tincidunt imperdiet at cursus ipsum vulputate pharetra. Tellus nulla commodo ut ut auctor orci blandit at elit. Turpis pulvinar sagittis tristique aliquam vitae ipsum dui.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-4">
                        <span className="text-orange-500 text-3xl font-semibold">2k+</span>
                        <span className="text-black/80 text-base">Happy Clients</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-orange-500 text-3xl font-semibold">72</span>
                        <span className="text-black/80 text-base">Brands</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-orange-500 text-3xl font-semibold">1.8k+</span>
                        <span className="text-black/80 text-base">Products</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-orange-500 text-3xl font-semibold">28</span>
                        <span className="text-black/80 text-base">Years in business</span>
                    </div>
                </div>
            </div>

            {/* Founder Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-14 flex flex-wrap gap-28">
                <img src="https://placehold.co/550x580" alt="Founder" className="w-full md:w-[550px] h-[580px] rounded-[20px] object-cover" />
                <div className="flex-1 py-20 flex flex-col gap-6">
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-5">
                            <h3 className="text-black text-4xl font-semibold">Taylor Joshua</h3>
                            <span className="text-black/60 text-base font-semibold">Founder</span>
                        </div>
                        <p className="text-black/80 text-base leading-6">
                            Nisl nunc vitae integer ridiculus ultrices quam a scelerisque est. Sollicitudin volutpat blandit maecenas ornare dictum tempor. Amet sem non rutrum et duis. Id nisi ac vitae enim neque sapien.<br/><br/>
                            Eu arcu consectetur etiam bibendum fermentum sed lobortis fringilla imperdiet. Aliquet ultrices risus dolor gravida. Faucibus sodales semper a magnis sapien viverra purus sed tortor. Amet risus blandit nunc odio rutrum. Adipiscing tincidunt imperdiet at cursus ipsum vulputate pharetra.
                        </p>
                    </div>
                    <img src="https://placehold.co/186x101" alt="Signature" className="w-48 h-24" />
                </div>
            </div>

            {/* Team Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 pt-14 pb-28 flex flex-col items-center gap-10">
                <h2 className="text-black text-4xl font-semibold">Our Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Caroline Washington', role: 'Seller' },
                        { name: 'Gerald Ferguson', role: 'Seller' },
                        { name: 'Averi Maddox', role: 'Seller' }
                    ].map((member, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-6">
                            <img src="https://placehold.co/416x416" alt={member.name} className="w-full max-w-[416px] h-[416px] rounded-[20px] object-cover" />
                            <div className="flex flex-col items-center gap-5">
                                <h4 className="text-black text-2xl font-semibold">{member.name}</h4>
                                <span className="text-black/60 text-base font-semibold">{member.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-12 relative overflow-hidden">
                <div className="flex flex-wrap gap-16 items-center">
                    <div className="flex-1 min-w-[300px] flex flex-col gap-10">
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col gap-5">
                                <span className="text-orange-500 text-base font-bold uppercase">Testimonials</span>
                                <h2 className="text-black text-4xl font-semibold">What people say about us</h2>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-6 h-6 text-orange-400">★</div>
                                    ))}
                                </div>
                                <p className="text-black/80 text-xl leading-8">
                                    Morbi viverra eleifend in cras orci a leo tellus. Nunc purus adipiscing diam aliquet lorem nunc. Ipsum euismod risus amet eget non. Pulvinar condimentum ultricies tellus a non pellentesque odio pellentesque blandit. Aliquet et massa eget vitae justo tellus donec ac enim.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-5">
                                <h4 className="text-black text-2xl font-semibold">Gerald Ferguson</h4>
                                <span className="text-black/60 text-base font-semibold">Customer</span>
                            </div>
                            <div className="flex gap-10">
                                <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <img src="https://placehold.co/366x366" alt="Customer" className="w-[366px] h-[366px] rounded-full object-cover" />
                </div>

                {/* Decorative shapes */}
                <div className="absolute right-0 top-0 w-[477px] h-[509px] bg-gradient-to-l from-orange-400 to-amber-500 rounded-[100px] opacity-10 rotate-[97deg]" />
            </div>

            {/* Video Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 pt-28 pb-14 flex flex-col items-center">
                <div className="w-full max-w-7xl h-[680px] bg-black/20 rounded-[40px] flex items-center justify-center gap-2.5 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Instagram Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-14 flex flex-col items-center gap-14">
                <h2 className="text-black text-4xl font-semibold">Follow our instagram</h2>
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, idx) => (
                        <img key={idx} src="https://placehold.co/306x306" alt={`Instagram ${idx + 1}`} className="w-full h-80 rounded-[20px] object-cover" />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-16 bg-gray-50 relative overflow-hidden">
                <div className="flex flex-col gap-14">
                    <div className="flex flex-wrap justify-between gap-8">
                        <div className="flex flex-col gap-5 max-w-xs">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-5 h-3.5 bg-black rounded" />
                                    <div className="w-1.5 h-2 bg-black rounded" />
                                    <div className="w-1 h-2 bg-black rounded" />
                                    <div className="w-1.5 h-2 bg-black rounded" />
                                    <div className="w-1.5 h-2 bg-black rounded" />
                                </div>
                                <span className="text-black text-xl font-bold">Pet Shop</span>
                            </div>
                            <p className="text-black text-base leading-5">Sed viverra eget fames sit varius. Pellentesque mattis libero viverra dictumst ornaresed justo convallis vitae</p>
                            <div className="flex gap-5">
                                <Facebook className="w-6 h-6 cursor-pointer hover:text-orange-500" />
                                <Twitter className="w-6 h-6 cursor-pointer hover:text-orange-500" />
                                <Instagram className="w-6 h-6 cursor-pointer hover:text-orange-500" />
                                <Youtube className="w-6 h-6 cursor-pointer hover:text-orange-500" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Company</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-black text-base hover:text-orange-500">About Us</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Blog</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Gift cards</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Careers</a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Useful Links</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-black text-base hover:text-orange-500">New products</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Best sellers</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Discount</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">F.A.Q</a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Customer Service</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-black text-base hover:text-orange-500">Contact Us</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Shipping</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Returns</a>
                                <a href="#" className="text-black text-base hover:text-orange-500">Order tracking</a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Store</h4>
                            <div className="flex flex-col gap-5">
                                <p className="text-black text-base font-medium leading-5">8592 Fairground St.<br/>Tallahassee, FL 32303</p>
                                <div className="flex flex-col gap-1">
                                    <span className="text-black text-base font-medium">+775 378-6348</span>
                                    <span className="text-black text-base font-medium">rgarton@outlook.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 pt-8 border-t border-black/10">
                        <p className="text-black/50 text-sm">© Copyright Pet Shop 2024. Design by Figma.guru</p>
                        <div className="h-6 w-64 bg-black/80 rounded" />
                    </div>
                </div>

                {/* Decorative shape */}
                <div className="absolute right-0 top-80 w-44 h-48 bg-gradient-to-l from-orange-400 to-amber-500 rounded-[40px] opacity-20 rotate-[13deg]" />
            </div>
        </div>
    );
}
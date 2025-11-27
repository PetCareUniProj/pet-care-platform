'use client'

import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Clock } from 'lucide-react';
import Navigation from "@/app/components/Navigation";
import TopBar from "@/app/components/TopBar";

export default function PetShopContact() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Message sent successfully!');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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
                        <img src="https://placehold.co/381x462" alt="Pet" className="absolute w-96 h-[462px] left-[90px] top-[133px] rounded-3xl object-cover z-10" />
                        <img src="https://placehold.co/142x142" alt="Decoration" className="absolute w-36 h-36 right-0 top-10 rounded-full object-cover z-10" />
                    </div>
                </div>

                {/* Decorative shapes bottom */}
                <div className="w-32 h-32 absolute right-40 bottom-0 rotate-[5deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />
                <div className="w-24 h-28 absolute -left-16 bottom-20 rotate-[-83deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />
            </div>

            {/* Contact Form & Info Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-14 flex flex-wrap justify-center gap-28">
                {/* Contact Form */}
                <div className="w-full md:w-[550px] p-10 bg-gray-50 rounded-[20px] flex flex-col gap-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-wrap gap-6">
                            <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                                <label className="text-black text-base font-semibold">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    className="px-4 py-2 bg-white rounded-md text-base outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                                <label className="text-black text-base font-semibold">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    className="px-4 py-2 bg-white rounded-md text-base outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-black text-base font-semibold">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="E-mail address"
                                className="px-4 py-2 bg-white rounded-md text-base outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-black text-base font-medium">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your message..."
                                rows={6}
                                className="px-4 py-2 bg-white rounded-md text-base outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-60 px-5 py-3.5 bg-orange-500 rounded-lg text-white text-base font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="w-full md:w-[636px] flex flex-col gap-10">
                    <div className="flex flex-col gap-10">
                        <h2 className="text-black text-4xl font-semibold leading-[48px]">Feel free to contact us</h2>
                        <p className="text-black/80 text-base leading-6">
                            At et vehicula sodales est proin turpis pellentesque sinulla a aliquam<br />
                            amet rhoncus quisque eget sit. Sociis blandit et pellentesque aliquet at quisque tortor lacinia nullam
                        </p>
                    </div>

                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">8592 Fairground St. Tallahassee, FL 32303</span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">rgarton@outlook.com</span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">+775 378-6348</span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">Mon - Fri: 10AM - 10PM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-14 flex flex-col items-center">
                <div className="w-full h-96 bg-gray-200 rounded-[20px] relative overflow-hidden">
                    {/* Map Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-orange-500 rounded-lg flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    {/* You can integrate Google Maps or any other map service here */}
                    <iframe
                        title="Store Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3446.123456789!2d-84.123456!3d30.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDA3JzI0LjQiTiA4NMKwMDcnMjQuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="rounded-[20px]"
                    />
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
                                <Facebook className="w-6 h-6 cursor-pointer hover:text-orange-500 transition-colors" />
                                <Twitter className="w-6 h-6 cursor-pointer hover:text-orange-500 transition-colors" />
                                <Instagram className="w-6 h-6 cursor-pointer hover:text-orange-500 transition-colors" />
                                <Youtube className="w-6 h-6 cursor-pointer hover:text-orange-500 transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Company</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">About Us</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Blog</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Gift cards</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Careers</a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Useful Links</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">New products</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Best sellers</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Discount</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">F.A.Q</a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-black text-base font-semibold">Customer Service</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Contact Us</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Shipping</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Returns</a>
                                <a href="#" className="text-black text-base hover:text-orange-500 transition-colors">Order tracking</a>
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
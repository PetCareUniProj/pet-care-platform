'use client'

import React, { useState } from 'react';
import { Search, ShoppingBag, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Clock } from 'lucide-react';
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import NavLink from "@/app/components/NavLink";
import Image from "next/image";

interface PetShopContactProps {
    basketApiUrl: string;
    catalogApiUrl: string;
}

export const PetShopContact : React.FC<PetShopContactProps> = ({
                                                                 basketApiUrl,
                                                                 catalogApiUrl,}
)=>  {
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
            {/* Hero Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 relative bg-gray-50 flex flex-col items-center overflow-hidden">
                {/* Decorative shapes */}
                <div className="w-32 h-32 absolute left-[543px] top-[229px] rotate-[-105deg] bg-gradient-to-l from-orange-400 to-amber-500 rounded-lg opacity-30" />

                {/* Navigation */}
                <Navigation basketApiUrl={basketApiUrl} catalogApiUrl={catalogApiUrl}/>

                {/* Hero Content */}
                <div className="w-full max-w-7xl relative flex flex-wrap justify-between items-center gap-8">
                    <div className="flex-1 min-w-[300px] flex flex-col gap-11">
                        <div className="flex flex-col gap-5">
                            <span className="text-orange-500 text-base font-bold uppercase">Pet shop</span>
                            <h1 className="text-black text-5xl font-bold leading-tight">If animals could talk, they'd talk about us!</h1>
                        </div>
                        <p className="text-black/80 text-base leading-6 max-w-md">Trusted by pet owners, loved by pets. We are dedicated to providing premium supplies and exceptional care advice for every animal companion.</p>
                        <NavLink href="/store/products">
                            <button className="px-10 py-4 bg-neutral-950 rounded-xl text-white text-xl font-semibold hover:bg-neutral-800 transition-colors w-fit">
                                Shop Now
                            </button>
                        </NavLink>
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

            {/* Info Section */}
            <div className="w-full px-4 md:px-20 lg:px-80 py-14 flex flex-wrap justify-center gap-28">

                {/* Contact Information */}
                <div className="w-full md:w-[636px] flex flex-col gap-10">
                    <div className="flex flex-col gap-10">
                        <h2 className="text-black text-4xl font-semibold leading-[48px]">Feel free to contact us</h2>
                        <p className="text-black/80 text-base leading-6">
                            Founded in Kyiv, Ukraine, with a deep love for all animals.<br />
                            We are dedicated to delivering the highest quality supplies and compassionate service to every corner of the country and beyond.
                        </p>
                    </div>

                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">24 Khreshchatyk St, Kyiv, 01001, Ukraine</span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">info@petshopname.ua</span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-black text-xl font-semibold leading-5">+380 44 123 4567</span>
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
                    <iframe 
                    title="Store Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2136.357761934853!2d30.521516064196234!3d50.44907513699611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce56b2456d3b%3A0xd062ae171b57e947!2z0LLRg9C70LjRhtGPINCl0YDQtdGJ0LDRgtC40LosINCa0LjRl9CyLCAwMjAwMA!5e0!3m2!1suk!2sua!4v1764542730576!5m2!1suk!2sua" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen 
                    loading="lazy" 
                    className="rounded-[20px]"
                    />
                </div>
            </div>

            {/* Footer */}
            <Footer/>
        </div>
    );
}
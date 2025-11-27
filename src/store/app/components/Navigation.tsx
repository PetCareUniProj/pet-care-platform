"use client";

import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import NavLink from "./NavLink";
import { useState } from "react";

interface NavigationProps {
    cartCount?: number;
    wishlistCount?: number;
}

const Navigation: React.FC<NavigationProps> = ({
                                                   cartCount = 0,
                                                   wishlistCount = 0,
                                               }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white rounded-[40px] shadow-lg px-10 py-6 flex justify-between items-center relative">

            {/* LEFT — LOGO */}
            <div className="text-xl font-bold">🐾 Pet Shop</div>

            {/* MOBILE BURGER */}
            <button className="lg:hidden" onClick={() => setOpen(!open)}>
                {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>

            {/* NAVIGATION */}
            <nav
                className={`flex gap-6 absolute lg:static left-0 top-full w-full lg:w-auto bg-white lg:bg-transparent 
                    flex-col lg:flex-row items-center lg:items-start p-6 lg:p-0 
                    transition-all duration-300 shadow-lg lg:shadow-none
                    ${open ? "opacity-100 visible" : "opacity-0 invisible lg:opacity-100 lg:visible"}`}
            >
                <NavLink href="/">Home</NavLink>
                <NavLink href="/store/products">Shop</NavLink>
                <NavLink href="/about">About Us</NavLink>
                <NavLink href="/contact">Contact Us</NavLink>
            </nav>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex items-center gap-6">

                {/* Search */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 w-72">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="flex-1 bg-transparent outline-none text-sm"
                    />
                    <button className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Cart/Wishlist */}
                <div className="flex gap-6">
                    <button className="relative">
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
                    </button>

                    <button className="relative">
                        <Heart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navigation;

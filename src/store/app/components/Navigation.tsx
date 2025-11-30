"use client";

import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import NavLink from "./NavLink";
import { useState, useRef, useEffect, useMemo } from "react";
import CartPopup from "@/app/store/cart/CartPopup";

interface ItemResponse {
    id: number;
    slug: string;
    name: string;
    price: number;
    pictureFileName: string | null;
}

interface NavigationProps {
    cartCount?: number;
    wishlistCount?: number;
    basketApiUrl: string;
    catalogApiUrl: string;
}

const Navigation: React.FC<NavigationProps> = ({
                                                   cartCount: initialCartCount = 0,
                                                   wishlistCount = 0,
                                                   basketApiUrl,
                                                   catalogApiUrl,
                                               }) => {
    const normalizedCatalogApiUrl = useMemo(() => catalogApiUrl.replace(/\/+$/, ''), [catalogApiUrl]);
    const [open, setOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(initialCartCount);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ItemResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Пошук товарів
    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `${normalizedCatalogApiUrl}/items?Name=${encodeURIComponent(query)}&PageSize=5`
            );
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.items || []);
                setShowResults(true);
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Закриття результатів при кліку поза пошуком
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
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
                    <NavLink href="/contact">Contact Us</NavLink>
                </nav>

                {/* RIGHT SIDE */}
                <div className="hidden lg:flex items-center gap-6">
                    {/* Search */}
                    <div ref={searchRef} className="relative w-72">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() =>
                                    searchQuery && setShowResults(true)
                                }
                                className="flex-1 bg-transparent outline-none text-sm"
                            />
                            <button className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Результати пошуку */}
                        {showResults && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Пошук...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="divide-y">
                                        {searchResults.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`/store/products/${item.slug}`}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() =>
                                                        setShowResults(false)
                                                    }
                                                >
                                                    {item.pictureFileName && (
                                                        <img
                                                            src={`${normalizedCatalogApiUrl}/images/${item.pictureFileName}`}
                                                            alt={item.name}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-orange-500 font-semibold">
                                                            ${item.price.toFixed(
                                                            2
                                                        )}
                                                        </p>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        Товарів не знайдено
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart/Wishlist */}
                    <div className="flex gap-6">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button className="relative">
                            <Heart className="w-6 h-6" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <CartPopup
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCartUpdate={setCartCount}
                catalogApiUrl={catalogApiUrl}
            />
        </>
    );
};

export default Navigation;

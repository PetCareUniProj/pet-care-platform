import React from "react";

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
    return (
        <div className={`px-80 py-16 bg-gray-50 relative overflow-hidden ${className}`}>
            <div className="absolute right-0 top-[327px] w-44 h-48 bg-gradient-to-l from-orange-400 to-amber-500 rotate-[12.88deg]" />

            <div className="relative grid grid-cols-5 gap-8 mb-14">
                <div className="col-span-2">
                    <div className="text-xl font-bold mb-5">PET SHOP</div>
                    <p className="text-black mb-5 leading-5">
                        We are committed to providing the best products and services for your beloved pets. Your satisfaction is our priority.
                    </p>
                </div>

                <div>
                    <div className="font-semibold mb-5">Company</div>
                    <nav className="flex flex-col gap-4">
                        <a href="#" className="hover:text-orange-500 transition-colors">About Us</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Blog</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Gift cards</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Careers</a>
                    </nav>
                </div>

                <div>
                    <div className="font-semibold mb-5">Useful Links</div>
                    <nav className="flex flex-col gap-4">
                        <a href="#" className="hover:text-orange-500 transition-colors">New products</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Best sellers</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Discount</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">F.A.Q</a>
                    </nav>
                </div>

                <div>
                    <div className="font-semibold mb-5">Customer Service</div>
                    <nav className="flex flex-col gap-4">
                        <a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Shipping</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Returns</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Order tracking</a>
                    </nav>
                </div>
            </div>

            <div className="border-t border-black/10 pt-8 flex justify-between items-center">
                <div className="text-black/50 text-sm">
                    © Copyright Pet Shop 2025. All rights reserved. OWO
                </div>
            </div>
        </div>
    );
};

export default Footer;

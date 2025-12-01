import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`px-2.5 py-1 text-xl transition-colors ${
                isActive
                    ? "font-semibold text-orange-500 border-b-2 border-orange-500"
                    : "font-medium hover:text-orange-500"
            }`}
        >
            {children}
        </Link>
    );
};

export default NavLink;

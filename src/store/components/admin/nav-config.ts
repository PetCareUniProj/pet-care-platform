import {
  Activity,
  BadgePercent,
  Boxes,
  Cuboid,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShoppingCart,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
  children?: Array<Pick<AdminNavItem, "title" | "href" | "badge" >>;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavSection[] = [
  {
    title: "Operations",
    items: [
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      }
    ]
  },
  {
    title: "Catalog",
    items: [
      {
        title: "Items",
        href: "/admin/catalog/items",
        icon: PackageSearch,
        description: "Inventory with pricing & stock"
      },
      {
        title: "Categories",
        href: "/admin/catalog/categories",
        icon: Boxes
      },
      {
        title: "Brands",
        href: "/admin/catalog/brands",
        icon: BadgePercent
      }
    ]
  }
];

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
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Platform vitals and quick actions"
      },
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        badge: "live"
      },
      {
        title: "Fulfillment queue",
        href: "/admin/orders/queue",
        icon: Activity,
        description: "Monitor pending shipments"
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
  },
  {
    title: "Customers",
    items: [
      {
        title: "Profiles",
        href: "/admin/customers",
        icon: Users,
        description: "CRM view (coming soon)",
        badge: "soon"
      }
    ]
  },
  {
    title: "Platform",
    items: [
      {
        title: "Pricing presets",
        href: "/admin/catalog/price-books",
        icon: Cuboid,
        badge: "todo"
      }
    ]
  }
];

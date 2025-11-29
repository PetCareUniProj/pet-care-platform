"use client";

import { BellRing, Search } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/admin/theme-toggle";

interface AdminTopBarProps {
  accountSettingsUrl: string;
}

export function AdminTopBar({ accountSettingsUrl }: AdminTopBarProps) {
  const { data: session } = useSession();
  const initials = session?.user?.name
    ?.split(" ")
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-2.5 size-4" />
          <Input className="pl-9" placeholder="Search orders, catalog, users…" aria-label="Admin search" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
          <BellRing className="size-4" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-visible:ring-ring/70 rounded-full focus-visible:outline-none focus-visible:ring-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-semibold">{session?.user?.name ?? "Admin Demo"}</div>
              <div className="text-muted-foreground text-xs">{session?.user?.email ?? "admin@petcare.local"}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Workspace settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={accountSettingsUrl} target="_blank" rel="noreferrer noopener">
                Account settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

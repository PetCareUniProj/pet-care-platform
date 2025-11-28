"use client";

import { type ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AdminAppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-muted/30">
        <AdminSidebar />
        <SidebarInset>
          <AdminTopBar />
          <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

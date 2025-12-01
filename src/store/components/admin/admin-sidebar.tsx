"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { adminNav } from "@/components/admin/nav-config";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-1 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">PetCare Platform</div>
        <div className="text-lg font-semibold">Admin Console</div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {adminNav.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const matchesExactPath = pathname === item.href;
                  const matchesNestedPath = item.href !== "/admin" && pathname?.startsWith(`${item.href}/`);
                  const isActive = Boolean(matchesExactPath || matchesNestedPath);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge className={cn("uppercase", item.badge === "soon" && "text-muted-foreground")}>{
                          item.badge
                        }</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="px-4 py-3 text-xs text-muted-foreground">
        v0.1·internal preview
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

import type { ReactNode } from "react";

import { AdminAppShell } from "@/components/admin/admin-app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "./admin.globals.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const identityBaseUrl: string = process.env.Identity__Url ?? "http://localhost:8080";
  const accountSettingsUrl: string = new URL("/realms/pet-care-platform/account/", identityBaseUrl).toString();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminAppShell accountSettingsUrl={accountSettingsUrl}>{children}</AdminAppShell>
    </ThemeProvider>
  );
}

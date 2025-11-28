import type { ReactNode } from "react";

import { AdminAppShell } from "@/components/admin/admin-app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "./admin.globals.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminAppShell>{children}</AdminAppShell>
    </ThemeProvider>
  );
}

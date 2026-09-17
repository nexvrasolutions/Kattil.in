import type { Metadata } from "next";
import { ThemeProvider } from "@/components/admin/providers/AdminThemeProvider";
import AdminProviders from "@/components/admin/providers/AdminProviders";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";

export const metadata: Metadata = {
  title: "Kattil Admin",
  description: "Hotel CMS Administration",
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AdminProviders>
        <div className="admin-root flex h-screen overflow-hidden">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="h-16 shrink-0">
              <AdminHeader />
            </header>
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </AdminProviders>
    </ThemeProvider>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, BedDouble, Images, Sparkles, FileText,
  Phone, Search, FolderOpen, MapPin, Settings, Menu, X, Home,
  BookOpen, HelpCircle, Tag, Layers, Key,
} from "lucide-react";
import { useState } from "react";

interface NavItem { label: string; href: string; icon: React.ElementType }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Content Management",
    items: [
      { label: "Properties", href: "/admin/properties", icon: Building2 },
      { label: "Rooms", href: "/admin/rooms", icon: BedDouble },
      { label: "Gallery", href: "/admin/gallery", icon: Images },
      { label: "Gallery Categories", href: "/admin/gallery-categories", icon: Tag },
      { label: "Amenities", href: "/admin/amenities", icon: Sparkles },
      { label: "Blog Posts", href: "/admin/blogs", icon: BookOpen },
      { label: "Blog Categories", href: "/admin/blog-categories", icon: Tag },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "FAQ Categories", href: "/admin/faq-categories", icon: Layers },
    ],
  },
  {
    title: "Pages & Content",
    items: [
      { label: "Home", href: "/admin/home", icon: Home },
      { label: "About Us", href: "/admin/about", icon: FileText },
      { label: "Contact", href: "/admin/contact", icon: Phone },
      { label: "Footer & Sidebar", href: "/admin/footer", icon: Layers },
    ],
  },
  {
    title: "Integrations & Operations",
    items: [
      { label: "Destinations", href: "/admin/destinations", icon: MapPin },
      { label: "Booking API & Links", href: "/admin/booking-api", icon: Key },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/destinations") {
      return pathname.startsWith("/admin/destinations") || pathname.startsWith("/admin/cities");
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[hsl(var(--adm-sidebar))] border-r border-[hsl(var(--adm-sidebar-border))]">

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[hsl(var(--adm-sidebar-border))] px-5">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <img
            src="/assets/logo.png"
            alt="Kattil"
            className="h-8 object-contain transition-opacity duration-150 group-hover:opacity-80"
            style={{ filter: "var(--adm-logo-filter, none)" }}
          />
          <span
            className="text-[11px] font-bold uppercase"
            style={{
              background: "linear-gradient(90deg, hsl(var(--adm-sidebar-primary)), hsl(var(--adm-sidebar-foreground)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CMS
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-[8px] hover:bg-[hsl(var(--adm-sidebar-accent))] text-[hsl(var(--adm-sidebar-foreground))] lg:hidden transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2.5 text-[10px] font-bold uppercase text-[hsl(var(--adm-sidebar-foreground)/0.6)]">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                        active
                          ? "text-[#D2E6BC]"
                          : "text-[hsl(var(--adm-sidebar-foreground)/0.85)] hover:text-[#D2E6BC]",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-4.25 w-4.25 shrink-0 transition-colors",
                          active
                            ? "text-[#D2E6BC]"
                            : "text-[hsl(var(--adm-sidebar-foreground)/0.7)] group-hover:text-[#D2E6BC]",
                        ].join(" ")}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Settings */}
      {/* <div className="shrink-0 border-t border-[hsl(var(--adm-sidebar-border))] px-3 py-3">
        <Link
          href="/admin/settings"
          onClick={() => setMobileOpen(false)}
          className={[
            "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
            isActive("/admin/settings")
              ? "bg-[hsl(var(--adm-sidebar-primary))] text-[hsl(var(--adm-sidebar-primary-foreground))]"
              : "text-[hsl(var(--adm-sidebar-foreground)/0.85)] hover:bg-[hsl(var(--adm-sidebar-accent))] hover:text-[hsl(var(--adm-sidebar-accent-foreground))]",
          ].join(" ")}
        >
          <Settings
            className={[
              "h-4.25 w-4.25 shrink-0",
              isActive("/admin/settings")
                ? "text-[hsl(var(--adm-sidebar-primary-foreground))]"
                : "text-[hsl(var(--adm-sidebar-foreground)/0.7)]",
            ].join(" ")}
          />
          <span>Settings</span>
          {isActive("/admin/settings") && (
            <span
              className="ml-auto h-1.5 w-1.5 shrink-0 rounded-[8px] bg-[hsl(var(--adm-sidebar-primary-foreground))]"
              aria-hidden="true"
            />
          )}
        </Link>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-8 w-8 items-center justify-center rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] lg:hidden"
      >
        <Menu className="h-4 w-4 text-[hsl(var(--adm-foreground))]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col">
        <SidebarContent />
      </div>
    </>
  );
}

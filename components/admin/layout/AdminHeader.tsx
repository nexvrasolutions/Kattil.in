"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/admin/providers/AdminThemeProvider";
import {
  Moon, Sun, Globe, ChevronRight,
  LogOut, User, AlertTriangle, Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { safeFetchJson } from "@/lib/utils/safeFetch";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: path });
  }
  return crumbs;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | undefined>(undefined);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceConfirmOpen, setMaintenanceConfirmOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close profile popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load maintenance state — re-checked on every admin navigation (not on an
  // interval) so a change made from the full Settings page is reflected here
  // without needing a shared store or polling.
  useEffect(() => {
    safeFetchJson<{ success: boolean; data?: { maintenance?: { enabled?: boolean; message?: string } } }>("/api/admin/settings")
      .then((r) => {
        if (r?.success) {
          setMaintenanceOn(!!r.data?.maintenance?.enabled);
          setMaintenanceMessage(r.data?.maintenance?.message);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      // Hard navigation (not router.replace) fully tears down the SPA
      // session, taking Next's client Router Cache with it — so Back
      // afterwards always re-hits the server and proxy.ts instead of
      // instantly restoring the previously-cached admin page.
      window.location.href = "/admin/login";
    }
  };

  const applyMaintenanceChange = async (newVal: boolean) => {
    setMaintenanceLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // The API replaces the whole `maintenance` object on write (no
        // partial/deep merge), so the current message must be resent here —
        // otherwise toggling from the header would silently blank out a
        // custom message set from the full Settings page.
        body: JSON.stringify({ maintenance: { enabled: newVal, message: maintenanceMessage } }),
      });
      const json = await res.json().catch(() => null);
      // Only reflect the change locally once the server has confirmed it —
      // otherwise the header can show "ON" while the public site never
      // actually went into maintenance mode.
      if (res.ok && json?.success) {
        setMaintenanceOn(newVal);
      } else {
        toast.error(json?.error || "Failed to update maintenance mode. Please try again.");
      }
    } catch {
      toast.error("Failed to update maintenance mode. Please try again.");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleMaintenanceToggleClick = () => {
    if (maintenanceOn) {
      // Disabling is low-risk and doesn't need confirmation.
      applyMaintenanceChange(false);
    } else {
      // Enabling takes the public site offline — confirm before applying.
      setMaintenanceConfirmOpen(true);
    }
  };

  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-[hsl(var(--adm-border)/0.8)] bg-[hsl(var(--adm-background))] px-5 sm:px-7">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--adm-muted-foreground))]" />
                )}
                {isLast ? (
                  <span className="truncate text-sm font-semibold text-[hsl(var(--adm-foreground))]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate text-sm text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right: actions */}
      <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
        {/* Maintenance mode quick toggle */}
        <button
          onClick={handleMaintenanceToggleClick}
          disabled={maintenanceLoading}
          title={maintenanceOn ? "Maintenance mode is ON — click to disable" : "Click to enable maintenance mode"}
          className={[
            "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all",
            maintenanceOn
              ? "bg-[hsl(38_92%_50%/0.15)] text-[hsl(var(--adm-warning)/0.8)] border border-[hsl(38_92%_50%/0.4)]"
              : "bg-[hsl(var(--adm-accent)/0.5)] text-[hsl(var(--adm-muted-foreground))] border border-[hsl(var(--adm-border))] hover:border-[hsl(38_92%_50%/0.4)] hover:text-[hsl(var(--adm-warning)/0.8)]",
          ].join(" ")}
        >
          {maintenanceLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">
            {maintenanceOn ? "Maintenance ON" : "Maintenance"}
          </span>
        </button>

        {/* View hotel site */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--adm-accent))] text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors"
          title="View hotel website"
        >
          <Globe className="h-4 w-4" />
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--adm-accent))] text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors"
          title="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Profile + popup */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-[hsl(var(--adm-primary-foreground))] transition-transform hover:scale-105 active:scale-95"
            style={{ background: "hsl(var(--adm-primary))" }}
            aria-label="Profile menu"
          >
            A
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] py-1.5 z-50"
                style={{ boxShadow: "0 8px 32px -8px hsl(var(--adm-primary)/0.2), 0 0 0 1px hsl(var(--adm-border)/0.5)" }}
              >
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--adm-border)/0.5)]">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-[hsl(var(--adm-primary-foreground))] shrink-0"
                    style={{ background: "hsl(var(--adm-primary))" }}
                  >
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))] truncate">Admin</p>
                    <p className="text-xs text-[hsl(var(--adm-muted-foreground))] truncate">Kattil Hotels CMS</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1 px-1.5">
                  {/* <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors"
                  >
                    <User className="h-4 w-4 text-[hsl(var(--adm-muted-foreground))]" />
                    Settings
                  </Link> */}

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[hsl(var(--adm-destructive))] hover:bg-[hsl(var(--adm-destructive)/0.08)] transition-colors"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {loggingOut ? "Signing out…" : "Log out"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        isOpen={maintenanceConfirmOpen}
        onClose={() => setMaintenanceConfirmOpen(false)}
        onConfirm={() => applyMaintenanceChange(true)}
        title="Enable maintenance mode?"
        message="The public website will show a maintenance page to all visitors until you disable this."
        confirmLabel="Enable maintenance mode"
        variant="destructive"
      />
    </div>
  );
}

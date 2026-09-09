"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import DestinationsDropdown, { MobileDestinationsList } from "./destinations-dropdown";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const isDestinationsRoute = (path: string) => {
  return (
    path.startsWith("/rooms") ||
    path.startsWith("/destinations") ||
    path.startsWith("/chennai") ||
    path.startsWith("/coimbatore") ||
    path.startsWith("/madurai")
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDestinationsOpen, setMobileDestinationsOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const navRowRef = useRef<HTMLDivElement>(null);
  const [navRowHeight, setNavRowHeight] = useState(84);
  const toggleDestinations = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDestinationsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!destinationsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-destinations-menu]") && !target.closest("[data-destinations-trigger]")) {
        setDestinationsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDestinationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [destinationsOpen]);

  useEffect(() => {
    const measure = () => {
      if (navRowRef.current) setNavRowHeight(navRowRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDestinationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      style={{ willChange: "transform, opacity" }}
      className="fixed top-0 left-0 right-0 z-70 mt-2 md:mt-3 lg:mt-4 px-3 md:px-5"
    >
      {/* ── Expanding container ───────────────────────────────────────────────── */}
      <motion.div
        animate={{ height: mobileOpen ? "calc(100svh - 32px)" : navRowHeight }}
        transition={{ duration: 0.55, ease: EASE, delay: mobileOpen ? 0 : 0.15 }}
        className="relative mx-auto overflow-hidden rounded-[12px] border border-white/5 flex flex-col"
        style={{
          backgroundColor: scrolled && !mobileOpen ? "rgba(13, 27, 46, 0.92)" : "#0d1b2e",
          backdropFilter: scrolled && !mobileOpen ? "blur(16px)" : "none",
          maxWidth: "1920px",
          boxShadow: scrolled && !mobileOpen ? "0 8px 32px rgba(0,0,0,0.35)" : "none",
          willChange: "height",
        }}
      >
        {/* Overlay texture */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/assets/overlay.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        {/* ── Nav row (always visible) ─────────────────────────────────────── */}
        <div ref={navRowRef} className="relative z-10 shrink-0 flex items-center justify-between h-[74px] sm:h-[82px] md:h-[90px] lg:h-[94px] px-5 md:px-8 lg:px-15">

          {/* Left navigation */}
          <nav className="hidden lg:flex items-center gap-8 flex-1">
            {[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/rooms" },
              { label: "Partners", href: "/partners" },
              { label: "Offering", href: "" },
            ].map((link) => {
              const isDestinations = link.label === "Destinations";
              const isActive = isDestinations
                ? isDestinationsRoute(pathname)
                : link.href !== "" &&
                  (link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href));

              return (
                <div key={link.label} className="relative py-2">
                  {isDestinations ? (
                    <button
                      type="button"
                      data-destinations-trigger="true"
                      onClick={toggleDestinations}
                      className={`group relative !no-underline text-[14px] leading-[12px] tracking-normal transition-colors duration-200 ease-out font-sans cursor-pointer font-medium ${isActive || destinationsOpen
                        ? "!text-[#D2E6BC]"
                        : "text-[#DDDDDD] hover:!text-[#D2E6BC]"
                        }`}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      href={link.href || "#"}
                      className={`group relative !no-underline text-[14px] leading-[12px] tracking-normal transition-colors duration-200 ease-out font-sans font-medium ${isActive
                        ? "!text-[#D2E6BC]"
                        : "text-[#DDDDDD] hover:!text-[#D2E6BC]"
                        }`}
                      style={{
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Center logo */}
          <Link
            href="/"
            className="absolute left-5 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center"
          >
            <img
              src="/assets/logo.png"
              alt="Kattil — The Homely Reset"
              className="object-contain h-12 md:h-14.5 lg:h-17 transition-all duration-300 drop-shadow-md"
            />
          </Link>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
            <Link
              href="/contact-us"
              className={`group relative text-[14px] leading-[12px] tracking-normal transition-colors duration-200 ease-out font-sans font-medium ${pathname === "/contact-us"
                ? "!text-[#D2E6BC]"
                : "text-[#DDDDDD] hover:!text-[#D2E6BC]"
                }`}
            >
              Contact Us
            </Link>
            <Link
              href="/rooms"
              className="w-[122px] h-[40px]
rounded-[6px]
border-[1px] border-white/100
px-6
text-white text-[14px] leading-none font-medium
inline-flex items-center justify-center
transition-all duration-300
hover:border-white hover:bg-white hover:text-[#0d1b2e]
shadow-sm active:scale-95 font-sans"         >
              Book Now
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden ml-auto relative z-20 flex items-center justify-center w-10 h-10 rounded-full
              border border-white/10 bg-white/4 transition-all duration-200 hover:border-white/30 hover:bg-white/8"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <X size={18} color="white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <Menu size={18} color="white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* ── Expanded menu content ─────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="menu-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="lg:hidden relative z-10 flex flex-col flex-1 px-8 pb-10 border-t border-white/10"
            >
              {/* Links */}
              <nav className="flex flex-col gap-6 mt-8">
                {[
                  { label: "Home", href: "/" },
                  { label: "Destinations", href: "/rooms" },
                  { label: "Partners", href: "/partners" },
                  { label: "Offering", href: "" },
                ].map((link, index) => {
                  const isDestinations = link.label === "Destinations";
                  const isActive = isDestinations
                    ? isDestinationsRoute(pathname)
                    : (link.href === "/" && pathname === "/") ||
                      (link.href !== "" && link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.06, duration: 0.35, ease: EASE }}
                    >
                      {isDestinations ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => setMobileDestinationsOpen((prev) => !prev)}
                            className={`flex items-center justify-between w-full text-left text-[24px] sm:text-[28px] font-sans focus:outline-none transition-all hover:font-bold ${
                              isActive ? "text-emerald-400 font-bold" : "text-white/80 font-medium"
                            }`}
                          >
                            <span>{link.label}</span>
                            <span className="text-xs text-[#D2E6BC] font-sans px-2 py-1 rounded bg-white/5">
                              {mobileDestinationsOpen ? "Close ▲" : "View ▼"}
                            </span>
                          </button>
                          {mobileDestinationsOpen && (
                            <MobileDestinationsList onItemClick={() => setMobileOpen(false)} />
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`relative inline-block text-[24px] sm:text-[28px] transition-all font-sans hover:font-bold ${isActive ? "text-emerald-400 font-bold" : "text-white/80 font-medium"
                            }`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              <div className="flex-1" />

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <Link
                  href="/rooms"
                  className="flex items-center justify-center w-full
                    bg-white text-[#0d1b2e] rounded-xl py-4 text-[14px]
                    font-semibold tracking-wide transition-all shadow-lg font-sans"
                >
                  Book Now
                </Link>
                <Link
                  href="/contact-us"
                  className="flex items-center justify-center w-full
                    border border-white/30 text-white rounded-xl py-4 text-[14px]
                    font-medium tracking-wide transition-all font-sans"
                >
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* ── Destinations Mega Menu Dropdown ─────────────────────────────── */}
      <DestinationsDropdown
        isOpen={destinationsOpen}
        topOffset={navRowHeight + 14}
        onItemClick={() => setDestinationsOpen(false)}
      />
    </motion.header>
  );
}

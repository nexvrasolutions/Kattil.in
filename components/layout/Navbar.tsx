"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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
  const destinationsTriggerRef = useRef<HTMLButtonElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [navRowHeight, setNavRowHeight] = useState(84);

  const handleBookNowClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  const handleDestinationsMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDestinationsOpen(true);
  }, []);

  const handleDestinationsMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDestinationsOpen(false);
    }, 180);
  }, []);

  const toggleDestinations = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDestinationsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
      className="fixed top-0 left-0 right-0 z-70 mt-2 md:mt-3 lg:mt-4 px-3 md:px-5 pointer-events-none flex justify-center"
    >
      <div ref={headerContainerRef} className="relative w-full max-w-[1920px] mx-auto pointer-events-none">
        {/* ── Expanding container ───────────────────────────────────────────────── */}
        <motion.div
          animate={{ height: mobileOpen ? "calc(100svh - 32px)" : navRowHeight }}
          transition={{ duration: 0.55, ease: EASE, delay: mobileOpen ? 0 : 0.15 }}
          className="relative mx-auto overflow-hidden rounded-[12px] border border-white/5 flex flex-col pointer-events-auto"
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

          {/* ═══════════════════════════════════════════════════════════════
              BLACK FADE WHEN DESTINATIONS IS OPEN

              8% opacity
              No blur
              Pure black
              Dropdown remains sharp
          ═══════════════════════════════════════════════════════════════ */}

          <AnimatePresence>
            {destinationsOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 0.08,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className="
                  absolute
                  inset-0
                  bg-black
                  pointer-events-none
                  z-[5]
                "
              />
            )}
          </AnimatePresence>

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
                  <div
                    key={link.label}
                    className="relative py-2"
                    onMouseEnter={isDestinations ? handleDestinationsMouseEnter : () => {
                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                      setDestinationsOpen(false);
                    }}
                    onMouseLeave={isDestinations ? handleDestinationsMouseLeave : undefined}
                  >
                    {isDestinations ? (
                      <button
                        ref={destinationsTriggerRef}
                        type="button"
                        data-text={link.label}
                        data-destinations-trigger="true"
                        onClick={toggleDestinations}
                        className={`nav-link-bold-safe group relative !no-underline text-[14px] leading-[12px] tracking-normal transition-colors duration-200 ease-out font-sans cursor-pointer ${isActive || destinationsOpen
                          ? "font-bold !text-[#D2E6BC]"
                          : "font-medium hover:font-bold text-[#DDDDDD] hover:!text-[#D2E6BC]"
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
                        data-text={link.label}
                        className={`nav-link-bold-safe group relative !no-underline text-[14px] leading-[12px] tracking-normal transition-colors duration-200 ease-out font-sans ${isActive
                          ? "font-bold !text-[#D2E6BC]"
                          : "font-medium hover:font-bold text-[#DDDDDD] hover:!text-[#D2E6BC]"
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

            {/* Logo */}
            <Link
              href="/"
              className={`flex items-center justify-center transition-all duration-300 ${
                mobileOpen
                  ? "absolute left-5 sm:left-6 md:left-8 top-1/2 -translate-y-1/2"
                  : "absolute left-5 md:left-1/2 md:-translate-x-1/2 top-1/2 -translate-y-1/2"
              }`}
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
                data-text="Contact Us"
                className={`nav-link-bold-safe group relative text-[14px] leading-[12px] tracking-normal transition-colors duration-200 ease-out font-sans ${pathname === "/contact-us"
                  ? "font-bold !text-[#D2E6BC]"
                  : "font-medium hover:font-bold text-[#DDDDDD] hover:!text-[#D2E6BC]"
                  }`}
              >
                Contact Us
              </Link>
              <Link
                href="/"
                onClick={handleBookNowClick}
                className="w-[122px] h-[40px] rounded-[8px] border border-white px-6 text-white text-[14px] leading-none font-medium inline-flex items-center justify-center transition-all duration-300 hover:border-white hover:bg-white hover:text-[#0d1b2e] shadow-sm active:scale-95 font-sans"
              >
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
                    <X className="w-5 h-5 text-white" strokeWidth={2} />
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
                    <Menu className="w-5 h-5 text-white" strokeWidth={2} />
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
                className="lg:hidden relative z-10 flex flex-col flex-1 px-6 sm:px-8 pb-8 border-t border-white/10 overflow-y-auto"
              >
                {/* Links */}
                <nav className="flex flex-col gap-4.5 mt-6">
                  {/* 1. Home */}
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`py-1 text-[17px] sm:text-[18px] font-sans font-medium transition-colors ${pathname === "/" ? "text-[#D2E6BC] font-semibold" : "text-white/90 hover:text-[#D2E6BC]"
                      }`}
                  >
                    Home
                  </Link>

                  {/* 2. Destinations */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setMobileDestinationsOpen((prev) => !prev)}
                      className={`flex items-center justify-between w-full text-left font-sans transition-all py-1 cursor-pointer ${mobileDestinationsOpen || isDestinationsRoute(pathname)
                        ? "text-[#D2E6BC] font-semibold"
                        : "text-white/90 font-medium hover:text-[#D2E6BC]"
                        }`}
                    >
                      <span className="text-[17px] sm:text-[18px]">Destinations</span>
                      {mobileDestinationsOpen ? (
                        <ChevronUp size={20} className="text-[#D2E6BC]" />
                      ) : (
                        <ChevronDown size={20} className="text-white/60" />
                      )}
                    </button>

                    <AnimatePresence>
                      {mobileDestinationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <MobileDestinationsList onItemClick={() => setMobileOpen(false)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Partners */}
                  <Link
                    href="/partners"
                    onClick={() => setMobileOpen(false)}
                    className={`py-1 text-[17px] sm:text-[18px] font-sans font-medium transition-colors ${pathname.startsWith("/partners") ? "text-[#D2E6BC] font-semibold" : "text-white/90 hover:text-[#D2E6BC]"
                      }`}
                  >
                    Partners
                  </Link>

                  {/* 4. Offering */}
                  <Link
                    href="#"
                    onClick={() => setMobileOpen(false)}
                    className="py-1 text-[17px] sm:text-[18px] font-sans font-medium text-white/90 hover:text-[#D2E6BC] transition-colors"
                  >
                    Offering
                  </Link>

                  {/* 5. Contact Us */}
                  <Link
                    href="/contact-us"
                    onClick={() => setMobileOpen(false)}
                    className={`py-1 text-[17px] sm:text-[18px] font-sans font-medium transition-colors ${pathname === "/contact-us" ? "text-[#D2E6BC] font-semibold" : "text-white/90 hover:text-[#D2E6BC]"
                      }`}
                  >
                    Contact Us
                  </Link>
                </nav>

                <div className="flex-1 min-h-[36px]" />

                {/* CTAs */}
                <div className="pt-4">
                  <Link
                    href="/"
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleBookNowClick(e);
                    }}
                    className="flex items-center justify-center w-full border border-white hover:border-white text-white rounded-[8px] py-3.5 text-[15px] font-semibold tracking-wide transition-all duration-300 font-sans hover:bg-white hover:text-[#0d1b2e] shadow-sm active:scale-[0.99]"
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* ── Destinations Mega Menu Dropdown ─────────────────────────────── */}
        <DestinationsDropdown
          isOpen={destinationsOpen}
          topOffset={navRowHeight + 14}
          onMouseEnter={handleDestinationsMouseEnter}
          onMouseLeave={handleDestinationsMouseLeave}
          onItemClick={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setDestinationsOpen(false);
          }}
        />
      </div>
    </motion.header>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, Gem, Bell } from "lucide-react";
import BookingBarWidget from "./booking-bar-widget";
import DestinationsDropdown, { MobileDestinationsList } from "./destinations-dropdown";

// ─── Constants & Links ────────────────────────────────────────────────────────
const NAVBAR_H_DEFAULT = 90;
const HERO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HERO_DURATION = 0.65;

export const HERO_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/rooms" },
  { label: "Partners", href: "/partners" },
  { label: "Offering", href: "" },
];

export const isDestinationsRoute = (path: string) => {
  return (
    path.startsWith("/rooms") ||
    path.startsWith("/destinations") ||
    path.startsWith("/chennai") ||
    path.startsWith("/coimbatore") ||
    path.startsWith("/madurai")
  );
};

// ─── Trust Badges Configuration ───────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Verified Hospitality", sub: "Certified & trusted property", isGreen: true },
  { icon: Gem, title: "10% Exclusive Benefit", sub: "Best rate on direct booking", isGreen: false },
  { icon: Bell, title: "Premium Guest Support", sub: "Always here for you", isGreen: false },
] as const;

function TrustTicker() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % TRUST_ITEMS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const { icon: Icon, title, sub } = TRUST_ITEMS[active];

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs mx-auto">
      <div
        className="relative overflow-hidden rounded-full border border-white/10 h-13 w-full"
        style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(14px)" }}
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center gap-3 px-4"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/10"
              style={{ background: "#D2E6BC66" }}
            >
              <Icon className="size-4 text-[#D2E6BC]" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-[12px] font-semibold text-white/90 leading-tight font-sans">
                {title}
              </p>
              <p className="text-[10.5px] text-white/50 leading-tight mt-0.5 font-sans">
                {sub}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Component (Matches kattil.in scroll behavior) ───────────────────────
export default function HeroNavbar({
  heroEyebrow = "THE HOMELY RESET",
  heroLine1 = "Find your perfect",
  heroLine2 = "stay experience",
}: {
  heroEyebrow?: string;
  heroLine1?: string;
  heroLine2?: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDestinationsOpen, setMobileDestinationsOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(isHome);

  const lastScrollY = useRef(0);
  const heroJumpedRef = useRef(false);
  const heroVisibleRef = useRef(heroVisible);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRowRef = useRef<HTMLDivElement>(null);
  const [navRowHeight, setNavRowHeight] = useState(74);

  useEffect(() => {
    const measure = () => {
      if (navRowRef.current) {
        setNavRowHeight(navRowRef.current.offsetHeight);
      } else if (typeof window !== "undefined") {
        if (window.innerWidth < 640) setNavRowHeight(74);
        else if (window.innerWidth < 768) setNavRowHeight(82);
        else if (window.innerWidth < 1024) setNavRowHeight(90);
        else setNavRowHeight(94);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const navbarH = navRowHeight;

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
    heroVisibleRef.current = heroVisible;
  }, [heroVisible]);

  // Smooth scroll handler — manages scrolled shadow + hero expand/collapse cleanly without jitter
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrolled(currentY > 20);
          if (isHome) {
            if (currentY > 80) {
              setHeroVisible(false);
            } else if (currentY <= 5) {
              setHeroVisible(true);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Reset hero visibility and scroll position when navigating to/from home or refreshing
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (isHome) {
        window.scrollTo(0, 0);
        lastScrollY.current = 0;
        setHeroVisible(true);
        setScrolled(false);
      } else {
        setHeroVisible(false);
      }
    }
  }, [isHome]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isExpanded = isHome && heroVisible;

  return (
    <>
      {/* ── Fixed Animated Header ────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        style={{ willChange: "transform, opacity" }}
        className="fixed top-0 left-0 right-0 z-70 mt-2 md:mt-3 lg:mt-4 px-3 md:px-5 pointer-events-none flex justify-center"
      >
        <motion.div
          animate={{
            height: isExpanded ? "95svh" : `${navbarH}px`,
            marginTop: isExpanded ? 0 : 0,
          }}
          transition={{ duration: HERO_DURATION, ease: HERO_EASE }}
          className="relative overflow-hidden border border-white/10 rounded-[12px] w-full max-w-[1920px] mx-auto pointer-events-auto flex flex-col"
          style={{
            backgroundColor: scrolled && !isExpanded ? "rgba(13, 27, 46, 0.94)" : "#0d1b2e",
            backdropFilter: scrolled && !isExpanded ? "blur(16px)" : "none",
            boxShadow: scrolled && !isExpanded ? "0 10px 35px rgba(0,0,0,0.4)" : "none",
            transition:
              "background-color 0.5s ease, backdrop-filter 0.5s ease, box-shadow 0.5s ease",
          }}
        >
          {/* Overlay Texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/assets/overlay.png')",
              backgroundPosition: "center",
              backgroundSize: "cover",
              opacity: 0.85,
            }}
          />

          {/* ── TOP NAV BAR ROW ──────────────────────────────────────────────── */}
          <div
            ref={navRowRef}
            className="relative z-10 flex items-center justify-between px-5 md:px-8 lg:px-15 h-[74px] sm:h-[82px] md:h-[90px] lg:h-[94px] shrink-0"
          >
            {/* Left navigation links */}
            <nav className="hidden lg:flex items-center gap-8 flex-1">
              {HERO_NAV_LINKS.map((link) => {
                const isDestinations = link.label === "Destinations";
                const isActive = isDestinations
                  ? isDestinationsRoute(pathname)
                  : link.href !== "" &&
                  ((link.href === "/" && isHome) ||
                    (link.href !== "/" && pathname.startsWith(link.href)));

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
                        type="button"
                        data-destinations-trigger="true"
                        onClick={toggleDestinations}
                        className={`group relative text-[14px] leading-[12px] tracking-normal transition-all duration-200 ease-out font-sans cursor-pointer hover:font-bold ${isActive || destinationsOpen
                          ? "!text-[#D2E6BC] font-bold"
                          : "text-[#DDDDDD] font-light hover:!text-[#D2E6BC]"
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
                        className={`group relative text-[14px] leading-[12px] tracking-normal transition-all duration-200 ease-out font-sans hover:font-bold ${isActive
                          ? "!text-[#D2E6BC] font-bold"
                          : "text-[#DDDDDD] font-light hover:!text-[#D2E6BC]"
                          }`}
                        style={{ textDecoration: "none" }}
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

            {/* Right CTAs */}
            <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
              <Link
                href="/contact-us"
                className={`group relative text-[14px] leading-[12px] tracking-normal transition-all duration-200 ease-out font-sans hover:font-bold ${pathname === "/contact-us"
                  ? "!text-[#D2E6BC] font-bold"
                  : "text-[#DDDDDD] font-light hover:!text-[#D2E6BC]"
                  }`}
                style={{
                  textDecoration: "none",
                }}
              >
                Contact Us
              </Link>
              <Link
                href="/rooms"
                className="w-[122px] h-[40px] rounded-[6px] border-[1px] border-white px-6 text-white text-[14px] leading-none font-light inline-flex items-center justify-center transition-all duration-300 hover:border-white hover:bg-white hover:text-[#0d1b2e] shadow-sm active:scale-95 font-sans"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden ml-auto relative z-20 flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/4 transition-all duration-200 hover:border-white/30 hover:bg-white/8"
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
                  >
                    <Menu size={18} color="white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* ── EXPANDED HERO CONTENT (Home page only) ────────────────────────── */}
          {isHome && (
            <motion.div
              animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : -20 }}
              transition={
                heroVisible
                  ? { duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.25, ease: [0.4, 0, 1, 1] }
              }
              style={{
                pointerEvents: heroVisible ? "auto" : "none",
                willChange: "transform, opacity",
              }}
              className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-20 pt-[80px] md:pt-[80px] lg:pt-3 pb-6 flex flex-col items-center justify-start text-center flex-1 w-full mt-0 lg:mt-3"
            >
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 10 }}
                transition={{ delay: 0.4, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-[11px] sm:text-xs md:text-[13px] font-semibold text-white/90 uppercase tracking-[0.14em] mb-1 sm:mb-1.5 font-sans"
              >
                {heroEyebrow || "THE HOMELY RESET"}
              </motion.p>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 14 }}
                transition={{ delay: 0.48, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-2.5 sm:mb-3.5 md:mb-4 lg:mb-5"
              >
                <h1 className="text-white text-[26px] sm:text-[30px] md:text-[42px] lg:text-[46px] leading-[1.14] sm:leading-[1.12] tracking-[-0.5px] sm:tracking-[-1px] text-center">

                  {/* Mobile */}
                  <span className="sm:hidden">
                    <span className="block font-sans font-semibold">
                      {heroLine1 || "Find your perfect"}
                    </span>

                    <span className="block font-serif italic font-normal mt-0.5">
                      stay {heroLine2 || "experience"}
                    </span>
                  </span>

                  {/* Tablet & Desktop */}
                  <span className="hidden sm:inline">
                    <span className="font-sans font-semibold">
                      {heroLine1 || "Find your perfect"}{" "}
                    </span>

                    <span className="font-serif italic font-normal">
                      stay
                    </span>

                    <span className="block font-serif italic font-normal mt-1 sm:mt-1.5">
                      {heroLine2 || "experience"}
                    </span>
                  </span>

                </h1>
              </motion.div>

              {/* Booking widget card */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 22 }}
                transition={{ delay: 0.58, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-4xl"
              >
                <BookingBarWidget />
              </motion.div>

              {/* Trust badges container */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 14 }}
                transition={{ delay: 0.68, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-center w-full mt-2.5 sm:mt-3 md:mt-4 lg:mt-5"
              >
                {/* Mobile: Ticker */}
                <div className="block md:hidden w-full">
                  <TrustTicker />
                </div>

                {/* Desktop: Frosted trust badge */}
                <div
                  className="relative hidden md:flex items-center w-full max-w-[750px] h-[67px] gap-[24px] rounded-[18px] overflow-hidden border-[1px] border-white/10 px-[20px] py-[16px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(16px)",
                  }}
                  role="list"
                  aria-label="Trust signals"
                >
                  <div
                    className="absolute inset-0 rounded-[18px] pointer-events-none"
                    style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" }}
                    aria-hidden="true"
                  />

                  {/* 1. Verified */}
                  <div className="flex-1 min-w-0 flex items-center gap-3" role="listitem">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shrink-0"
                      style={{ background: "#D2E6BC66" }}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#D2E6BC]" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-white leading-tight font-sans">
                        Verified Hospitality
                      </p>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5 font-sans">
                        Certified & trusted property
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-white/10 shrink-0" aria-hidden="true" />

                  {/* 2. 10% Benefit */}
                  <div className="flex-1 min-w-0 flex items-center gap-3" role="listitem">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shrink-0"
                      style={{ background: "#D2E6BC66" }}
                    >
                      <Gem className="w-4 h-4 text-[#D2E6BC]" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-white leading-tight font-sans">
                        10% Exclusive Benefit
                      </p>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5 font-sans">
                        Best rate on direct booking
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-white/10 shrink-0" aria-hidden="true" />

                  {/* 3. Support */}
                  <div className="flex-1 min-w-0 flex items-center gap-3" role="listitem">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shrink-0"
                      style={{ background: "#D2E6BC66" }}
                    >
                      <Bell className="w-4 h-4 text-[#D2E6BC]" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-white leading-tight font-sans">
                        Premium Guest Support
                      </p>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5 font-sans">
                        Always here for you
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Destinations Mega Menu Dropdown ─────────────────────────────── */}
        <DestinationsDropdown
          isOpen={destinationsOpen}
          topOffset={isExpanded ? navbarH + 8 : navbarH + 16}
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
      </motion.header>

      {/* ── Page spacer — pushes content below the fixed header (Matches kattil.in) ─── */}
      <motion.div
        animate={{ height: isHome && heroVisible ? "100svh" : `${navbarH + 32}px` }}
        transition={{ duration: HERO_DURATION, ease: HERO_EASE }}
        style={{ willChange: "height" }}
        aria-hidden
      />

      {/* ── Mobile Navigation Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 59px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 59px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 59px)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{ backgroundColor: "#0d1b2e", willChange: "clip-path" }}
            className="fixed inset-3 md:inset-6 z-75 lg:hidden rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('/assets/overlay.png')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: 0.15,
              }}
            />

            <div className="relative z-20 flex items-center justify-end px-5 h-[64px] shrink-0">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close Menu"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/30 hover:bg-white/10"
              >
                <X size={18} color="white" />
              </button>
            </div>

            <div className="relative z-10 flex flex-col px-8 pb-10 flex-1 overflow-y-auto">
              <nav className="flex flex-col gap-6 mt-4">
                {HERO_NAV_LINKS.map((link, index) => {
                  const isDestinations = link.label === "Destinations";
                  const isActive = isDestinations
                    ? isDestinationsRoute(pathname)
                    : link.href !== "" &&
                    ((link.href === "/" && isHome) ||
                      (link.href !== "/" && pathname.startsWith(link.href)));

                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.2 + index * 0.06,
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {isDestinations ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => setMobileDestinationsOpen((prev) => !prev)}
                            className={`flex items-center justify-between w-full text-left text-[24px] sm:text-[28px] font-sans focus:outline-none transition-all hover:font-bold ${isActive ? "text-emerald-400 font-bold" : "text-white/80 font-medium"
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
                          href={link.href || "#"}
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

              <div className="flex-1 min-h-[40px]" />

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-3"
              >
                <Link
                  href="/rooms"
                  className="flex items-center justify-center w-full bg-white text-[#0d1b2e] rounded-xl py-4 text-[14px] font-semibold tracking-wide transition-all shadow-lg font-sans"
                >
                  Book Now
                </Link>
                <Link
                  href="/contact-us"
                  className="flex items-center justify-center w-full border border-white/30 text-white rounded-xl py-4 text-[14px] font-medium tracking-wide transition-all font-sans"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

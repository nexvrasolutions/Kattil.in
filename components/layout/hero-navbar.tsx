"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Menu,
  X,
  ShieldCheck,
  Gem,
  Bell,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import BookingBarWidget from "./booking-bar-widget";
import DestinationsDropdown, {
  MobileDestinationsList,
} from "./destinations-dropdown";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const NAVBAR_H_DEFAULT = 90;

const HERO_EASE: [number, number, number, number] = [
  0.22,
  1,
  0.36,
  1,
];

const HERO_DURATION = 0.55;

const MENU_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.28,
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: HERO_EASE,
    },
  },
};

const MENU_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: HERO_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.18,
      ease: HERO_EASE,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Blur-reveal character sweep (continuous left-to-right focus pull)
// ─────────────────────────────────────────────────────────────────────────────

const CHAR_STAGGER = 0.026;

const CHAR_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(16px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: HERO_EASE,
    },
  },
};

function BlurRevealChars({
  text,
  visible,
  baseDelay = 0,
  charOffset = 0,
  className,
}: {
  text: string;
  visible: boolean;
  baseDelay?: number;
  charOffset?: number;
  className?: string;
}) {
  const chars = Array.from(text);

  return (
    <motion.span
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: CHAR_STAGGER,
            delayChildren: baseDelay + charOffset * CHAR_STAGGER,
          },
        },
      }}
      className={className}
      style={{ display: "inline-block" }}
    >
      {chars.map((c, i) => (
        <motion.span
          key={i}
          variants={CHAR_VARIANTS}
          style={{
            display: "inline-block",
            willChange: "filter, opacity",
          }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Links
// ─────────────────────────────────────────────────────────────────────────────

export const HERO_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/rooms" },
  { label: "Partners", href: "/partners" },
  { label: "Offering", href: "" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Destination Route Detection
// ─────────────────────────────────────────────────────────────────────────────

export const isDestinationsRoute = (path: string) => {
  return (
    path.startsWith("/rooms") ||
    path.startsWith("/properties") ||
    path.startsWith("/property") ||
    path.startsWith("/destinations") ||
    path.startsWith("/destination") ||
    path.startsWith("/chennai") ||
    path.startsWith("/coimbatore") ||
    path.startsWith("/madurai") ||
    path.startsWith("/colachel")
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Trust Badge Configuration
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Verified Hospitality",
    sub: "Certified & trusted property",
    isGreen: true,
  },
  {
    icon: Gem,
    title: "10% Exclusive Benefit",
    sub: "Best rate on direct booking",
    isGreen: false,
  },
  {
    icon: Bell,
    title: "Premium Guest Support",
    sub: "Always here for you",
    isGreen: false,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Trust Ticker
// ─────────────────────────────────────────────────────────────────────────────

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
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(14px)",
        }}
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -16,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 flex items-center justify-center gap-3 px-4"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/10"
              style={{
                background: "#D2E6BC66",
              }}
            >
              <Icon
                className="size-4 text-[#D2E6BC]"
                aria-hidden="true"
              />
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Hero Navbar
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroNavbar({
  heroEyebrow = "THE HOMELY RESET",
  heroLine1 = "Find your perfect",
  heroLine2 = "experience",
}: {
  heroEyebrow?: string;
  heroLine1?: string;
  heroLine2?: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDestinationsOpen, setMobileDestinationsOpen] =
    useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(isHome);
  const [heroCollapseProgress, setHeroCollapseProgress] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollLockUntilRef = useRef<number>(0);

  const navRowRef = useRef<HTMLDivElement>(null);

  const [navRowHeight, setNavRowHeight] =
    useState(NAVBAR_H_DEFAULT);

  // ───────────────────────────────────────────────────────────────────────────
  // Scroll layout
  //
  // The hero uses a fixed visual container, but the document always reserves
  // one full viewport for it. We intentionally do NOT animate the spacer
  // height. This prevents the next section from moving upward while the hero
  // is still being scrolled out.
  // ───────────────────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  // Measure Navbar Height
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const measure = () => {
      if (navRowRef.current) {
        setNavRowHeight(
          navRowRef.current.offsetHeight
        );
      } else if (typeof window !== "undefined") {
        if (window.innerWidth < 640) {
          setNavRowHeight(74);
        } else if (window.innerWidth < 768) {
          setNavRowHeight(82);
        } else if (window.innerWidth < 1024) {
          setNavRowHeight(90);
        } else {
          setNavRowHeight(94);
        }
      }
    };

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  const navbarH = navRowHeight;

  // ───────────────────────────────────────────────────────────────────────────
  // Destinations Hover
  // ───────────────────────────────────────────────────────────────────────────

  const handleDestinationsMouseEnter =
    useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setDestinationsOpen(true);
    }, []);

  const handleDestinationsMouseLeave =
    useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDestinationsOpen(false);
      }, 180);
    }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Destinations Click
  // ───────────────────────────────────────────────────────────────────────────

  const toggleDestinations = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setDestinationsOpen(true);
    },
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Cleanup Dropdown Timer
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Outside Click + Escape
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!destinationsOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        !target.closest("[data-destinations-menu]") &&
        !target.closest("[data-destinations-trigger]")
      ) {
        setDestinationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDestinationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [destinationsOpen]);

  // ───────────────────────────────────────────────────────────────────────────
  // Scroll Handler
  // ───────────────────────────────────────────────────────────────────────────
  //
  // IMPORTANT: the hero is NOT collapsed after a small scroll amount.
  // It remains the active hero until the user has consumed one complete
  // viewport of scroll. Only then does the compact fixed navbar state appear.
  // Because the spacer below always remains 100svh, the Destinations section
  // cannot appear before the hero's document space has been fully scrolled.  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const isLocked = Date.now() < scrollLockUntilRef.current;
        const headerBand = navRowHeight + 32;

        if (isHome) {
          if (isLocked) {
            setHeroVisible(true);
            setHeroCollapseProgress(0);
            setScrolled(false);
          } else {
            setScrolled(currentY > 20);

            const collapseDistance = Math.max(
              1,
              window.innerHeight - headerBand
            );
            const progress = Math.min(
              1,
              Math.max(0, currentY / collapseDistance)
            );

            setHeroCollapseProgress(progress);
            setHeroVisible(progress < 0.4);
          }
        } else {
          setScrolled(currentY > 20);
          setHeroCollapseProgress(1);
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome, navRowHeight]);

  // ───────────────────────────────────────────────────────────────────────────
  // Reset Hero On Route Change
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      if (isHome) {
        scrollLockUntilRef.current = Date.now() + 1500;
        window.scrollTo(0, 0);
        setHeroVisible(true);
        setHeroCollapseProgress(0);
        setScrolled(false);
        const raf = requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
        const t1 = setTimeout(() => window.scrollTo(0, 0), 100);
        const t2 = setTimeout(() => window.scrollTo(0, 0), 300);
        return () => {
          cancelAnimationFrame(raf);
          clearTimeout(t1);
          clearTimeout(t2);
        };
      } else {
        setHeroVisible(false);
        setHeroCollapseProgress(1);
      }
    }
  }, [isHome]);

  // ───────────────────────────────────────────────────────────────────────────
  // Lock Body Scroll For Mobile Menu
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ───────────────────────────────────────────────────────────────────────────
  // Close Mobile Menu On Route Change
  // ───────────────────────────────────────────────────────────────────────────

  const handleBookNowClick = useCallback(
    (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (isHome) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        setMobileOpen(false);
        setDestinationsOpen(false);
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";

        // Lock scroll updates for 1.5 seconds so onScroll cannot collapse hero during smooth scroll
        scrollLockUntilRef.current = Date.now() + 1500;
        setHeroVisible(true);
        setHeroCollapseProgress(0);
        setScrolled(false);

        // Smooth scroll to top of hero
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Backup timers to guarantee reaching top
        setTimeout(() => {
          if (window.scrollY > 5) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 300);

        setTimeout(() => {
          if (window.scrollY > 0) {
            window.scrollTo(0, 0);
          }
          setHeroVisible(true);
          setHeroCollapseProgress(0);
          setScrolled(false);
        }, 1200);
      }
    },
    [isHome]
  );

  const isExpanded = isHome && heroCollapseProgress < 1;
  const scrollLinkedHeroHeight = `calc(${(1 - heroCollapseProgress) * 95}svh + ${heroCollapseProgress * navbarH}px)`;

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          FIXED ANIMATED HEADER
      ═══════════════════════════════════════════════════════════════════════ */}

      <motion.header
        initial={{
          y: -16,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.08,
        }}
        style={{
          willChange: "transform, opacity",
        }}
        className="
          fixed
          top-0
          left-0
          right-0
          z-70
          mt-2
          md:mt-3
          lg:mt-4
          px-3
          md:px-5
          pointer-events-none
          flex
          justify-center
        "
      >
        <div
          className="
            relative
            w-full
            max-w-[1920px]
            mx-auto
            pointer-events-none
          "
        >
          <motion.div
            animate={{
              height: mobileOpen
                ? "calc(100svh - 32px)"
                : isHome
                  ? scrollLinkedHeroHeight
                  : `${navbarH}px`,
              marginTop: 0,
            }}
            transition={{
              duration: mobileOpen ? 0.5 : isHome ? 0 : 0.5,
              ease: HERO_EASE,
            }}
            className="
              relative
              overflow-hidden
              border
              border-white/10
              rounded-[12px]
              w-full
              max-w-[1920px]
              mx-auto
              pointer-events-auto
              flex
              flex-col
            "
            style={{
              backgroundColor:
                scrolled && !mobileOpen && !isExpanded
                  ? "rgba(13, 27, 46, 0.94)"
                  : "#0d1b2e",

              backdropFilter:
                scrolled && !mobileOpen && !isExpanded
                  ? "blur(16px)"
                  : "none",
              WebkitBackdropFilter:
                scrolled && !mobileOpen && !isExpanded
                  ? "blur(16px)"
                  : "none",

              boxShadow:
                scrolled && !mobileOpen && !isExpanded
                  ? "0 10px 35px rgba(0,0,0,0.4)"
                  : "none",

              transform: "translateZ(0)",
              willChange: "height",
            }}
          >
            {/* ═══════════════════════════════════════════════════════════════
                OVERLAY TEXTURE
            ═══════════════════════════════════════════════════════════════ */}

            <div
              className="
                absolute
                inset-0
                pointer-events-none
                z-0
              "
              style={{
                backgroundImage:
                  "url('/assets/overlay.png')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                transform: "translateZ(0)",
                opacity: 0.85,
              }}
            />

            {/* ═══════════════════════════════════════════════════════════════
                BLACK FADE WHEN DESTINATIONS IS OPEN
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

            {/* ═══════════════════════════════════════════════════════════════
                TOP NAVIGATION ROW
            ═══════════════════════════════════════════════════════════════ */}

            <div
              ref={navRowRef}
              className="
                relative
                z-10
                flex
                items-center
                justify-between
                px-5
                md:px-8
                lg:px-15
                h-[74px]
                sm:h-[82px]
                md:h-[90px]
                lg:h-[94px]
                shrink-0
              "
            >
              {/* LEFT NAVIGATION */}

              <nav className="hidden lg:flex items-center gap-8 flex-1">
                {HERO_NAV_LINKS.map((link) => {
                  const isDestinations =
                    link.label === "Destinations";

                  const isActive = isDestinations
                    ? isDestinationsRoute(pathname)
                    : link.href !== "" &&
                    ((link.href === "/" &&
                      isHome) ||
                      (link.href !== "/" &&
                        pathname.startsWith(
                          link.href
                        )));

                  return (
                    <div
                      key={link.label}
                      className="relative py-2"
                      onMouseEnter={
                        isDestinations
                          ? handleDestinationsMouseEnter
                          : () => {
                            if (
                              timeoutRef.current
                            ) {
                              clearTimeout(
                                timeoutRef.current
                              );
                            }

                            setDestinationsOpen(
                              false
                            );
                          }
                      }
                      onMouseLeave={
                        isDestinations
                          ? handleDestinationsMouseLeave
                          : undefined
                      }
                    >
                      {isDestinations ? (
                        <button
                          type="button"
                          data-text={link.label}
                          data-destinations-trigger="true"
                          onClick={
                            toggleDestinations
                          }
                          className={`
                            nav-link-bold-safe
                            group
                            relative
                            text-[14px]
                            leading-[12px]
                            tracking-normal
                            transition-colors
                            duration-200
                            ease-out
                            font-sans
                            cursor-pointer
                            ${isActive ||
                              destinationsOpen
                              ? "font-bold !text-[#D2E6BC]"
                              : "font-medium hover:font-bold text-[#DDDDDD] hover:!text-[#D2E6BC]"
                            }
                          `}
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
                          onClick={(e) => {
                            if (link.href === "/" && isHome) {
                              handleBookNowClick(e);
                            }
                          }}
                          className={`
                            nav-link-bold-safe
                            group
                            relative
                            text-[14px]
                            leading-[12px]
                            tracking-normal
                            transition-colors
                            duration-200
                            ease-out
                            font-sans
                            ${isActive
                              ? "font-bold !text-[#D2E6BC]"
                              : "font-medium hover:font-bold text-[#DDDDDD] hover:!text-[#D2E6BC]"
                            }
                          `}
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

              {/* CENTER LOGO */}

              <Link
                href="/"
                onClick={(e) => {
                  setMobileOpen(false);
                  handleBookNowClick(e);
                }}
                className={`flex items-center justify-center transition-all duration-300 ${mobileOpen
                  ? "absolute left-5 sm:left-6 md:left-8 top-1/2 -translate-y-1/2"
                  : "absolute left-5 md:left-1/2 md:-translate-x-1/2 top-1/2 -translate-y-1/2"
                  }`}
              >
                <img
                  src="/assets/logo.png"
                  alt="Kattil — The Homely Reset"
                  className="
                    object-contain
                    h-12
                    md:h-14.5
                    lg:h-17
                    transition-all
                    duration-300
                    drop-shadow-md
                  "
                />
              </Link>

              {/* RIGHT CTAs */}

              <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
                <Link
                  href="/contact-us"
                  data-text="Contact Us"
                  className={`
                    nav-link-bold-safe
                    group
                    relative
                    text-[14px]
                    leading-[12px]
                    tracking-normal
                    transition-colors
                    duration-200
                    ease-out
                    font-sans
                    ${pathname === "/contact-us"
                      ? "font-bold !text-[#D2E6BC]"
                      : "font-medium hover:font-bold text-[#DDDDDD] hover:!text-[#D2E6BC]"
                    }
                  `}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  Contact Us
                </Link>

                <Link
                  href="/"
                  onClick={handleBookNowClick}
                  className="
                    w-[122px]
                    h-[40px]
                    rounded-[8px]
                    border-[1px]
                    border-white
                    px-6
                    text-white
                    text-[14px]
                    leading-none
                    font-medium
                    inline-flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    hover:border-white
                    hover:bg-white
                    hover:text-[#0d1b2e]
                    shadow-sm
                    active:scale-95
                    font-sans
                  "
                >
                  Book Now
                </Link>
              </div>

              {/* MOBILE MENU BUTTON */}

              <button
                className="
                  lg:hidden
                  ml-auto
                  relative
                  z-20
                  flex
                  items-center
                  justify-center
                  w-10
                  h-10
                  rounded-full
                  border
                  border-white/10
                  bg-white/4
                  transition-all
                  duration-200
                  hover:border-white/30
                  hover:bg-white/8
                "
                onClick={() =>
                  setMobileOpen(
                    (prev) => !prev
                  )
                }
                aria-label="Toggle Menu"
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{
                        rotate: -90,
                        opacity: 0,
                      }}
                      animate={{
                        rotate: 0,
                        opacity: 1,
                      }}
                      exit={{
                        rotate: 90,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      <X
                        className="w-5 h-5 text-white"
                        strokeWidth={2}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{
                        rotate: 90,
                        opacity: 0,
                      }}
                      animate={{
                        rotate: 0,
                        opacity: 1,
                      }}
                      exit={{
                        rotate: -90,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      <Menu
                        className="w-5 h-5 text-white"
                        strokeWidth={2}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* ── Expanded menu content (when mobile menu is open) ─────────────────────────── */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  key="menu-content"
                  variants={MENU_CONTAINER_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="lg:hidden relative z-10 flex flex-col flex-1 px-6 sm:px-8 pb-8 border-t border-white/10 overflow-y-auto"
                >
                  {/* Links */}
                  <nav className="flex flex-col gap-4.5 mt-6">
                    {/* 1. Home */}
                    <motion.div variants={MENU_ITEM_VARIANTS}>
                      <Link
                        href="/"
                        onClick={(e) => {
                          setMobileOpen(false);
                          if (isHome) {
                            handleBookNowClick(e);
                          }
                        }}
                        className={`py-1 text-[17px] sm:text-[18px] font-sans font-medium transition-colors ${pathname === "/"
                          ? "text-[#D2E6BC] font-semibold"
                          : "text-white/90 hover:text-[#D2E6BC]"
                          }`}
                      >
                        Home
                      </Link>
                    </motion.div>

                    {/* 2. Destinations */}
                    <motion.div variants={MENU_ITEM_VARIANTS}>
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
                            transition={{ duration: 0.28, ease: HERO_EASE }}
                            className="overflow-hidden"
                          >
                            <MobileDestinationsList onItemClick={() => setMobileOpen(false)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* 3. Partners */}
                    <motion.div variants={MENU_ITEM_VARIANTS}>
                      <Link
                        href="/partners"
                        onClick={() => setMobileOpen(false)}
                        className={`py-1 text-[17px] sm:text-[18px] font-sans font-medium transition-colors ${pathname.startsWith("/partners")
                          ? "text-[#D2E6BC] font-semibold"
                          : "text-white/90 hover:text-[#D2E6BC]"
                          }`}
                      >
                        Partners
                      </Link>
                    </motion.div>

                    {/* 4. Offering */}
                    <motion.div variants={MENU_ITEM_VARIANTS}>
                      <Link
                        href="#"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 text-[17px] sm:text-[18px] font-sans font-medium text-white/90 hover:text-[#D2E6BC] transition-colors"
                      >
                        Offering
                      </Link>
                    </motion.div>

                    {/* 5. Contact Us */}
                    <motion.div variants={MENU_ITEM_VARIANTS}>
                      <Link
                        href="/contact-us"
                        onClick={() => setMobileOpen(false)}
                        className={`py-1 text-[17px] sm:text-[18px] font-sans font-medium transition-colors ${pathname === "/contact-us"
                          ? "text-[#D2E6BC] font-semibold"
                          : "text-white/90 hover:text-[#D2E6BC]"
                          }`}
                      >
                        Contact Us
                      </Link>
                    </motion.div>
                  </nav>

                  <div className="flex-1 min-h-[36px]" />

                  {/* CTAs */}
                  <motion.div variants={MENU_ITEM_VARIANTS} className="pt-4">
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════════
                EXPANDED HERO CONTENT
            ═══════════════════════════════════════════════════════════════ */}

            <AnimatePresence>
              {isHome && !mobileOpen && (
                <motion.div
                  key="hero-content"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: heroVisible
                      ? destinationsOpen
                        ? 0.4
                        : 1
                      : 0,

                    y: heroVisible
                      ? 0
                      : -20,
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.18, ease: "easeOut" },
                  }}
                  transition={{
                    duration: 0.35,
                    ease: HERO_EASE,
                  }}
                  style={{
                    pointerEvents:
                      heroVisible &&
                        !destinationsOpen
                        ? "auto"
                        : "none",

                    willChange:
                      "transform, opacity",
                  }}
                  className="
                  relative
                  z-10
                  px-5
                  md:px-12
                  lg:px-20
                  pt-2
                  sm:pt-4
                  md:pt-0
                  pb-6
                  md:pb-8
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  flex-1
                  w-full
                  my-auto
                "
                >
                  {/* EYEBROW */}

                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: heroVisible
                        ? 1
                        : 0,
                      y: heroVisible
                        ? 0
                        : 10,
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 0.45,
                      ease: HERO_EASE,
                    }}
                    className="
                    text-[11px]
                    sm:text-xs
                    md:text-[13px]
                    font-semibold
                    text-white/90
                    uppercase
                    tracking-[0.14em]
                    mb-1
                    sm:mb-1.5
                    font-sans
                  "
                  >
                    {heroEyebrow ||
                      "THE HOMELY RESET"}
                  </motion.p>

                  {/* HEADLINE — continuous blur sweep, left to right */}

                  <div
                    className="
                    mb-10
                    sm:mb-5
                    md:mb-[60px]
                  "
                  >
                    {(() => {
                      const line1Trimmed = (
                        heroLine1 ||
                        "Find your perfect"
                      ).trim();

                      const hasStayAtEnd =
                        /\bstay$/i.test(
                          line1Trimmed
                        );

                      let headlinePrefix =
                        hasStayAtEnd
                          ? line1Trimmed
                            .replace(
                              /\bstay$/i,
                              ""
                            )
                            .trim()
                          : line1Trimmed;

                      if (
                        headlinePrefix.toLowerCase() ===
                        "find your perfect"
                      ) {
                        headlinePrefix =
                          "Find your perfect";
                      }

                      const stayWord = (
                        hasStayAtEnd
                          ? line1Trimmed.match(
                            /\bstay$/i
                          )?.[0] || "stay"
                          : "stay"
                      ).toLowerCase();

                      const headlineLine2 = (
                        heroLine2 ||
                        "experience"
                      )
                        .trim()
                        .replace(
                          /^stay\s+/i,
                          ""
                        )
                        .toLowerCase();

                      // continuous character offsets so the sweep never resets mid-headline
                      const prefixOffset = 0;
                      const stayOffset =
                        headlinePrefix.length + 1;
                      const line2Offset =
                        stayOffset +
                        stayWord.length +
                        1;

                      const HEADLINE_BASE_DELAY = 0.68;

                      return (
                        <h1
                          className="
                          text-white
                          text-[26px]
                          sm:text-[30px]
                          md:text-[42px]
                          lg:text-[46px]
                          leading-[1.14]
                          sm:leading-[1.12]
                          tracking-[-0.5px]
                          sm:tracking-[-1px]
                          text-center
                        "
                        >
                          {/* Mobile */}

                          <span className="sm:hidden">
                            <span className="block font-sans font-semibold">
                              <BlurRevealChars
                                text={headlinePrefix}
                                visible={heroVisible}
                                baseDelay={HEADLINE_BASE_DELAY}
                                charOffset={prefixOffset}
                              />
                            </span>

                            <span className="block font-serif italic font-normal mt-0.5">
                              <BlurRevealChars
                                text={stayWord}
                                visible={heroVisible}
                                baseDelay={HEADLINE_BASE_DELAY}
                                charOffset={stayOffset}
                              />
                              {"\u00A0"}
                              <BlurRevealChars
                                text={headlineLine2}
                                visible={heroVisible}
                                baseDelay={HEADLINE_BASE_DELAY}
                                charOffset={line2Offset}
                              />
                            </span>
                          </span>

                          {/* Tablet + Desktop */}

                          <span className="hidden sm:inline">
                            <span className="font-sans font-semibold">
                              <BlurRevealChars
                                text={headlinePrefix}
                                visible={heroVisible}
                                baseDelay={HEADLINE_BASE_DELAY}
                                charOffset={prefixOffset}
                              />
                            </span>
                            {"\u00A0"}
                            <span className="font-serif italic font-normal">
                              <BlurRevealChars
                                text={stayWord}
                                visible={heroVisible}
                                baseDelay={HEADLINE_BASE_DELAY}
                                charOffset={stayOffset}
                              />
                            </span>

                            <span className="block font-serif italic font-normal mt-1 sm:mt-1.5">
                              <BlurRevealChars
                                text={headlineLine2}
                                visible={heroVisible}
                                baseDelay={HEADLINE_BASE_DELAY}
                                charOffset={line2Offset}
                              />
                            </span>
                          </span>
                        </h1>
                      );
                    })()}
                  </div>

                  {/* BOOKING WIDGET */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 22,
                    }}
                    animate={{
                      opacity: heroVisible
                        ? 1
                        : 0,
                      y: heroVisible
                        ? 0
                        : 22,
                    }}
                    transition={{
                      delay: 0.5,
                      duration: 0.5,
                      ease: HERO_EASE,
                    }}
                    className="
                    w-full
                    max-w-4xl
                  "
                  >
                    <BookingBarWidget />
                  </motion.div>

                  {/* TRUST BADGES */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 14,
                    }}
                    animate={{
                      opacity: heroVisible
                        ? 1
                        : 0,
                      y: heroVisible
                        ? 0
                        : 14,
                    }}
                    transition={{
                      delay: 0.58,
                      duration: 0.5,
                      ease: HERO_EASE,
                    }}
                    className="
                    flex
                    justify-center
                    w-full
                    mt-3.5
                    sm:mt-4
                    md:mt-4
                    lg:mt-5
                  "
                  >
                    {/* Mobile ticker */}

                    <div className="block md:hidden w-full">
                      <TrustTicker />
                    </div>

                    {/* Desktop trust badges */}

                    <div
                      className="
                      relative
                      hidden
                      md:flex
                      items-center
                      w-full
                      max-w-[750px]
                      h-[67px]
                      gap-[24px]
                      rounded-[18px]
                      overflow-hidden
                      border-[1px]
                      border-white/10
                      px-[20px]
                      py-[16px]
                    "
                      style={{
                        background:
                          "rgba(255, 255, 255, 0.05)",
                        backdropFilter:
                          "blur(16px)",
                      }}
                      role="list"
                      aria-label="Trust signals"
                    >
                      <div
                        className="
                        absolute
                        inset-0
                        rounded-[18px]
                        pointer-events-none
                      "
                        style={{
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.12)",
                        }}
                        aria-hidden="true"
                      />

                      {/* Verified */}

                      <div
                        className="
                        flex-1
                        min-w-0
                        flex
                        items-center
                        gap-3
                      "
                        role="listitem"
                      >
                        <div
                          className="
                          w-8
                          h-8
                          rounded-full
                          flex
                          items-center
                          justify-center
                          border
                          border-white/10
                          shrink-0
                        "
                          style={{
                            background:
                              "#D2E6BC66",
                          }}
                        >
                          <ShieldCheck
                            className="
                            w-4
                            h-4
                            text-[#D2E6BC]
                          "
                            aria-hidden="true"
                          />
                        </div>

                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-white leading-tight font-sans">
                            Verified Hospitality
                          </p>

                          <p className="text-[11px] text-white/50 leading-tight mt-0.5 font-sans">
                            Certified & trusted
                            property
                          </p>
                        </div>
                      </div>

                      {/* Divider */}

                      <div
                        className="
                        w-px
                        h-6
                        bg-white/10
                        shrink-0
                      "
                        aria-hidden="true"
                      />

                      {/* Exclusive Benefit */}

                      <div
                        className="
                        flex-1
                        min-w-0
                        flex
                        items-center
                        gap-3
                      "
                        role="listitem"
                      >
                        <div
                          className="
                          w-8
                          h-8
                          rounded-full
                          flex
                          items-center
                          justify-center
                          border
                          border-white/10
                          shrink-0
                        "
                          style={{
                            background:
                              "#D2E6BC66",
                          }}
                        >
                          <Gem
                            className="
                            w-4
                            h-4
                            text-[#D2E6BC]
                          "
                            aria-hidden="true"
                          />
                        </div>

                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-white leading-tight font-sans">
                            10% Exclusive Benefit
                          </p>

                          <p className="text-[11px] text-white/50 leading-tight mt-0.5 font-sans">
                            Best rate on direct
                            booking
                          </p>
                        </div>
                      </div>

                      {/* Divider */}

                      <div
                        className="
                        w-px
                        h-6
                        bg-white/10
                        shrink-0
                      "
                        aria-hidden="true"
                      />

                      {/* Support */}

                      <div
                        className="
                        flex-1
                        min-w-0
                        flex
                        items-center
                        gap-3
                      "
                        role="listitem"
                      >
                        <div
                          className="
                          w-8
                          h-8
                          rounded-full
                          flex
                          items-center
                          justify-center
                          border
                          border-white/10
                          shrink-0
                        "
                          style={{
                            background:
                              "#D2E6BC66",
                          }}
                        >
                          <Bell
                            className="
                            w-4
                            h-4
                            text-[#D2E6BC]
                          "
                            aria-hidden="true"
                          />
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
            </AnimatePresence>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════
              DESTINATIONS MEGA MENU
          ═════════════════════════════════════════════════════════════════ */}

          <DestinationsDropdown
            isOpen={destinationsOpen}
            topOffset={
              mobileOpen
                ? navRowHeight + 14
                : isExpanded
                  ? navbarH + 8
                  : navbarH + 16
            }
            onMouseEnter={
              handleDestinationsMouseEnter
            }
            onMouseLeave={
              handleDestinationsMouseLeave
            }
            onItemClick={() => {
              if (timeoutRef.current) {
                clearTimeout(
                  timeoutRef.current
                );

                timeoutRef.current = null;
              }

              setDestinationsOpen(false);
            }}
          />
        </div>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE SPACER
      ═══════════════════════════════════════════════════════════════════════ */}

      <div
        style={{
          // Always reserve the complete hero viewport in the document.
          // This is what prevents Destinations from appearing early.
          height: isHome
            ? "100svh"
            : `${navbarH + 32}px`,
        }}
        aria-hidden
      />
    </>
  );
}
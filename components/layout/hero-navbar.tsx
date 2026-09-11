"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShieldCheck,
  Gem,
  Bell,
  Home,
  MapPin,
  Users,
  Settings,
  Phone,
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

const HERO_DURATION = 0.65;

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
    path.startsWith("/destinations") ||
    path.startsWith("/chennai") ||
    path.startsWith("/coimbatore") ||
    path.startsWith("/madurai")
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

  const lastScrollY = useRef(0);
  const heroVisibleRef = useRef(heroVisible);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navRowRef = useRef<HTMLDivElement>(null);

  const destinationsTriggerRef =
    useRef<HTMLButtonElement>(null);

  const headerContainerRef =
    useRef<HTMLDivElement>(null);

  const [navRowHeight, setNavRowHeight] =
    useState(NAVBAR_H_DEFAULT);

  const [destinationsLeft, setDestinationsLeft] =
    useState<number>(0);

  // ───────────────────────────────────────────────────────────────────────────
  // Native Smooth Scrolling
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Calculate Destination Dropdown Position
  // ───────────────────────────────────────────────────────────────────────────

  const updateDestinationsPosition = useCallback(() => {
    if (
      destinationsTriggerRef.current &&
      headerContainerRef.current
    ) {
      const triggerRect =
        destinationsTriggerRef.current.getBoundingClientRect();

      const containerRect =
        headerContainerRef.current.getBoundingClientRect();

      const offset =
        triggerRect.left - containerRect.left;

      setDestinationsLeft(
        Math.max(0, Math.round(offset))
      );
    }
  }, []);

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

      updateDestinationsPosition();
    };

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [updateDestinationsPosition]);

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

      updateDestinationsPosition();
      setDestinationsOpen(true);
    }, [updateDestinationsPosition]);

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

      updateDestinationsPosition();

      setDestinationsOpen((prev) => !prev);
    },
    [updateDestinationsPosition]
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
  // Hero Visibility Ref
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    heroVisibleRef.current = heroVisible;
  }, [heroVisible]);

  // ───────────────────────────────────────────────────────────────────────────
  // Scroll Handler
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          setScrolled((prev) => {
            const next = currentY > 20;

            return prev === next ? prev : next;
          });

          if (isHome) {
            if (currentY > 80) {
              setHeroVisible((prev) =>
                prev ? false : prev
              );
            } else if (currentY <= 5) {
              setHeroVisible((prev) =>
                !prev ? true : prev
              );
            }
          }

          lastScrollY.current = currentY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );
    };
  }, [isHome]);

  // ───────────────────────────────────────────────────────────────────────────
  // Reset Hero On Route Change
  // ───────────────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isExpanded = isHome && heroVisible;

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
          ref={headerContainerRef}
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
              height: isExpanded
                ? "95svh"
                : `${navbarH}px`,
              marginTop: 0,
            }}
            transition={{
              duration: HERO_DURATION,
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
                scrolled && !isExpanded
                  ? "rgba(13, 27, 46, 0.94)"
                  : "#0d1b2e",

              backdropFilter:
                scrolled && !isExpanded
                  ? "blur(16px)"
                  : "none",

              boxShadow:
                scrolled && !isExpanded
                  ? "0 10px 35px rgba(0,0,0,0.4)"
                  : "none",

              transition:
                "background-color 0.5s ease, backdrop-filter 0.5s ease, box-shadow 0.5s ease",
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
                opacity: 0.85,
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
                          ref={
                            destinationsTriggerRef
                          }
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
                className="
                  absolute
                  left-5
                  md:left-1/2
                  md:-translate-x-1/2
                  flex
                  items-center
                  justify-center
                "
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
                        size={18}
                        color="white"
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
                        size={18}
                        color="white"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                EXPANDED HERO CONTENT
            ═══════════════════════════════════════════════════════════════ */}

            {isHome && (
              <motion.div
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
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
                style={{
                  pointerEvents:
                    heroVisible &&
                      !destinationsOpen
                      ? "auto"
                      : "none",

                  // No blur
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
                    delay: 0.4,
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

                {/* HEADLINE */}

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
                    delay: 0.48,
                    duration: 0.5,
                    ease: HERO_EASE,
                  }}
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
                            {headlinePrefix}
                          </span>

                          <span className="block font-serif italic font-normal mt-0.5">
                            {stayWord}{" "}
                            {headlineLine2}
                          </span>
                        </span>

                        {/* Tablet + Desktop */}

                        <span className="hidden sm:inline">
                          <span className="font-sans font-semibold">
                            {headlinePrefix}{" "}
                          </span>

                          <span className="font-serif italic font-normal">
                            {stayWord}
                          </span>

                          <span className="block font-serif italic font-normal mt-1 sm:mt-1.5">
                            {headlineLine2}
                          </span>
                        </span>
                      </h1>
                    );
                  })()}
                </motion.div>

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
                    delay: 0.58,
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
                    delay: 0.68,
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
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════
              DESTINATIONS MEGA MENU
          ═════════════════════════════════════════════════════════════════ */}

          <DestinationsDropdown
            isOpen={destinationsOpen}
            topOffset={
              isExpanded
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

      <motion.div
        animate={{
          height:
            isHome && heroVisible
              ? "100svh"
              : `${navbarH + 32}px`,
        }}
        transition={{
          duration: HERO_DURATION,
          ease: HERO_EASE,
        }}
        style={{
          willChange: "height",
        }}
        aria-hidden
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE NAVIGATION DRAWER
      ═══════════════════════════════════════════════════════════════════════ */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              clipPath:
                "circle(0% at calc(100% - 40px) 59px)",
            }}
            animate={{
              clipPath:
                "circle(150% at calc(100% - 40px) 59px)",
            }}
            exit={{
              clipPath:
                "circle(0% at calc(100% - 40px) 59px)",
            }}
            transition={{
              duration: 0.8,
              ease: [0.76, 0, 0.24, 1],
            }}
            style={{
              backgroundColor: "#0d1b2e",
              willChange: "clip-path",
            }}
            className="
              fixed
              inset-3
              md:inset-6
              z-75
              lg:hidden
              rounded-2xl
              overflow-hidden
              shadow-2xl
              flex
              flex-col
            "
          >
            {/* Mobile texture */}

            <div
              className="
                absolute
                inset-0
                pointer-events-none
              "
              style={{
                backgroundImage:
                  "url('/assets/overlay.png')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: 0.15,
              }}
            />

            {/* Mobile Header */}

            <div
              className="
                relative
                z-20
                flex
                items-center
                justify-between
                px-6
                pt-5
                pb-2
                shrink-0
              "
            >
              <div className="w-10" />

              <Link
                href="/"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="
                  flex
                  items-center
                  justify-center
                "
              >
                <img
                  src="/assets/logo.png"
                  alt="Kattil — The Homely Reset"
                  className="
                    h-10
                    sm:h-12
                    object-contain
                    drop-shadow-md
                  "
                />
              </Link>

              <button
                onClick={() =>
                  setMobileOpen(false)
                }
                aria-label="Close Menu"
                className="
                  flex
                  items-center
                  justify-center
                  w-10
                  h-10
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  transition-all
                  duration-200
                  hover:border-white/30
                  hover:bg-white/10
                "
              >
                <X
                  size={20}
                  color="white"
                />
              </button>
            </div>

            {/* Mobile Navigation */}

            <div
              className="
                relative
                z-10
                flex
                flex-col
                px-6
                sm:px-8
                pb-8
                flex-1
                overflow-y-auto
              "
            >
              <nav
                className="
                  flex
                  flex-col
                  gap-4.5
                  mt-4
                "
              >
                {/* Home */}

                <Link
                  href="/"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`
                    flex
                    items-center
                    gap-3.5
                    py-1
                    text-[17px]
                    sm:text-[18px]
                    font-sans
                    font-medium
                    transition-colors
                    ${pathname === "/" &&
                      isHome
                      ? "text-[#D2E6BC] font-semibold"
                      : "text-white/90 hover:text-[#D2E6BC]"
                    }
                  `}
                >
                  <Home
                    size={20}
                    className={
                      pathname === "/" &&
                        isHome
                        ? "text-[#D2E6BC]"
                        : "text-white/80"
                    }
                  />

                  <span>Home</span>
                </Link>

                {/* Destinations */}

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileDestinationsOpen(
                        (prev) => !prev
                      )
                    }
                    className={`
                      flex
                      items-center
                      justify-between
                      w-full
                      text-left
                      font-sans
                      transition-all
                      py-1
                      cursor-pointer
                      ${mobileDestinationsOpen ||
                        isDestinationsRoute(
                          pathname
                        )
                        ? "text-[#D2E6BC] font-semibold"
                        : "text-white/90 font-medium hover:text-[#D2E6BC]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3.5">
                      <MapPin
                        size={20}
                        className={
                          mobileDestinationsOpen ||
                            isDestinationsRoute(
                              pathname
                            )
                            ? "text-[#D2E6BC]"
                            : "text-white/80"
                        }
                      />

                      <span className="text-[17px] sm:text-[18px]">
                        Destinations
                      </span>
                    </div>

                    {mobileDestinationsOpen ? (
                      <ChevronUp
                        size={20}
                        className="text-[#D2E6BC]"
                      />
                    ) : (
                      <ChevronDown
                        size={20}
                        className="text-white/60"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {mobileDestinationsOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        transition={{
                          duration: 0.22,
                          ease: "easeOut",
                        }}
                        className="overflow-hidden"
                      >
                        <MobileDestinationsList
                          onItemClick={() =>
                            setMobileOpen(false)
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Partners */}

                <Link
                  href="/partners"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`
                    flex
                    items-center
                    gap-3.5
                    py-1
                    text-[17px]
                    sm:text-[18px]
                    font-sans
                    font-medium
                    transition-colors
                    ${pathname.startsWith(
                    "/partners"
                  )
                      ? "text-[#D2E6BC] font-semibold"
                      : "text-white/90 hover:text-[#D2E6BC]"
                    }
                  `}
                >
                  <Users
                    size={20}
                    className={
                      pathname.startsWith(
                        "/partners"
                      )
                        ? "text-[#D2E6BC]"
                        : "text-white/80"
                    }
                  />

                  <span>Partners</span>
                </Link>

                {/* Offering */}

                <Link
                  href="#"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3.5
                    py-1
                    text-[17px]
                    sm:text-[18px]
                    font-sans
                    font-medium
                    text-white/90
                    hover:text-[#D2E6BC]
                    transition-colors
                  "
                >
                  <Settings
                    size={20}
                    className="text-white/80"
                  />

                  <span>Offering</span>
                </Link>

                {/* Contact Us */}

                <Link
                  href="/contact-us"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`
                    flex
                    items-center
                    gap-3.5
                    py-1
                    text-[17px]
                    sm:text-[18px]
                    font-sans
                    font-medium
                    transition-colors
                    ${pathname ===
                      "/contact-us"
                      ? "text-[#D2E6BC] font-semibold"
                      : "text-white/90 hover:text-[#D2E6BC]"
                    }
                  `}
                >
                  <Phone
                    size={20}
                    className={
                      pathname ===
                        "/contact-us"
                        ? "text-[#D2E6BC]"
                        : "text-white/80"
                    }
                  />

                  <span>Contact Us</span>
                </Link>
              </nav>

              <div className="flex-1 min-h-[36px]" />

              {/* Mobile Book Now */}

              <div className="pt-4">
                <Link
                  href="/"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    w-full
                    border
                    border-white
                    hover:border-white
                    text-white
                    rounded-[8px]
                    py-3.5
                    text-[15px]
                    font-semibold
                    tracking-wide
                    transition-all
                    duration-300
                    font-sans
                    hover:bg-white
                    hover:text-[#0d1b2e]
                    shadow-sm
                    active:scale-[0.99]
                  "
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
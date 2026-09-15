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

const HERO_DURATION = 0.65;

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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollLockUntilRef = useRef<number>(0);

  // Drives the wheel/touch/keyboard scroll interception below (jump-to-content
  // on first downward scroll intent).
  const lastScrollY = useRef(0);
  const heroJumpedRef = useRef(false);
  const heroVisibleRef = useRef(heroVisible);
  // Mirrors mobileOpen so the scroll-jack closures can bail out without
  // re-binding their event listeners — lets touch/wheel/keyboard scrolling
  // inside the open mobile menu behave normally instead of being hijacked.
  const mobileOpenRef = useRef(false);

  const navRowRef = useRef<HTMLDivElement>(null);

  const [navRowHeight, setNavRowHeight] =
    useState(NAVBAR_H_DEFAULT);

  // ───────────────────────────────────────────────────────────────────────────
  // Scroll layout
  //
  // The page spacer below animates in sync with the fixed header (see the
  // motion.div at the bottom of this file), and the hero → compact navbar
  // collapse is a two-state, fixed-duration eased transition driven by
  // heroVisible — not a value scrubbed against raw scroll position on every
  // frame.
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
  // Keep a ref mirror of heroVisible for use inside the scroll-jack closures
  // below (they must read the latest value without re-binding their event
  // listeners on every render).
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    heroVisibleRef.current = heroVisible;
  }, [heroVisible]);

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  // ───────────────────────────────────────────────────────────────────────────
  // Wheel / touch / keyboard scroll interception
  //
  // While the hero is visible, the first downward scroll intent (wheel,
  // swipe, or ArrowDown/PageDown/Space) is captured, default scrolling is
  // prevented, and the page is jumped straight to its post-collapse resting
  // position (the top of the Destinations section) in one shot. The hero →
  // compact navbar transition then plays out on its own fixed-duration eased
  // curve (see the motion.div below), completely decoupled from the raw
  // scroll deltas that would otherwise scrub it frame-by-frame and cause jank.
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isHome) return;

    let lockUntil = 0;
    let prevHeroVisible = heroVisibleRef.current;

    const jump = () => {
      if (heroJumpedRef.current) return;

      // Don't latch heroJumpedRef until we know we can actually complete the
      // jump — on a genuinely fresh mount the destinations section is always
      // in the initial HTML, but latching first and finding no element would
      // permanently disable every future scroll/touch/keyboard attempt for
      // this page view with no way to recover.
      const el = document.getElementById("destinations");
      if (!el) return;

      heroJumpedRef.current = true;
      lockUntil = Date.now() + 600;

      // The mount / route-change effect below sets a 1.5s scrollLockUntilRef
      // so its own scroll-to-top reset can't be interrupted by the passive
      // scroll handler collapsing the hero mid-reset. If the user scrolls
      // (triggering this jump) while that window is still open — very
      // possible right after a fast client-side navigation to "/" — the
      // scroll handler would otherwise see our programmatic scroll, treat it
      // as still "locked", and force heroVisible back to true, undoing this
      // jump before it's visible. Clear it and flip heroVisible ourselves so
      // the collapse is immediate and deterministic instead of depending on
      // the next "scroll" event to arrive before that lock expires.
      scrollLockUntilRef.current = 0;
      setHeroVisible(false);

      // Spacer below collapses from 100svh -> (navbarH + 32) once the hero
      // is dismissed; pre-compensate so the landing spot accounts for that
      // shrink instead of drifting once layout settles.
      const spacerShrink = window.innerHeight - (navbarH + 32);

      // Respect the section's own scroll-margin-top (its intended gap below
      // a fixed header) rather than a value tuned for a different section.
      const scrollMarginTop =
        parseFloat(getComputedStyle(el).scrollMarginTop) || navbarH + 32;

      const futureAbsPos =
        el.getBoundingClientRect().top + window.scrollY - spacerShrink;
      const top = Math.max(81, futureAbsPos - scrollMarginTop);
      window.scrollTo(0, top);
    };

    const onWheel = (e: WheelEvent) => {
      if (mobileOpenRef.current) return;
      const heroNow = heroVisibleRef.current;
      if (heroNow && !prevHeroVisible) {
        heroJumpedRef.current = false;
        lockUntil = 0;
      }
      prevHeroVisible = heroNow;
      if (e.deltaY <= 0) return;
      if (heroNow || Date.now() < lockUntil) {
        e.preventDefault();
        jump();
      }
    };

    // Touch: mirrors the wheel handler above. Native touch scrolling is not
    // intercepted by default (touchstart/touchend alone can't stop it — only
    // a non-passive touchmove can), so without this the browser scrolls the
    // hero and #destinations together in real time before the 30px swipe
    // threshold below ever fires, and jump()'s programmatic scrollTo then
    // lands on top of wherever that native scroll left off. Preventing
    // default on touchmove while the hero is visible (or during the
    // post-jump lock window) blocks that native scroll entirely so the
    // section swap is the single, deliberate jump() below instead of a
    // blended scroll.
    let touchStartY = 0;
    let touchActive = false;

    const onTouchStart = (e: TouchEvent) => {
      if (mobileOpenRef.current) return;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (mobileOpenRef.current || !touchActive) return;

      const heroNow = heroVisibleRef.current;
      if (heroNow && !prevHeroVisible) {
        heroJumpedRef.current = false;
        lockUntil = 0;
      }
      prevHeroVisible = heroNow;

      // Positive deltaY == finger dragging up == scroll-down intent (same
      // sign convention as wheel's deltaY). Dragging down (returning toward
      // the hero) is left alone so native scroll keeps working for that
      // direction, same as the wheel handler's `deltaY <= 0` early return.
      const deltaY = touchStartY - e.touches[0].clientY;
      if (deltaY <= 0) return;

      if (heroNow || Date.now() < lockUntil) {
        e.preventDefault();
        if (deltaY > 30) jump();
      }
    };

    const onTouchEnd = () => {
      touchActive = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (mobileOpenRef.current) return;
      if (!heroVisibleRef.current) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isHome, navbarH]);

  // ───────────────────────────────────────────────────────────────────────────
  // Scroll handler — manages the scrolled shadow + hero expand/collapse.
  //
  // Two-state (boundary-crossing): heroVisible only flips when currentY
  // crosses 80px scrolling down or 20px scrolling up, so this triggers at
  // most two re-renders per pass instead of one per scroll frame. The actual
  // collapse animation is handled entirely by Framer Motion once heroVisible
  // flips (see isExpanded below) — not by this handler.
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const isLocked = Date.now() < scrollLockUntilRef.current;

      if (isLocked) {
        setScrolled(false);
        if (isHome) setHeroVisible(true);
        return;
      }

      setScrolled(currentY > 20);

      if (isHome) {
        const scrollingDown = currentY > lastScrollY.current;
        if (scrollingDown && currentY > 80) setHeroVisible(false);
        if (!scrollingDown && currentY < 20) setHeroVisible(true);
        lastScrollY.current = currentY;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        scrollLockUntilRef.current = Date.now() + 1500;
        heroJumpedRef.current = false;
        window.scrollTo(0, 0);
        setHeroVisible(true);
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
      }
    }
  }, [isHome]);

  // ───────────────────────────────────────────────────────────────────────────
  // Lock Body Scroll For Mobile Menu
  //
  // `overflow: hidden` alone does not stop iOS Safari from rubber-banding the
  // background page behind the open menu. Pinning the body with `position:
  // fixed` (and restoring the exact scroll offset on close) blocks that
  // background bleed-through while the menu's own content keeps scrolling
  // normally via its `overflow-y-auto` container.
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const { body, documentElement: html } = document;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";
      window.scrollTo(0, scrollY);
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
        // Clear the mobile-menu scroll lock synchronously (matches the
        // cleanup in the body-scroll-lock effect) so the smooth scroll below
        // isn't fighting a still-pinned `position: fixed` body.
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";

        // Lock scroll updates for 1.5 seconds so onScroll cannot collapse hero during smooth scroll
        scrollLockUntilRef.current = Date.now() + 1500;
        heroJumpedRef.current = false;
        setHeroVisible(true);
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
          setScrolled(false);
        }, 1200);
      }
    },
    [isHome]
  );

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
              // Two-state collapse: the header snaps between the full-hero
              // height and the compact navbar height once heroVisible flips,
              // rather than being scrubbed continuously against raw scroll
              // position.
              height: mobileOpen
                ? "calc(100svh - 32px)"
                : isExpanded
                  ? "95svh"
                  : `${navbarH}px`,
              marginTop: 0,
            }}
            transition={{
              duration: mobileOpen ? 0.5 : HERO_DURATION,
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
                      min-h-[67px]
                      gap-[14px]
                      lg:gap-[24px]
                      rounded-[18px]
                      border-[1px]
                      border-white/10
                      px-[14px]
                      lg:px-[20px]
                      py-[12px]
                      lg:py-[16px]
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

      <motion.div
        animate={{
          // Collapses in sync with the fixed header's own eased tween
          // (heroVisible flips → both animate together) instead of being
          // pinned open for the full scroll pass.
          height:
            isHome && heroVisible
              ? "100svh"
              : `${navbarH + 32}px`,
        }}
        transition={{ duration: HERO_DURATION, ease: HERO_EASE }}
        aria-hidden
      />
    </>
  );
}
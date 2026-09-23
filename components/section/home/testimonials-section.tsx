"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  rating: number;
  title: string;
  review: string;
  author: string;
  location: string;
}

const TESTIMONIALS_DATA: Testimonial[][] = [
  [
    {
      rating: 5,
      title: "Located where you need to be",
      review:
        "Central location, clean rooms, and genuinely helpful staff. Walking distance to Connaught Place made it perfect for both business and evening strolls.",
      author: "Parag",
      location: "Chennai",
    },
    {
      rating: 5,
      title: "Cozy & Modern Ambience",
      review:
        "Super convenient location with wonderful hospitality. The room was spotless, comfortable, and the staff was always attentive to every need.",
      author: "Karthik",
      location: "Bangalore",
    },
    {
      rating: 5,
      title: "Felt Right at Home",
      review:
        "Felt right at home from the moment we checked in. Cozy rooms, delicious South Indian breakfast, and great connectivity to transit points.",
      author: "Priya",
      location: "Madurai",
    },
  ],
  [
    {
      rating: 5,
      title: "Perfect Stay for Business",
      review:
        "High-speed Wi-Fi, peaceful environment, and great workspace in the room. The check-in process was seamless and quick.",
      author: "Ananya",
      location: "Bangalore",
    },
    {
      rating: 5,
      title: "Unmatched Cleanliness",
      review:
        "The rooms were spotless and the bed was exceptionally comfortable. Loved the eco-friendly toiletries provided.",
      author: "David",
      location: "United Kingdom",
    },
    {
      rating: 5,
      title: "Memorable Weekend Getaway",
      review:
        "The ambience is peaceful, serene, and relaxing. Delicious breakfast and super supportive concierge staff.",
      author: "Sneha",
      location: "Hyderabad",
    },
  ],
  [
    {
      rating: 5,
      title: "Great for Digital Nomads",
      review:
        "Worked remotely for a week from Kattil. Reliable power, super fast internet, and fantastic filter coffee every morning.",
      author: "Rahul",
      location: "Mumbai",
    },
    {
      rating: 5,
      title: "Loved the Thoughtful Design",
      review:
        "The minimal earthy interior design and subtle lighting make you instantly relax after a long journey.",
      author: "Elena",
      location: "Germany",
    },
    {
      rating: 5,
      title: "Superb Location & Value",
      review:
        "Easy access to public transit, quiet at night, and very friendly team. Would definitely recommend to anyone visiting.",
      author: "Aravind",
      location: "Pune",
    },
  ],
  [
    {
      rating: 5,
      title: "Best Value for Money",
      review:
        "Everything from the linen to the bathroom fittings was premium. Can't wait to return to their upcoming properties.",
      author: "Vikram",
      location: "Chennai",
    },
    {
      rating: 5,
      title: "Warm and Helpful Staff",
      review:
        "Any request we had was handled with a smile. The 24/7 assistance and clean atmosphere made traveling with family easy.",
      author: "Pooja",
      location: "Kochi",
    },
    {
      rating: 5,
      title: "Unmatched Hospitality",
      review:
        "A truly refreshing experience. Kattil sets a new standard for modern community-driven stays in South India.",
      author: "Marcus",
      location: "Australia",
    },
  ],
];

const ALL_TESTIMONIALS = TESTIMONIALS_DATA.flat();
const CARDS_PER_DESKTOP_SLIDE = TESTIMONIALS_DATA[0].length;

type CarouselMode = "mobile" | "desktop" | null;

interface TrackItem {
  key: string;
  item: Testimonial;
  isClone: boolean;
}

const ORIGINAL_ITEMS: TrackItem[] = ALL_TESTIMONIALS.map((item, i) => ({
  key: `orig-${i}`,
  item,
  isClone: false,
}));

// Mobile: 3 sets (clone, original, clone) for continuous seamless infinite loop.
// Original cards keep their keys so they are not remounted when clones are added.
const MOBILE_ITEMS: TrackItem[] = [
  ...ALL_TESTIMONIALS.map((item, i) => ({ key: `pre-${i}`, item, isClone: true })),
  ...ORIGINAL_ITEMS,
  ...ALL_TESTIMONIALS.map((item, i) => ({ key: `post-${i}`, item, isClone: true })),
];

// Desktop: originals + cloned 1st slide for seamless forward slideshow loop (0, 1, 2, 3, 0)
const DESKTOP_ITEMS: TrackItem[] = [
  ...ORIGINAL_ITEMS,
  ...ALL_TESTIMONIALS.slice(0, CARDS_PER_DESKTOP_SLIDE).map((item, i) => ({
    key: `post-${i}`,
    item,
    isClone: true,
  })),
];

export default function TestimonialsSection() {
  // Responsive mode is only known after mount; server + first client render use originals only
  const [mode, setMode] = useState<CarouselMode>(null);

  // Desktop slideshow state
  const [desktopSlideIndex, setDesktopSlideIndex] = useState(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState(true);
  const [isDesktopPaused, setIsDesktopPaused] = useState(false);
  const desktopResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile state
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isMobilePaused, setIsMobilePaused] = useState(false);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const mobileResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAdjustingScrollRef = useRef(false);

  // ── RESPONSIVE MODE (client only) ─────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const applyMode = () => {
      setIsSlideAnimating(false);
      setDesktopSlideIndex(0);
      setMobileActiveIndex(0);
      setMode(mq.matches ? "desktop" : "mobile");
    };
    applyMode();
    mq.addEventListener("change", applyMode);
    return () => mq.removeEventListener("change", applyMode);
  }, []);

  const trackItems =
    mode === "mobile" ? MOBILE_ITEMS : mode === "desktop" ? DESKTOP_ITEMS : ORIGINAL_ITEMS;

  // ── DESKTOP SEAMLESS SLIDESHOW ADVANCE ────────────────────────────────────
  const nextDesktopSlide = useCallback(() => {
    setIsSlideAnimating(true);
    setDesktopSlideIndex((prev) => {
      if (prev >= TESTIMONIALS_DATA.length) {
        return 1;
      }
      return prev + 1;
    });
  }, []);

  useEffect(() => {
    if (mode !== "desktop" || isDesktopPaused) return;

    const interval = setInterval(() => {
      nextDesktopSlide();
    }, 3500);

    return () => clearInterval(interval);
  }, [mode, isDesktopPaused, nextDesktopSlide]);

  const handleDesktopAnimationComplete = () => {
    // When finished sliding into the cloned 1st slide (index 4)
    if (desktopSlideIndex === TESTIMONIALS_DATA.length) {
      // Instantly reset to slide 0 without animation
      setIsSlideAnimating(false);
      setDesktopSlideIndex(0);
    }
  };

  const handleDesktopCardHover = (paused: boolean) => {
    if (mode !== "desktop") return;
    if (desktopResumeTimerRef.current) clearTimeout(desktopResumeTimerRef.current);
    if (paused) {
      setIsDesktopPaused(true);
    } else {
      desktopResumeTimerRef.current = setTimeout(() => {
        setIsDesktopPaused(false);
      }, 1500);
    }
  };

  const goToDesktopSlide = (targetIndex: number) => {
    if (mode !== "desktop") return;
    setIsSlideAnimating(true);
    setDesktopSlideIndex(targetIndex);
    handleDesktopCardHover(true);
    setTimeout(() => handleDesktopCardHover(false), 2000);
  };

  // Helper to get mobile single card step width (card width + gap)
  const getCardStep = useCallback(() => {
    if (!mobileScrollRef.current) return 0;
    const firstCard = mobileScrollRef.current.firstElementChild as HTMLElement | null;
    if (!firstCard || firstCard.offsetWidth === 0) return 0;
    return firstCard.offsetWidth + 16; // 16px is gap-4
  }, []);

  // ── MOBILE INITIAL SCROLL (Center on middle set) ──────────────────────────
  useEffect(() => {
    if (mode !== "mobile") return;

    const setupInitialPosition = () => {
      const el = mobileScrollRef.current;
      if (!el) return;
      const step = getCardStep();
      if (step > 0) {
        const singleSetWidth = step * ALL_TESTIMONIALS.length;
        isAdjustingScrollRef.current = true;
        el.scrollLeft = singleSetWidth;
        setTimeout(() => {
          isAdjustingScrollRef.current = false;
        }, 50);
      }
    };

    const timer = setTimeout(setupInitialPosition, 100);
    return () => clearTimeout(timer);
  }, [mode, getCardStep]);

  // ── MOBILE SCROLL EVENT (Infinite loop & active dot sync) ─────────────────
  const handleMobileScroll = useCallback(() => {
    if (mode !== "mobile") return;
    const el = mobileScrollRef.current;
    if (!el || isAdjustingScrollRef.current) return;

    const step = getCardStep();
    if (step <= 0) return;

    const singleSetWidth = step * ALL_TESTIMONIALS.length;

    // Boundary check for infinite loop: when scrolled past middle set, seamlessly adjust
    if (el.scrollLeft >= singleSetWidth * 2) {
      isAdjustingScrollRef.current = true;
      el.scrollLeft -= singleSetWidth;
      setTimeout(() => {
        isAdjustingScrollRef.current = false;
      }, 30);
    } else if (el.scrollLeft <= singleSetWidth * 0.1) {
      isAdjustingScrollRef.current = true;
      el.scrollLeft += singleSetWidth;
      setTimeout(() => {
        isAdjustingScrollRef.current = false;
      }, 30);
    }

    // Calculate current active dot (0 to 11)
    const rawIndex = Math.round((el.scrollLeft - singleSetWidth) / step);
    const normalized = ((rawIndex % ALL_TESTIMONIALS.length) + ALL_TESTIMONIALS.length) % ALL_TESTIMONIALS.length;
    setMobileActiveIndex(normalized);
  }, [mode, getCardStep]);

  // ── MOBILE AUTO-SCROLL (Continuous forward smooth scroll every 3s) ────────
  useEffect(() => {
    if (mode !== "mobile" || isMobilePaused) return;

    const interval = setInterval(() => {
      const el = mobileScrollRef.current;
      if (!el) return;
      if (el.offsetParent === null) return;

      const step = getCardStep();
      if (step <= 0) return;

      // Always scroll smoothly to the NEXT card forward (no rewinding!)
      el.scrollBy({ left: step, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(interval);
  }, [mode, isMobilePaused, getCardStep]);

  // Mobile user touch/interaction handlers
  const handleMobileInteractionStart = () => {
    if (mode !== "mobile") return;
    setIsMobilePaused(true);
    if (mobileResumeTimerRef.current) clearTimeout(mobileResumeTimerRef.current);
  };

  const handleMobileInteractionEnd = () => {
    if (mode !== "mobile") return;
    if (mobileResumeTimerRef.current) clearTimeout(mobileResumeTimerRef.current);
    mobileResumeTimerRef.current = setTimeout(() => {
      setIsMobilePaused(false);
    }, 2500);
  };

  // Scroll directly to a card when mobile dot is tapped
  const scrollToMobileCard = (targetIndex: number) => {
    if (mode !== "mobile") return;
    const el = mobileScrollRef.current;
    if (!el) return;
    const step = getCardStep();
    if (step <= 0) return;

    handleMobileInteractionStart();
    const singleSetWidth = step * ALL_TESTIMONIALS.length;
    const targetScroll = singleSetWidth + targetIndex * step;
    el.scrollTo({ left: targetScroll, behavior: "smooth" });
    handleMobileInteractionEnd();
  };

  const currentDesktopActiveDot = desktopSlideIndex % TESTIMONIALS_DATA.length;

  return (
    <section className="w-full bg-transparent pt-12 md:pt-[80px] pb-16 md:pb-28 overflow-x-hidden">
      <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
        <div className="px-5 md:px-8 lg:px-12">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-[#0d1b2e] text-[26px] sm:text-[40px] md:text-[44px] font-sans font-normal tracking-tight">
              What our{" "}
              <span className="font-serif italic font-normal text-[#0d1b2e]">
                Guests say
              </span>
            </h2>
          </motion.div>

          {/* ── Responsive Carousel ──────────────────────────────────────────
              Mobile (< md): native horizontal scroll-snap carousel.
              Desktop (>= md): Framer Motion slideshow, 3 cards per slide. */}
          <div
            onMouseEnter={() => handleDesktopCardHover(true)}
            onMouseLeave={() => handleDesktopCardHover(false)}
            className="md:overflow-hidden md:w-full md:py-2"
          >
            {/* Track: mobile scroll container / desktop slideshow track */}
            <motion.div
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
              onTouchStart={handleMobileInteractionStart}
              onTouchEnd={handleMobileInteractionEnd}
              onTouchCancel={handleMobileInteractionEnd}
              animate={{ x: `-${desktopSlideIndex * 100}%` }}
              transition={
                isSlideAnimating
                  ? { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
                  : { duration: 0 }
              }
              onAnimationComplete={handleDesktopAnimationComplete}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-5 -mx-5 pb-2 scroll-smooth md:w-full md:gap-6 md:overflow-visible md:snap-none md:px-1 md:mx-0 md:pb-0 md:scroll-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {trackItems.map(({ key, item, isClone }) => (
                <div
                  key={key}
                  aria-hidden={isClone ? true : undefined}
                  // Desktop: every 3rd card ends a slide; -16px margin keeps the original 8px gap between slides
                  className="w-[calc(100vw-64px)] max-w-[340px] md:w-[calc((100%-48px)/3)] md:max-w-none md:[&:nth-child(3n)]:-mr-4 shrink-0 snap-start bg-white rounded-[20px] p-5 sm:p-6 md:p-8 flex flex-col justify-between border border-black/[0.04] md:border-black/[0.03] select-none md:select-auto md:transition-all md:duration-300 min-h-[260px] md:min-h-[290px]"
                >
                  <div>
                    {/* 5 Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]"
                        />
                      ))}
                    </div>

                    {/* Title */}
                    <p className="text-[17px] sm:text-[18px] md:text-[20px] text-[#0d1b2e] mt-3.5 md:mt-4 leading-snug">
                      {item.title}
                    </p>

                    {/* Review Text */}
                    <p className="text-gray-600 text-[14px] sm:text-[15px] md:text-[15.5px] leading-relaxed mt-2.5 md:mt-4 font-light">
                      {item.review}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="mt-5 md:mt-6 pt-3.5 md:pt-4 border-t border-gray-100 flex items-center justify-between md:block">
                    <div>
                      <p className="text-[13.5px] md:text-[14px] text-[#0d1b2e]">
                        {item.author}
                      </p>
                      <p className="text-[11.5px] md:text-[12px] text-gray-400 mt-0.5">
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots (Mobile) */}
          <div className="flex md:hidden justify-center items-center gap-1.5 mt-6">
            {ALL_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToMobileCard(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`transition-all duration-300 cursor-pointer ${mobileActiveIndex === i
                  ? "w-6 h-2 bg-[#8EA980] rounded-full"
                  : "w-2 h-2 bg-[#D1D5DB] hover:bg-gray-400 rounded-full"
                  }`}
              />
            ))}
          </div>

          {/* Pagination Dots (Desktop Slideshow) */}
          <div className="hidden md:flex justify-center items-center gap-2 mt-10">
            {TESTIMONIALS_DATA.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToDesktopSlide(i)}
                aria-label={`Go to testimonial slide ${i + 1}`}
                className={`transition-all duration-300 cursor-pointer ${currentDesktopActiveDot === i
                  ? "w-7 h-2.5 bg-[#8EA980] rounded-full scale-105"
                  : "w-2.5 h-2.5 bg-[#D1D5DB] hover:bg-gray-400 rounded-full"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

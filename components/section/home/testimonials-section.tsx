"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

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
        "Central location, clean rooms, and genuinely helpful staff. Walking distance to Connaught Place made it perfect for both business and evening strolls",
      author: "Parag",
      location: "Chennai",
    },
    {
      rating: 5,
      title: "Located where you need to be",
      review:
        "Central location, clean rooms, and genuinely helpful staff. Walking distance to Connaught Place made it perfect for both business and evening strolls",
      author: "Parag",
      location: "Chennai",
    },
    {
      rating: 5,
      title: "Located where you need to be",
      review:
        "Central location, clean rooms, and genuinely helpful staff. Walking distance to Connaught Place made it perfect for both business and evening strolls",
      author: "Parag",
      location: "Chennai",
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

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkMobileScroll = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkMobileScroll();
  }, []);

  // Auto-slide for desktop every 2 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setActiveIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-slide for mobile every 2 seconds
  useEffect(() => {
    if (isPaused) return;

    const mobileInterval = setInterval(() => {
      if (typeof window !== "undefined" && window.innerWidth < 768 && mobileScrollRef.current) {
        const el = mobileScrollRef.current;
        if (el.offsetParent === null) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;
        if (el.scrollLeft >= maxScroll - 20) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const firstCard = el.firstElementChild as HTMLElement | null;
          const step = firstCard ? firstCard.offsetWidth + 16 : el.clientWidth * 0.85;
          el.scrollBy({ left: step, behavior: "smooth" });
        }
        setTimeout(checkMobileScroll, 350);
      }
    }, 2000);

    return () => clearInterval(mobileInterval);
  }, [isPaused]);

  const scrollMobile = (direction: "left" | "right") => {
    if (mobileScrollRef.current) {
      const cardWidth = mobileScrollRef.current.clientWidth * 0.85;
      mobileScrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkMobileScroll, 350);
    }
  };

  const currentReviews = TESTIMONIALS_DATA[activeIndex] || TESTIMONIALS_DATA[0];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="w-full bg-transparent pt-10 pb-16 md:pt-18 md:pb-28 overflow-x-hidden"
    >
      <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-[#0d1b2e] text-[26px] sm:text-[40px] md:text-[44px] font-sans font-normal tracking-tight">
              What our{" "}
              <span className="font-serif italic font-normal text-[#0d1b2e]">
                Guests say
              </span>
            </h2>
          </motion.div>

          {/* ── Mobile Carousel View (< md) ─────────────────────────────────── */}
          <div className="block md:hidden">
            <div
              ref={mobileScrollRef}
              onScroll={checkMobileScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 -mx-4 pb-2 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {ALL_TESTIMONIALS.map((item, index) => (
                <div
                  key={`mobile-${index}`}
                  className="w-[85vw] max-w-[340px] shrink-0 snap-center bg-white rounded-[18px] p-5 sm:p-6 flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-black/[0.04] select-none"
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
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-[#0d1b2e] mt-3.5 leading-snug">
                      {item.title}
                    </h3>

                    {/* Review Text */}
                    <p className="text-gray-600 text-[14px] sm:text-[15px] leading-relaxed mt-2.5 font-light">
                      {item.review}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[13.5px] font-bold text-[#0d1b2e]">
                        {item.author}
                      </p>
                      <p className="text-[11.5px] text-gray-400 mt-0.5">
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrow Buttons (Mobile) */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => scrollMobile("left")}
                disabled={!canScrollLeft}
                aria-label="Previous review"
                className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 active:scale-95 ${canScrollLeft
                  ? "bg-[#EDF5E4] text-[#526442] hover:bg-[#DCEAC8] border border-[#526442]/20 cursor-pointer shadow-xs"
                  : "bg-[#EDF5E4]/40 text-[#A3B596] border border-black/[0.04] cursor-not-allowed"
                  }`}
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => scrollMobile("right")}
                disabled={!canScrollRight}
                aria-label="Next review"
                className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 active:scale-95 ${canScrollRight
                  ? "bg-[#EDF5E4] text-[#526442] hover:bg-[#DCEAC8] border border-[#526442]/20 cursor-pointer shadow-xs"
                  : "bg-[#EDF5E4]/40 text-[#A3B596] border border-black/[0.04] cursor-not-allowed"
                  }`}
              >
                <ArrowRight className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* ── Desktop Grid View (>= md) ────────────────────────────────────── */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentReviews.map((item, index) => (
                <motion.div
                  key={`${activeIndex}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="bg-white rounded-[18px] p-6 sm:p-7 md:p-8 flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-black/[0.03] hover:shadow-[0_10px_32px_rgba(0,0,0,0.06)] transition-all duration-300"
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
                    <h3 className="text-[20px] font-bold text-[#0d1b2e] mt-4 leading-snug">
                      {item.title}
                    </h3>

                    {/* Review Text */}
                    <p className="text-gray-600 text-[16px] leading-relaxed mt-4 font-light">
                      {item.review}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-[14px] font-bold text-[#0d1b2e]">
                      {item.author}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {item.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Dots (Desktop) */}
            <div className="flex justify-center items-center gap-2.5 mt-12">
              {TESTIMONIALS_DATA.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to testimonial page ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${activeIndex === i
                    ? "w-2.5 h-2.5 bg-[#8EA980] scale-110"
                    : "w-2.5 h-2.5 bg-[#D1D5DB] hover:bg-gray-400"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

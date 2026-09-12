"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { usePageView } from "@/hooks/usePageView";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface PublicGalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: string;
  citySlug?: string;
  cityName?: string;
  featured?: boolean;
  width?: number;
  height?: number;
}

export interface PublicGalleryCategory {
  slug: string;
  name: string;
}

export const STATIC_CATEGORIES: PublicGalleryCategory[] = [
  { slug: "all", name: "All" },
  { slug: "rooms", name: "Rooms" },
  { slug: "exterior", name: "Exterior" },
  { slug: "outdoor", name: "Outdoor" },
  { slug: "resort", name: "Resort" },
  { slug: "dining", name: "Dining" },
  { slug: "experience", name: "Experience" },
];

export const STATIC_ITEMS: PublicGalleryItem[] = [
  {
    id: "g-1",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Minimalist Luxury Suite with Oak Wood Partition",
    category: "rooms",
  },
  {
    id: "g-2",
    src: "/images/gallery/sunny-balcony-guest.jpg",
    alt: "Sunny Resort Balcony Space",
    caption: "Sunlit Resort Balcony & Serene Views",
    category: "resort",
  },
  {
    id: "g-3",
    src: "/images/home/dining-community.png",
    alt: "Homely Dining Experience",
    caption: "Artisan Flavors & Authentic Homely Dining",
    category: "dining",
  },
  {
    id: "g-4",
    src: "/images/gallery/bikers-adventure.jpg",
    alt: "Travelers and Bikers Adventure",
    caption: "Community Excursions & Local Explorations",
    category: "experience",
  },
  {
    id: "g-5",
    src: "/images/gallery/luxury-suite-mockup.jpg",
    alt: "Executive King Room",
    caption: "Handcrafted Wood Accents & Ambient Suite",
    category: "rooms",
  },
  {
    id: "g-6",
    src: "/images/gallery/community-group.jpg",
    alt: "Friendly Gatherings & Common Lounge",
    caption: "Memorable Gatherings in the Lounge",
    category: "experience",
  },
  {
    id: "g-7",
    src: "/images/home/ocean-sunset.png",
    alt: "Coastal Resort Panorama",
    caption: "Golden Sunset & Relaxing Stays",
    category: "resort",
  },
  {
    id: "g-8",
    src: "/images/home/temple-offer.png",
    alt: "Heritage Architecture at Kattil",
    caption: "Heritage Architectural Beauty & Surroundings",
    category: "resort",
  },
  {
    id: "g-9",
    src: "/images/home/hills-offer.png",
    alt: "Nature Getaway Stay",
    caption: "Signature Kattil Hospitality in Nature",
    category: "experience",
  },
];

export default function GalleryContent({
  items: initialItems,
  categories: initialCategories,
  initialCity,
  initialCategory,
}: {
  items: PublicGalleryItem[];
  categories: PublicGalleryCategory[];
  initialCity?: string;
  initialCategory?: string;
}) {
  usePageView();

  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory ? initialCategory.toLowerCase() : "all"
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Gallery items fallback
  const allItems = useMemo(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems;
    }
    return STATIC_ITEMS;
  }, [initialItems]);

  // Build categories list
  const categoriesList = useMemo(() => {
    const list: PublicGalleryCategory[] = [{ slug: "all", name: "All" }];
    const seen = new Set<string>(["all"]);

    if (initialCategories && initialCategories.length > 0) {
      for (const c of initialCategories) {
        const slug = c.slug.toLowerCase().trim();
        if (!seen.has(slug)) {
          seen.add(slug);
          list.push({ slug, name: c.name });
        }
      }
    }

    // Check if items have unique categories not present
    for (const item of allItems) {
      if (item.category && !seen.has(item.category.toLowerCase())) {
        seen.add(item.category.toLowerCase());
        const capitalized =
          item.category.charAt(0).toUpperCase() + item.category.slice(1);
        list.push({ slug: item.category.toLowerCase(), name: capitalized });
      }
    }

    return list;
  }, [initialCategories, allItems]);

  // Filter items by city (if provided in URL) and category
  const filteredItems = useMemo(() => {
    let result = allItems;

    // Filter by city if navigated from a particular property or URL param
    if (initialCity && initialCity.toLowerCase() !== "all") {
      const lowerCity = initialCity.toLowerCase().trim();
      result = result.filter((item) => {
        const itemCitySlug = item.citySlug?.toLowerCase();
        const itemCityName = item.cityName?.toLowerCase();
        return (
          itemCitySlug === lowerCity ||
          itemCityName === lowerCity ||
          itemCitySlug?.includes(lowerCity) ||
          itemCityName?.includes(lowerCity)
        );
      });
    }

    // Filter by active category
    if (activeCategory && activeCategory !== "all") {
      const lowerCat = activeCategory.toLowerCase().trim();
      result = result.filter((item) => {
        const itemCat = item.category?.toLowerCase();
        return itemCat === lowerCat || itemCat?.includes(lowerCat);
      });
    }

    return result;
  }, [allItems, initialCity, activeCategory]);

  // Lightbox keyboard navigation
  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  }, [lightboxIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Top Fixed Navbar ──────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Header Section (Sage Green) ───────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-[64px]">
        {/* Right Background Monument Skyline Silhouette */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.2 }}
          className="hidden md:flex absolute right-0 bottom-0 top-auto md:h-[78%] lg:h-[82%] md:w-[40%] lg:w-[34%] max-w-[460px] pointer-events-none z-0 overflow-hidden items-end justify-end pr-2 md:pr-6"
        >
          <div
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: "url('/images/partners/hero-skyline.png')",
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
            }}
          />
        </motion.div>

        {/* Hero Content aligned straight down with Navbar container */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="font-[Public_Sans] font-semibold text-[14px] leading-[14px] tracking-normal text-left align-middle uppercase text-white/95 mb-3 drop-shadow-xs"
            >
              CAPTURE OUR MOMENTS
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] leading-[1.12]">
                Moments to{" "}
                <span className="font-serif font-normal italic text-[#f4f7ef]">
                  Remember
                </span>
              </span>
              <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1 whitespace-nowrap">
                our hotel
              </span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── 2. Gallery Content Section ────────────────────────────────────── */}
      <section className="relative z-20 w-full py-10 sm:py-12 md:py-16 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Category Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="mb-8 sm:mb-10"
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categoriesList.map((cat) => {
                  const isSelected =
                    (cat.slug === "all" && (!activeCategory || activeCategory === "all")) ||
                    cat.slug.toLowerCase() === activeCategory.toLowerCase();

                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`font-[Public_Sans] text-[13px] sm:text-[13.5px] transition-all whitespace-nowrap cursor-pointer px-3.5 sm:px-4 py-1.5 rounded-[6px] ${
                        isSelected
                          ? "bg-[#b4c7a5] text-[#22301c] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                          : "text-[#6b7280] hover:text-[#111827] font-medium hover:bg-[#eae8e3]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Gallery Responsive Grid */}
            {filteredItems.length === 0 ? (
              <div className="py-24 text-center text-gray-500 font-sans">
                No moments found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 w-full items-start">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min((idx % 6) * 0.05, 0.25),
                      ease: EASE,
                    }}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-[10px] overflow-hidden bg-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] cursor-pointer"
                  >
                    <Image
                      src={item.src}
                      alt={item.alt || "Kattil Hotel Space"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <span className="text-white font-[Public_Sans] text-[13px] font-semibold tracking-wide translate-y-1 group-hover:translate-y-0 transition-all duration-300 drop-shadow-md">
                        {item.caption || item.alt || "View Space"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Fullscreen Lightbox Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Close photo"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Next button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Next photo"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            {/* Modal Image Box */}
            <div
              className="relative max-w-5xl max-h-[85vh] w-full h-[80vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={filteredItems[lightboxIndex].src}
                  alt={filteredItems[lightboxIndex].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Caption Bar */}
              <div className="mt-4 text-center">
                <p className="font-[Public_Sans] text-white/90 text-[14px] font-medium">
                  {filteredItems[lightboxIndex].caption || filteredItems[lightboxIndex].alt}
                </p>
                <p className="font-[Public_Sans] text-white/50 text-[12px] mt-1">
                  {lightboxIndex + 1} / {filteredItems.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  { slug: "resort", name: "Resort" },
  { slug: "dining", name: "Dining" },
  { slug: "rooms", name: "Rooms" },
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
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Curved Cove Ceiling & Serene Bedding",
    category: "resort",
  },
  {
    id: "g-3",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Contemporary Hotel Suite Overview",
    category: "rooms",
  },
  {
    id: "g-4",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Serene Boutique Bedroom Space",
    category: "experience",
  },
  {
    id: "g-5",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Handcrafted Wood Accents & Woven Decor",
    category: "dining",
  },
  {
    id: "g-6",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Ambient Lighting & Relaxed Lounge",
    category: "rooms",
  },
  {
    id: "g-7",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Warmly Lit Bedroom Architecture",
    category: "experience",
  },
  {
    id: "g-8",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Modern Suite with Ensuite Lounge",
    category: "resort",
  },
  {
    id: "g-9",
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: "Luxury Hotel Bedroom Suite",
    caption: "Signature Kattil Hospitality Space",
    category: "dining",
  },
];

export default function GalleryContent({
  items: initialItems,
  categories: initialCategories,
}: {
  items: PublicGalleryItem[];
  categories: PublicGalleryCategory[];
}) {
  usePageView();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Categories list matching mockup
  const categoriesList = useMemo(() => {
    if (initialCategories && initialCategories.length > 0) {
      const hasAll = initialCategories.some((c) => c.slug.toLowerCase() === "all");
      const list = hasAll ? initialCategories : [{ slug: "all", name: "All" }, ...initialCategories];
      return list;
    }
    return STATIC_CATEGORIES;
  }, [initialCategories]);

  // Gallery items fallback
  const allItems = useMemo(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems;
    }
    return STATIC_ITEMS;
  }, [initialItems]);

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    if (!activeCategory || activeCategory === "all") {
      return allItems;
    }
    const lower = activeCategory.toLowerCase();
    return allItems.filter(
      (item) => item.category?.toLowerCase() === lower || item.category?.toLowerCase().includes(lower)
    );
  }, [allItems, activeCategory]);

  // Split into 3 columns for staggered masonry layout
  const columns = useMemo(() => {
    const col1: PublicGalleryItem[] = [];
    const col2: PublicGalleryItem[] = [];
    const col3: PublicGalleryItem[] = [];

    filteredItems.forEach((item, idx) => {
      if (idx % 3 === 0) col1.push(item);
      else if (idx % 3 === 1) col2.push(item);
      else col3.push(item);
    });

    return [col1, col2, col3];
  }, [filteredItems]);

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
      <section className="relative w-full bg-[#9caf88] overflow-hidden pt-36 md:pt-44 lg:pt-50 pb-16 md:pb-22">
        {/* Right Background Monument Skyline Silhouette */}
        <div className="absolute right-0 bottom-0 top-auto h-[65%] sm:h-[72%] md:h-[78%] lg:h-[82%] w-[70%] sm:w-[48%] md:w-[40%] lg:w-[34%] max-w-[460px] pointer-events-none z-0 overflow-hidden flex items-end justify-end pr-2 md:pr-6">
          <div
            className="w-full h-full opacity-85 md:opacity-90 bg-no-repeat"
            style={{
              backgroundImage: "url('/images/partners/hero-skyline.png')",
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
            }}
          />
        </div>

        {/* Hero Content aligned straight down with Navbar container */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 max-w-3xl">
            <p className="font-[Public_Sans] font-semibold text-[14px] leading-[14px] tracking-normal text-left align-middle uppercase text-white/95 mb-3 drop-shadow-xs">
              CAPTURE OUR MOMENTS
            </p>
            <h1 className="text-white tracking-tight">
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] leading-[1.12]">
                Moments to{" "}
                <span className="font-serif font-normal italic text-[#f4f7ef]">
                  Remember our
                </span>
              </span>
              <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1">
                hotel
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── 2. Gallery Content Section ────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-12 md:py-16 bg-[#FAF8F5]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Category Filter Tabs */}
            <div className="mb-10 sm:mb-12">
              <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
                {categoriesList.map((cat) => {
                  const isSelected =
                    (cat.slug === "all" && (!activeCategory || activeCategory === "all")) ||
                    cat.slug.toLowerCase() === activeCategory.toLowerCase();

                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`font-[Public_Sans] text-[13px] sm:text-[13.5px] transition-all whitespace-nowrap cursor-pointer px-4 py-1.5 rounded-[6px] ${
                        isSelected
                          ? "bg-[#b4c7a5] text-[#22301c] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                          : "text-[#6b7280] hover:text-[#111827] font-medium"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gallery Staggered 3-Column Grid */}
            {filteredItems.length === 0 ? (
              <div className="py-24 text-center text-gray-500 font-sans">
                No moments found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full items-start">
                {columns.map((colItems, colIdx) => (
                  <div
                    key={colIdx}
                    className={`flex flex-col gap-[24px] w-full ${
                      colIdx === 1 ? "lg:pt-[110px]" : ""
                    }`}
                  >
                    {colItems.map((item, itemIdx) => {
                      const globalIdx = filteredItems.findIndex((i) => i.id === item.id);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{
                            duration: 0.5,
                            delay: (colIdx * 3 + itemIdx) * 0.07,
                            ease: EASE,
                          }}
                          onClick={() => setLightboxIndex(globalIdx)}
                          className="group relative w-full h-[380px] sm:h-[460px] lg:h-[538px] rounded-[8px] overflow-hidden bg-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] cursor-pointer"
                        >
                          <Image
                            src={item.src}
                            alt={item.alt || "Kattil Hotel Space"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400 flex items-end p-5">
                            <span className="text-white font-[Public_Sans] text-[12px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 drop-shadow-md">
                              {item.caption || item.alt || "View Space"}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
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

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Wifi,
  Utensils,
  Dumbbell,
  Shield,
  Sparkles,
  Lock,
  BellRing,
  ArrowRight,
  Check,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import RoomStickyBookingWidget from "./RoomStickyBookingWidget";
import { locationRooms } from "@/lib/data";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface PropertyRoomOption {
  _id: string;
  name: string;
  slug?: string;
  badge?: string; // "Private room", "Dormitory", "Luxury Suite"
  description?: string;
  images: string[];
  amenities: string[];
  bookingLink?: string;
  price?: string;
}

export interface PropertyDetailsData {
  _id?: string;
  name: string;
  slug?: string;
  destinationName: string;
  destinationSlug?: string;
  tagline?: string;
  description: string;
  heroImages: string[];
  galleryImages?: string[];
  address: string;
  mapLink?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  rooms: PropertyRoomOption[];
  directions?: {
    railway?: string;
    busStand?: string;
    landmark?: string;
    byCar?: string;
    important?: string;
    helpText?: string;
  };
}

const DEFAULT_GALLERY_IMAGES = [
  "/images/gallery/community-group.jpg",
  "/images/gallery/sunny-balcony-guest.jpg",
  "/images/gallery/bikers-adventure.jpg",
  "/assets/about-us-1.webp",
];

const AMENITY_ICONS = [
  { label: "Locker", icon: Lock },
  { label: "Holistic SPA", icon: Sparkles },
  { label: "Modern Gym", icon: Dumbbell },
  { label: "High Speed Wi-Fi", icon: Wifi },
  { label: "Locker", icon: Shield },
  { label: "Fine Dining", icon: Utensils },
  { label: "High Speed Wi-Fi", icon: Wifi },
  { label: "24/7 Butler", icon: BellRing },
];

export default function PropertyDetailsView({ data }: { data: PropertyDetailsData }) {
  const [howToReachOpen, setHowToReachOpen] = useState(true);

  // 1. Prepare Base Hero Images
  const baseImages = useMemo(() => {
    if (data.heroImages && data.heroImages.length > 0) {
      return data.heroImages;
    }
    return [
      "/assets/kattil-room-hero.webp",
      "/assets/deluxe-garden-suite.webp",
      "/assets/ac-double-room.webp",
    ];
  }, [data.heroImages]);

  // 2. Prepare Property Gallery Images from Admin Panel
  const propertyGalleryImages = useMemo(() => {
    if (data.galleryImages && data.galleryImages.length > 0) {
      return data.galleryImages;
    }
    return [];
  }, [data.galleryImages]);

  // Ensure minimum 3 items for full side-peek wrapping
  const images = useMemo(() => {
    if (baseImages.length === 2) {
      return [...baseImages, ...baseImages];
    }
    return baseImages;
  }, [baseImages]);

  // Triple set for infinite looping buffer
  const extendedImages = useMemo(() => {
    if (images.length <= 1) return images;
    return [...images, ...images, ...images];
  }, [images]);

  // Start with middle set so slide 0 is in center with left & right peeks
  const [currentIndex, setCurrentIndex] = useState(() => (images.length > 1 ? images.length : 0));
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  // Keep currentIndex synced if images change
  useEffect(() => {
    if (images.length > 1) {
      setCurrentIndex(images.length);
    } else {
      setCurrentIndex(0);
    }
  }, [images.length]);

  const activeDotIndex = images.length > 0 ? currentIndex % images.length : 0;

  const handlePrevSlide = () => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNextSlide = () => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  // Autoplay slideshow with smooth 3s interval (2 to 4 seconds)
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  // Handle seamless infinite loop bounds
  const handleTransitionEnd = () => {
    if (images.length <= 1) return;
    if (currentIndex >= images.length * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - images.length);
    } else if (currentIndex < images.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + images.length);
    }
  };

  // Re-enable CSS transitions on next frame after silent jump
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };

  const onTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX > 50) {
        handlePrevSlide();
      } else if (touchDeltaX < -50) {
        handleNextSlide();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  const handleCheckAvailability = () => {
    if (data.rooms[0]?.bookingLink) {
      window.open(data.rooms[0].bookingLink, "_blank");
    } else {
      window.location.href = "/contact-us";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EB] text-[#111827]">
      {/* Top Navbar */}
      <Navbar />

      <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
        <div className="px-5 md:px-8 lg:px-15 pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-48 sm:pb-44 lg:pb-20">
          {/* ── 1. Top Panoramic Hero Carousel (Edge-to-Edge Full-Bleed Slideshow) ── */}
          <section
            className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden select-none mb-8 sm:mb-12 md:mb-16 py-1 [--slide-width:88vw] [--slide-offset:6vw] [--slide-gap:10px] sm:[--slide-width:82vw] sm:[--slide-offset:9vw] sm:[--slide-gap:12px] md:[--slide-width:76vw] md:[--slide-offset:12vw] md:[--slide-gap:16px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Carousel Slider Track */}
            <div
              className="flex items-center"
              style={{
                transform: `translateX(calc(var(--slide-offset) - (${currentIndex} * var(--slide-width)) - (${currentIndex} * var(--slide-gap)) + ${touchDeltaX}px))`,
                gap: "var(--slide-gap)",
                transition: isTransitioning
                  ? "transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedImages.map((img, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(idx);
                    }}
                    className={`shrink-0 w-[var(--slide-width)] aspect-[4/3] sm:aspect-[16/10] md:aspect-[21/10] max-h-[580px] rounded-[14px] sm:rounded-[20px] md:rounded-[24px] overflow-hidden relative transition-all duration-500 cursor-pointer ${isActive
                      ? "opacity-100 scale-100 ring-1 ring-black/5"
                      : "opacity-80 hover:opacity-95 scale-[0.99]"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${data.name} photo ${(idx % images.length) + 1}`}
                      fill
                      priority={idx === images.length}
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* Previous / Next Controls - Desktop only */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  className="hidden md:flex absolute left-4 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  className="hidden md:flex absolute right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              </>
            )}
          </section>

          {/* ── 2. Main 2-Column Section: All Content on Left, Only Sticky Widget on Right ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
            {/* Left Column: All Page Content (Adjusted to Left) */}
            <div className="lg:col-span-8 space-y-16 md:space-y-20">
              {/* ── A. Property Details & Description ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="font-[Public_Sans] text-[12px] font-bold uppercase tracking-[0.02em] leading-[14px] text-[#222222] mb-1.5 text-left">
                  PROPERTY DETAILS
                </p>
                <h1 className="font-[Public_Sans] text-3xl sm:text-4xl md:text-[42px] font-medium text-[#111827] leading-tight tracking-tight mb-3.5">
                  {data.name}
                </h1>
                <p className="font-[Public_Sans] text-[15px] md:text-[16px] text-[#556375] font-normal leading-[1.6] max-w-[710px] text-left">
                  {data.description ||
                    `${data.name} offers thoughtfully designed spaces with modern amenities, warm hospitality, and a vibrant community experience for students and professionals. vibrant community experience for students and professionals.`}
                </p>

                {/* Premium Amenities */}
                <div className="mt-12">
                  <h2 className="font-sans text-2xl md:text-[28px] font-semibold text-[#111827] mb-10">
                    Premium Amenities
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4">
                    {AMENITY_ICONS.map((item, aIdx) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={aIdx}
                          initial={{ opacity: 0, scale: 0.85 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.45, delay: aIdx * 0.06, ease: EASE }}
                          whileHover={{ y: -4, scale: 1.05, transition: { duration: 0.2 } }}
                          className="flex flex-col items-center text-center cursor-default group"
                        >
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#D2E6BC] flex items-center justify-center text-[#3a5535] shadow-xs group-hover:bg-[#c3dab0] transition-colors">
                            <Icon className="w-6 h-6 md:w-7 md:h-7 stroke-[1.75]" />
                          </div>
                          <span className="font-sans text-[12.5px] md:text-[13px] font-medium text-[#374151] mt-3">
                            {item.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* ── B. Select Room ── */}
              <section>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="font-sans text-2xl md:text-[28px] font-semibold text-[#111827] mb-10"                >
                  Select Room
                </motion.h2>

                <div className="space-y-6">
                  {data.rooms.map((room, rIdx) => {
                    const roomImg =
                      (room.images && room.images.length > 0 && room.images[0]) ||
                      "/assets/ac-double-room.webp";
                    const roomBadge =
                      room.badge ||
                      (rIdx === 0
                        ? "Private room"
                        : rIdx === 1
                          ? "Dormitory"
                          : "Private rooms");
                    const roomAmenities =
                      room.amenities && room.amenities.length > 0
                        ? room.amenities
                        : ["Free Wifi", "Restaurant", "Study Desk", "Double Occupancy"];
                    const destSlug = (data.destinationSlug || data.destinationName || "kanniyakumari").toLowerCase().trim();
                    const roomNameLower = (room.name || "").toLowerCase().trim();
                    const roomSlugLower = (room.slug || "").toLowerCase().trim();

                    // Determine external booking URL
                    let externalBookUrl = "";
                    if (room.bookingLink && (room.bookingLink.startsWith("http://") || room.bookingLink.startsWith("https://"))) {
                      externalBookUrl = room.bookingLink;
                    } else {
                      const staticRooms = (locationRooms as Record<string, any[]>)[destSlug];
                      const matched = staticRooms?.find(
                        (sr) =>
                          (sr.slug && roomSlugLower && sr.slug.toLowerCase() === roomSlugLower) ||
                          (sr.name && roomNameLower && sr.name.toLowerCase() === roomNameLower) ||
                          (sr.name && roomNameLower && (roomNameLower.includes(sr.name.toLowerCase()) || sr.name.toLowerCase().includes(roomNameLower)))
                      );
                      if (matched?.external_url) {
                        externalBookUrl = matched.external_url;
                      } else if (destSlug === "chennai") {
                        externalBookUrl = "https://live.ipms247.com/booking/book-rooms-kattilchennai";
                      } else if (destSlug === "madurai") {
                        externalBookUrl = "https://live.ipms247.com/booking/book-rooms-kattil";
                      } else if (destSlug === "coimbatore") {
                        externalBookUrl = "https://live.ipms247.com/booking/book-rooms-kattilcoimbatore";
                      } else if (destSlug === "colachel") {
                        externalBookUrl = "https://live.ipms247.com/booking/book-rooms-kattilcolachel";
                      } else {
                        externalBookUrl = "https://live.ipms247.com/booking/book-rooms-kattil";
                      }
                    }

                    return (
                      <motion.div
                        key={room._id || rIdx}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: rIdx * 0.09, ease: EASE }}
                        className="bg-white rounded-[8px] overflow-hidden border border-gray-100"
                      >
                        <div className="w-full max-w-[865px] flex flex-col sm:flex-row gap-0 sm:gap-[20px] md:gap-[26px] h-auto sm:h-[290px]">

                          {/* Room Image (Full width on mobile, side-by-side on sm/md/lg) */}
                          <div className="relative w-full sm:w-[320px] md:w-[405px] h-[220px] sm:h-full rounded-t-[8px] sm:rounded-l-[8px] sm:rounded-tr-none overflow-hidden shrink-0">
                            <Image
                              src={roomImg}
                              alt={room.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 405px"
                              className="object-cover"
                            />
                          </div>

                          {/* Room Info (Below image on mobile, right side on sm/md/lg) */}
                          <div className="w-full sm:flex-1 md:w-[434px] flex flex-col justify-between p-5 sm:p-0 sm:pt-6 sm:pb-5 sm:pr-4">
                            <div>

                              {/* Badge / Category */}
                              <p className="font-[Public_Sans] text-[13.5px] sm:text-[14px] font-medium leading-[14px] tracking-[-0.5px] text-[#526442] mb-1.5 sm:mb-2">
                                {roomBadge}
                              </p>

                              {/* Room Title */}
                              <h3 className="font-[Public_Sans] text-[22px] sm:text-[24px] font-medium text-[#111827] leading-[28px] sm:leading-[30px] tracking-[-0.5px]">
                                {room.name}
                              </h3>

                              {/* Room Subtitle */}
                              <p className="font-[Public_Sans] text-[13.5px] sm:text-[14px] font-normal leading-[18px] tracking-[-0.5px] text-[#6b7280] mt-1.5 sm:mt-2 mb-3.5 sm:mb-4">
                                {room.description ||
                                  "Spacious Double occupancy room with extra comfort"}
                              </p>

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {roomAmenities.map((amenity, aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#F5F3EB] text-[11.5px] sm:text-[12px] font-medium text-[#4b5563]"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Book Now */}
                            <div className="mt-5 sm:mt-0 sm:mb-1">
                              <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href={externalBookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full min-h-[44px] py-[12px] px-[32px] rounded-[6px] border border-[#111827] flex items-center justify-center text-[#111827] font-[Public_Sans] font-medium text-[14px] hover:bg-[#0d1b2e] hover:text-white transition-all text-center"
                              >
                                Book Now
                              </motion.a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* ── C. Gallery ── */}
              {propertyGalleryImages.length > 0 && (
                <section>
                  <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="font-sans text-2xl md:text-3xl font-semibold text-[#111827] mb-10"
                  >
                    Gallery
                  </motion.h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full">
                    {propertyGalleryImages.slice(0, 4).map((imgUrl, idx, arr) => {
                      const isLastOrFourth =
                        idx === 3 || (idx === arr.length - 1 && propertyGalleryImages.length <= 4 && arr.length >= 3);
                      const galleryCity = data.destinationSlug || data.destinationName?.toLowerCase() || "";
                      const galleryHref = galleryCity
                        ? `/gallery?city=${encodeURIComponent(galleryCity)}`
                        : "/gallery";

                      if (isLastOrFourth && (propertyGalleryImages.length >= 4 || arr.length === 4)) {
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: 0.05 * (idx + 1), ease: EASE }}
                          >
                            <Link
                              href={galleryHref}
                              className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] aspect-[416/300] rounded-[8px] overflow-hidden bg-gray-900 shadow-xs block cursor-pointer"
                            >
                              <Image
                                src={imgUrl}
                                alt={`${data.name} photo ${idx + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover opacity-60"
                              />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="font-sans text-[15px] md:text-[16px] font-medium text-white flex items-center gap-2">
                                  View all <ArrowRight className="w-4 h-4" />
                                </span>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.5, delay: 0.05 * (idx + 1), ease: EASE }}
                        >
                          <Link
                            href={galleryHref}
                            className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] aspect-[416/300] rounded-[8px] overflow-hidden bg-gray-100 shadow-xs block cursor-pointer"
                          >
                            <Image
                              src={imgUrl}
                              alt={`${data.name} photo ${idx + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                            />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── D. Location & How to reach ── */}
              <section>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="font-sans text-2xl md:text-3xl font-semibold text-[#111827] mb-10"
                >
                  Location
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="bg-[#F0EAD2] rounded-[8px] overflow-hidden border border-[#e3dcbf] shadow-xs"
                >
                  {/* Top address bar */}
                  <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3dcbf]">
                    <p className="font-sans text-[15px] md:text-[16px] text-[#374151]">
                      {data.address || "Karzu Road, Near circuit house, Karzu-194101"}
                    </p>
                    {data.mapLink ? (
                      <a
                        href={data.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 rounded-[8px] border border-[#374151] text-[#1f2937] text-xs font-semibold hover:bg-black/5 transition-colors self-start sm:self-auto text-center"
                      >
                        View on map
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${encodeURIComponent(data.address || data.name)}`,
                            "_blank"
                          )
                        }
                        className="px-5 py-2 rounded-[8px] border border-[#374151] text-[#1f2937] text-xs font-semibold hover:bg-black/5 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        View on map
                      </button>
                    )}
                  </div>

                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => setHowToReachOpen((prev) => !prev)}
                    className="w-full px-6 md:px-8 py-4.5 flex items-center justify-between bg-[#F0EAD2] hover:bg-[#e8e2ca] transition-colors duration-200 text-left cursor-pointer select-none"
                    aria-expanded={howToReachOpen}
                  >
                    <span className="font-sans text-[17px] md:text-[18px] font-semibold text-[#1f2937]">
                      How to reach
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#374151] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${howToReachOpen ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  </button>

                  {/* Accordion body - Hardware accelerated CSS Grid transition for 60fps smoothness */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden bg-white ${howToReachOpen
                      ? "grid-rows-[1fr] opacity-100 border-t border-[#e3dcbf]"
                      : "grid-rows-[0fr] opacity-0 border-t-0"
                      }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="p-6 md:p-8 space-y-4 text-xs md:text-sm text-[#4b5563] leading-relaxed">
                        <h4 className="font-bold text-gray-900 text-sm md:text-[15px] mb-2">
                          Travel Directions
                        </h4>

                        <div>
                          <p className="font-bold text-gray-800">
                            From {data.destinationName} Railway Station:
                          </p>
                          <p>
                            {data.directions?.railway ||
                              `${data.name} is located close to ${data.destinationName} Railway Station and is easily accessible by auto, taxi, or local transport.`}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">
                            From {data.destinationName} Bus Stand:
                          </p>
                          <p>
                            {data.directions?.busStand ||
                              `The property is just a short drive from ${data.destinationName} Bus Stand. Guests can take a local auto or taxi to reach ${data.name}.`}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">
                            From {data.destinationName} Landmark / Center:
                          </p>
                          <p>
                            {data.directions?.landmark ||
                              `${data.name} is located near key local attractions. Follow the main access road towards the property.`}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">By Car:</p>
                          <p>
                            {data.directions?.byCar ||
                              `Drive towards ${data.destinationName} and continue along the main road. Follow the directions to ${data.name} using Google Maps. Parking is available at the property, subject to availability.`}
                          </p>
                        </div>

                        <div className="pt-2">
                          <p className="font-bold text-gray-800">Important:</p>
                          <p>
                            {data.directions?.important ||
                              `As the property is located in a popular area, traffic and parking availability may vary during weekends, holidays, and peak tourist seasons. We recommend using Google Maps for the most convenient route.`}
                          </p>
                        </div>

                        <div className="pt-1">
                          <p className="font-bold text-gray-800">Need Help Finding Us?</p>
                          <p>
                            {data.directions?.helpText ||
                              `If you need assistance with directions or transportation, please contact our property team. We'll be happy to guide you to ${data.name}.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* ── E. Contact ── */}
              <section>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="font-sans text-2xl md:text-3xl font-semibold text-[#111827] mb-10"
                >
                  Contact
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="bg-[#F0EAD2] rounded-[8px] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#e3dcbf]"
                >
                  {/* Phone & Email */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                    {/* Phone */}
                    <a
                      href={`tel:${data.phone || "+917448749779"}`}
                      className="flex items-center gap-3 text-sm md:text-[15px] font-medium text-gray-900 hover:text-[#526442] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-xs">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span>
                        <strong>Phone :</strong> {data.phone || "+91 74487 49779"}
                      </span>
                    </a>

                    {/* Email */}
                    <a
                      href={`mailto:${data.email || "hostelsparrow@gmail.com"}`}
                      className="flex items-center gap-3 text-sm md:text-[15px] font-medium text-gray-900 hover:text-[#526442] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span>
                        <strong>Email :</strong> {data.email || "hostelsparrow@gmail.com"}
                      </span>
                    </a>
                  </div>

                  {/* Whatsapp Button */}
                  <div>
                    <a
                      href={`https://wa.me/${(data.whatsapp || data.phone || "917448749779").replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[8px] border border-[#374151] bg-white/40 hover:bg-white text-gray-900 text-sm font-semibold transition-colors shadow-xs"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="#25D366"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M20.52 3.449A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.16 11.89c0 2.096.548 4.142 1.588 5.944L.05 24l6.305-1.654a11.9 11.9 0 005.695 1.45h.005c6.554 0 11.89-5.335 11.89-11.89a11.84 11.84 0 00-3.425-8.457zm-8.47 18.347h-.004a9.88 9.88 0 01-5.03-1.378l-.36-.214-3.743.982.999-3.65-.235-.374a9.85 9.85 0 01-1.511-5.272c0-5.45 4.436-9.886 9.89-9.886a9.83 9.83 0 017.006 2.904 9.83 9.83 0 012.899 7.01c-.005 5.45-4.441 9.878-9.911 9.878z" />
                      </svg>
                      <span>Whatsapp</span>
                    </a>
                  </div>
                </motion.div>
              </section>
            </div>

            {/* Right Column: Sticky Booking Widget (Connected to IPMS247 Booking Engine) */}
            <div className="lg:col-span-4 lg:sticky lg:top-40 z-30">
              <RoomStickyBookingWidget
                initialDestinationName={data.destinationName}
                initialPropertyName={data.name}
                initialDestinationSlug={data.destinationSlug}
                lockedDestination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


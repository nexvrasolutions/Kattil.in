"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

export interface DestinationItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  hotelCount?: string;
  link?: string;
  order?: number;
}

export const FALLBACK_DESTINATIONS: DestinationItem[] = [
  {
    _id: "default-chennai",
    name: "Chennai",
    slug: "chennai",
    image: "/images/destinations/kanyakumari.png",
    hotelCount: "2 hotels",
    link: "/chennai",
    order: 1,
  },
  {
    _id: "default-kanniyakumari",
    name: "Kanniyakumari",
    slug: "kanniyakumari",
    image: "/images/destinations/kanyakumari.png",
    hotelCount: "1 hotels",
    link: "/rooms",
    order: 2,
  },
  {
    _id: "default-coimbatore",
    name: "Coimbatore",
    slug: "coimbatore",
    image: "/images/destinations/coimbatore.png",
    hotelCount: "2 hotels",
    link: "/coimbatore",
    order: 3,
  },
  {
    _id: "default-madurai",
    name: "Madurai",
    slug: "madurai",
    image: "/images/destinations/madurai.png",
    hotelCount: "2 hotels",
    link: "/madurai",
    order: 4,
  },
];

interface DestinationsDropdownProps {
  isOpen: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onItemClick?: () => void;
  topOffset?: number;
}

export default function DestinationsDropdown({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
  topOffset = 76,
}: DestinationsDropdownProps) {
  const [destinations, setDestinations] = useState<DestinationItem[]>(FALLBACK_DESTINATIONS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDestinations(data.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch destinations, using fallback:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-destinations-menu="true"
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{ top: `${topOffset}px` }}
          className="absolute left-0 right-0 z-80 mx-auto w-full max-w-[1280px] px-3 md:px-5 pointer-events-auto"
        >
          {/* Bridge padding zone */}
          <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />

          {/* White Mega Menu Card */}
          <div
            className="w-full rounded-[8px] bg-white border border-slate-100 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
            style={{
              backgroundColor: "#ffffff",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
              {destinations.map((dest) => {
                const targetLink =
                  dest.link?.trim() ||
                  (dest.slug === "chennai"
                    ? "/chennai"
                    : dest.slug === "coimbatore"
                    ? "/coimbatore"
                    : dest.slug === "madurai"
                    ? "/madurai"
                    : `/destinations/${dest.slug}`);
                const imgSrc = dest.image?.trim() || "/images/destinations/kanyakumari.png";

                return (
                  <Link
                    key={dest._id || dest.slug}
                    href={targetLink}
                    onClick={onItemClick}
                    className="group flex items-center gap-4 p-2.5 -m-2.5 rounded-[8px] transition-all duration-200 hover:bg-slate-50/80 active:scale-[0.99]"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-[8px] overflow-hidden bg-slate-100 shrink-0 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={dest.name}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500">
                          <MapPin className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans text-[15px] md:text-[16px] font-semibold text-[#0d1b2e] leading-snug tracking-tight group-hover:text-[#526442] transition-colors truncate">
                        {dest.name}
                      </h4>
                      <p className="text-[13px] text-[#707070] font-sans mt-0.5 font-normal tracking-normal truncate">
                        {dest.hotelCount || "1 hotels"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Component for rendering Destination items in Mobile Menu */
export function MobileDestinationsList({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const [destinations, setDestinations] = useState<DestinationItem[]>(FALLBACK_DESTINATIONS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDestinations(data.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pl-2">
      {destinations.map((dest) => {
        const targetLink =
          dest.link?.trim() ||
          (dest.slug === "chennai"
            ? "/chennai"
            : dest.slug === "coimbatore"
            ? "/coimbatore"
            : dest.slug === "madurai"
            ? "/madurai"
            : `/destinations/${dest.slug}`);
        const imgSrc = dest.image?.trim() || "/images/destinations/kanyakumari.png";

        return (
          <Link
            key={dest._id || dest.slug}
            href={targetLink}
            onClick={onItemClick}
            className="flex items-center gap-3 p-2 rounded-[8px] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="relative w-11 h-11 rounded-[8px] overflow-hidden bg-white/10 shrink-0">
              <Image
                src={imgSrc}
                alt={dest.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[14.5px] font-semibold text-white leading-tight truncate">
                {dest.name}
              </p>
              <p className="text-[11.5px] text-white/60 font-sans mt-0.5 truncate">
                {dest.hotelCount || "1 hotels"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

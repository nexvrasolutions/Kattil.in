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
    hotelCount: "1 hotels",
    link: "/chennai",
    order: 1,
  },
  {
    _id: "default-madurai",
    name: "Madurai",
    slug: "madurai",
    image: "/images/destinations/madurai.png",
    hotelCount: "1 hotels",
    link: "/madurai",
    order: 2,
  },
];

interface DestinationsDropdownProps {
  isOpen: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onItemClick?: () => void;
  topOffset?: number;
}

let cachedDestinations: DestinationItem[] | null = null;
let destinationsFetchPromise: Promise<DestinationItem[]> | null = null;

async function getCachedDestinations(): Promise<DestinationItem[]> {
  if (cachedDestinations) return cachedDestinations;
  if (!destinationsFetchPromise) {
    destinationsFetchPromise = fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          cachedDestinations = data.data;
          return data.data;
        }
        return FALLBACK_DESTINATIONS;
      })
      .catch(() => FALLBACK_DESTINATIONS);
  }
  return destinationsFetchPromise;
}

export default function DestinationsDropdown({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
  topOffset = 76,
}: DestinationsDropdownProps) {
  const [destinations, setDestinations] = useState<DestinationItem[]>(
    cachedDestinations || FALLBACK_DESTINATIONS
  );

  useEffect(() => {
    let isMounted = true;
    getCachedDestinations().then((data) => {
      if (isMounted && data && data.length > 0) {
        setDestinations(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayedDestinations = destinations.length > 8 ? destinations.slice(0, 8) : destinations;
  const hasMoreThan8 = destinations.length > 8;

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
          className="absolute left-0 right-0 z-80 mx-auto w-full max-w-[1280px] px-3 md:px-5 pointer-events-auto flex justify-center"
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
              {displayedDestinations.map((dest) => {
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
                    prefetch={true}
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

            {hasMoreThan8 && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[13px] text-[#707070] font-sans">
                  Showing 8 of {destinations.length} destinations
                </p>
                <Link
                  href="/destinations"
                  prefetch={true}
                  onClick={onItemClick}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#526442] hover:bg-[#3d4b31] text-white text-[13.5px] font-medium font-sans transition-all duration-200 shadow-xs hover:shadow group"
                >
                  <span>View all destinations</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            )}
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
  const [destinations, setDestinations] = useState<DestinationItem[]>(
    cachedDestinations || FALLBACK_DESTINATIONS
  );

  useEffect(() => {
    let isMounted = true;
    getCachedDestinations().then((data) => {
      if (isMounted && data && data.length > 0) {
        setDestinations(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayedDestinations = destinations.length > 8 ? destinations.slice(0, 8) : destinations;
  const hasMore = destinations.length > 8;

  return (
    <div className="mt-3.5 bg-white rounded-[8px] p-3 sm:p-4 shadow-xl border border-gray-100/90 overflow-hidden text-left">
      <div className="divide-y divide-gray-100">
        {displayedDestinations.map((dest) => {
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
              prefetch={true}
              onClick={onItemClick}
              className="flex items-center gap-3.5 py-3 px-1.5 rounded-[8px] hover:bg-slate-50 transition-colors group"
            >
              <div className="relative w-13 h-13 rounded-[8px] overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-xs">
                <Image
                  src={imgSrc}
                  alt={dest.name}
                  fill
                  sizes="52px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[15.5px] font-semibold text-gray-900 leading-tight truncate group-hover:text-[#0d1b2e]">
                  {dest.name}
                </p>
                <p className="text-[12.5px] text-gray-500 font-sans mt-1 truncate font-normal">
                  {dest.hotelCount || "1 hotels"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="pt-2.5 border-t border-gray-100 mt-1">
          <Link
            href="/destinations"
            prefetch={true}
            onClick={onItemClick}
            className="flex items-center justify-center gap-2 py-2 text-[#0d1b2e] hover:text-[#526442] font-semibold text-[13.5px] font-sans transition-colors"
          >
            <span>View all destinations ({destinations.length})</span>
            <span className="text-[14px]">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

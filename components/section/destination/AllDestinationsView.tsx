"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { FALLBACK_DESTINATIONS } from "@/components/layout/destinations-dropdown";

export interface DestinationItemData {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  hotelCount?: string;
  link?: string;
  order?: number;
}

interface AllDestinationsViewProps {
  destinations?: DestinationItemData[];
}

export default function AllDestinationsView({
  destinations: initialDestinations,
}: AllDestinationsViewProps) {
  const [destinations, setDestinations] = useState<DestinationItemData[]>(
    initialDestinations && initialDestinations.length > 0
      ? initialDestinations
      : FALLBACK_DESTINATIONS
  );

  useEffect(() => {
    let isMounted = true;
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        if (
          isMounted &&
          data.success &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setDestinations(data.data);
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Section (Sage Green) ───────────────────────────────── */}
      <section className="relative w-full bg-[#9caf88] overflow-hidden pt-36 md:pt-44 lg:pt-52 pb-16 md:pb-24">
        {/* Right Background Monument Skyline Silhouette */}
        <div className="absolute right-0 bottom-0 top-auto h-[65%] sm:h-[72%] md:h-[78%] lg:h-[82%] w-[70%] sm:w-[48%] md:w-[40%] lg:w-[34%] max-w-[460px] pointer-events-none z-0 overflow-hidden flex items-end justify-end pr-2 md:pr-6">
          <div
            className="w-full h-full opacity-90 md:opacity-95 bg-no-repeat"
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
            <p className="font-sans text-[14px] sm:text-[15px] uppercase text-[#FFFFFF] mb-4 drop-shadow-sm">
              FIND YOUR PERFECT STAY
            </p>

            <h1 className="text-white tracking-tight">
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-bold leading-[1.12]">
                Destinations to
              </span>
              <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1">
                Discover
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── 2. Destinations Grid ───────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF8F5]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            <div
              className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-6
          md:gap-7
          justify-items-center
        "
            >
              {destinations.map((dest, index) => {
                const targetLink =
                  dest.link?.trim() ||
                  (dest.slug === "chennai"
                    ? "/chennai"
                    : dest.slug === "coimbatore"
                      ? "/coimbatore"
                      : dest.slug === "madurai"
                        ? "/madurai"
                        : `/destinations/${dest.slug}`);

                const imgSrc =
                  dest.image?.trim() ||
                  (dest.slug === "coimbatore"
                    ? "/images/destinations/coimbatore.png"
                    : dest.slug === "madurai"
                      ? "/images/destinations/madurai.png"
                      : "/images/destinations/kanyakumari.png");

                return (
                  <Link
                    key={dest._id || dest.slug || index}
                    href={targetLink}
                    className="
                      group
                      relative
                      block
                      w-full
                      max-w-[303px]
                      h-[331px]
                      rounded-[8px]
                      overflow-hidden
                      bg-white
                      transition-all
                      duration-300
                    "
                  >
                    {/* Top Pill Tag */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-center z-10">
                      <div
                        className="
                          w-full
                          h-[34px] sm:h-[36px]
                          flex items-center justify-center
                          bg-[#FFFCF2]
                          backdrop-blur-[4px]
                          rounded-[70px]
                          px-3 sm:px-4
                          text-[13px] sm:text-[14px]
                          font-medium
                          text-[#52613F]
                          tracking-tight
                          shadow-xs
                          transition-colors
                        "
                      >
                        {dest.name}
                      </div>
                    </div>

                    {/* Destination Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={imgSrc}
                        alt={dest.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 303px"
                        className="
                          object-cover
                          object-center
                          transition-transform
                          duration-500
                          ease-out
                          group-hover:scale-105
                        "
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

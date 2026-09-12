"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { FALLBACK_DESTINATIONS } from "@/components/layout/destinations-dropdown";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
    if (initialDestinations && initialDestinations.length > 0) return;
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
  }, [initialDestinations]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Section (Sage Green) ───────────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-8 sm:pb-9 md:pb-10 lg:pb-12">
        {/* Right Background Monument Skyline Silhouette */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.95, x: 0 }}
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
              className="font-sans text-[14px] sm:text-[15px] uppercase text-[#FFFFFF] mb-4 drop-shadow-sm"
            >
              FIND YOUR PERFECT STAY
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] leading-[1.12]">
                Destinations to
              </span>
              <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1">
                Discover
              </span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── 2. Destinations Grid ───────────────────────────────────────── */}
      <section className="relative z-20 w-full py-16 md:py-24 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            <div
              className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-7
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
                        : dest.slug === "colachel"
                          ? "/colachel"
                          : `/destinations/${dest.slug}`);

                const imgSrc =
                  dest.image?.trim() ||
                  (dest.slug === "coimbatore"
                    ? "/images/destinations/coimbatore.png"
                    : dest.slug === "madurai"
                      ? "/images/destinations/madurai.png"
                      : "/images/destinations/kanyakumari.png");

                return (
                  <motion.div
                    key={dest._id || dest.slug || index}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    className="w-full max-w-[303px]"
                  >
                    <Link
                      href={targetLink}
                      className="
                        group
                        relative
                        block
                        w-full
                        h-[331px]
                        rounded-[8px]
                        overflow-hidden
                        bg-white
                        shadow-xs
                        hover:shadow-lg
                        transition-all
                        duration-500
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
                            group-hover:bg-white
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
                            duration-700
                            ease-out
                            group-hover:scale-105
                          "
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { safeFetchJson } from "@/lib/utils/safeFetch";

export interface DestinationItem {
  id: string;
  name: string;
  pillLabel: string;
  image: string;
  href: string;
  isViewAll?: boolean;
}

export const DEFAULT_DESTINATIONS: DestinationItem[] = [
  {
    id: "chennai",
    name: "Chennai",
    pillLabel: "Chennai",
    image: "/images/destinations/chennai.png",
    href: "/chennai",
  },
  {
    id: "kaniyakumari",
    name: "Kaniyakumari",
    pillLabel: "Kaniyakumari",
    image: "/images/destinations/kanyakumari.png",
    href: "/kaniyakumari",
  },
  {
    id: "view-all",
    name: "View all our Destination",
    pillLabel: "",
    image: "/images/destinations/destination-card-bg.png",
    href: "/destinations",
    isViewAll: true,
  },
];

export default function DestinationsSection({
  initialDestinations,
}: {
  initialDestinations?: DestinationItem[];
}) {
  const [destinations, setDestinations] = useState<DestinationItem[]>(
    initialDestinations && initialDestinations.length > 0
      ? initialDestinations
      : DEFAULT_DESTINATIONS
  );

  useEffect(() => {
    let isMounted = true;

    safeFetchJson<{ success: boolean; data: any[] }>("/api/destinations")
      .then((res) => {
        if (!isMounted || !res?.success || !Array.isArray(res.data) || res.data.length === 0) return;

        const priorityOrder: Record<string, number> = {
          chennai: 1,
          kaniyakumari: 2,
          kanniyakumari: 2,
          kanyakumari: 2,
          coimbatore: 3,
          madurai: 4,
          colachel: 5,
        };

        const activeList: DestinationItem[] = res.data
          .map((d: any) => {
            const isKanya =
              d.slug === "kaniyakumari" ||
              d.slug === "kanyakumari" ||
              d.slug === "kanniyakumari" ||
              (d.name && /kany|kaniy/i.test(d.name));

            const displayName =
              d.name ||
              (d.slug === "chennai"
                ? "Chennai"
                : d.slug === "madurai"
                  ? "Madurai"
                  : d.slug === "coimbatore"
                    ? "Coimbatore"
                    : isKanya
                      ? "Kaniyakumari"
                      : d.slug === "colachel"
                        ? "Colachel"
                        : d.slug);

            const imgSrc =
              d.slug === "chennai"
                ? "/images/destinations/chennai.png"
                : d.slug === "madurai"
                  ? "/images/destinations/madurai.png"
                  : d.slug === "coimbatore"
                    ? "/images/destinations/coimbatore.png"
                    : isKanya
                      ? "/images/destinations/kanyakumari.png"
                      : d.slug === "colachel"
                        ? "/images/destinations/kanyakumari.png"
                        : d.image || "/images/destinations/chennai.png";

            const href = isKanya
              ? "/kaniyakumari"
              : d.link ||
                (d.slug === "chennai"
                  ? "/chennai"
                  : d.slug === "coimbatore"
                    ? "/coimbatore"
                    : d.slug === "madurai"
                      ? "/madurai"
                      : d.slug === "colachel"
                        ? "/colachel"
                        : `/destinations/${d.slug}`);

            return {
              id: d._id || d.slug,
              name: displayName,
              pillLabel: displayName,
              image: imgSrc,
              href,
              slug: d.slug,
            };
          })
          .sort((a: any, b: any) => {
            const pA = priorityOrder[a.slug] ?? 99;
            const pB = priorityOrder[b.slug] ?? 99;
            return pA - pB;
          });

        const baseItems =
          activeList.length > 0
            ? activeList.slice(0, 3)
            : DEFAULT_DESTINATIONS.filter((d) => !d.isViewAll);

        const previewItems = [...baseItems];
        previewItems.push({
          id: "view-all",
          name: "View all our Destination",
          pillLabel: "",
          image: "/images/destinations/destination-card-bg.png",
          href: "/destinations",
          isViewAll: true,
        });

        setDestinations(previewItems);
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="destinations"
      className="bg-transparent pt-16 sm:pt-20 md:pt-24 pb-12 md:pb-20 lg:pb-24 scroll-mt-[120px] 2xl:scroll-mt-[140px] px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-[1160px] mx-auto">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-[#0d1b2e] text-[28px] sm:text-[32px] md:text-[36px] font-sans font-normal leading-[1.18] tracking-tight">
            Destinations to{" "}
            <span className="font-serif italic font-normal text-[#0d1b2e]">
              Discover
            </span>
          </h2>
        </motion.div>

        {/* Dynamic Destination Cards - centered for any number of cards (1, 2, 3, or 4) */}
        <div className="flex flex-wrap justify-center items-center gap-5 lg:gap-6 max-w-[1140px] mx-auto">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px 200px 0px" }}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-[260px] h-[331px] shrink-0"
            >
              {dest.isViewAll ? (
                /* 4th Card: View all our Destination */
                <Link
                  href={dest.href}
                  prefetch={true}
                  className="group relative flex flex-col w-[260px] h-[331px] rounded-[8px] overflow-hidden bg-[#A7BD91] text-white transition-all duration-300 shadow-xs hover:shadow-md block"
                  style={{
                    width: 260,
                    height: 331,
                    borderRadius: 8,
                    opacity: 1,
                  }}
                >
                  {/* Full Artwork Background */}
                  <div className="relative w-full h-full">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      sizes="260px"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out rounded-[8px]"
                    />
                  </div>

                  {/* Bottom CTA */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-2">
                    <p className="text-white text-[20px] sm:text-[22px] font-normal leading-[1.18] tracking-tight font-sans">
                      View all our <br />Destination
                    </p>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-white text-[#8FAE80] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                      <ArrowRight className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>
                </Link>
              ) : (
                /* Standard Destination Card */
                <Link
                  href={dest.href}
                  prefetch={true}
                  className="group relative block w-[260px] h-[331px] rounded-[8px] overflow-hidden bg-white transition-all duration-300 shadow-xs hover:shadow-md"
                  style={{
                    width: 260,
                    height: 331,
                    borderRadius: 8,
                    opacity: 1,
                  }}
                >
                  {/* Top Pill Tag */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-center z-10 pointer-events-none">
                    <div
                      className="
                        w-full
                        max-w-[190px]
                        h-[34px]
                        flex items-center justify-center
                        bg-[#FFFDF6]
                        rounded-[70px]
                        px-3
                        text-[13px]
                        font-medium
                        text-[#52613F]
                        tracking-tight
                        shadow-xs
                        transition-colors
                        overflow-hidden
                        select-none
                        no-underline
                      "
                    >
                      {dest.pillLabel}
                    </div>
                  </div>

                  {/* Destination Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      sizes="260px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out rounded-[8px]"
                    />
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
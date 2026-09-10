"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface DestinationItem {
  id: string;
  name: string;
  pillLabel: string;
  image: string;
  href: string;
  isViewAll?: boolean;
}

const DESTINATIONS: DestinationItem[] = [
  {
    id: "kanyakumari",
    name: "Kanyakumari",
    pillLabel: "Kanyakumari",
    image: "/images/destinations/kanyakumari.png",
    href: "/destinations/kanniyakumari",
  },
  {
    id: "madurai",
    name: "Madurai",
    pillLabel: "Madurai",
    image: "/images/destinations/madurai.png",
    href: "/madurai",
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    pillLabel: "Coimbatore",
    image: "/images/destinations/coimbatore.png",
    href: "/coimbatore",
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

export default function DestinationsSection() {
  return (
    <section
      id="destinations"
      className="bg-transparent pt-20 sm:pt-24 md:pt-28 pb-10 md:pb-20 lg:pb-24 scroll-mt-[120px] 2xl:scroll-mt-[140px] px-3 md:px-5"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6 sm:mb-10"
        >
          <h2 className="text-[#0d1b2e] text-[26px] sm:text-[36px] md:text-[44px] font-sans font-normal tracking-tight">
            Destinations to{" "}
            <span className="font-serif italic font-normal text-[#0d1b2e]">
              Discover
            </span>
          </h2>
        </motion.div>

        {/* 4 Static Destination Cards (Clean grid, No slideshow, No shadow, No stroke) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-stretch">
          {DESTINATIONS.map((dest, index) => (
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
              className="w-full"
            >
              {dest.isViewAll ? (
                /* 4th Card: View all our Destination (Matches Desktop on Mobile) */
                <Link
                  href={dest.href}
                  className="group relative flex flex-col aspect-[3/3.9] sm:aspect-[3/4.2] rounded-[8px] overflow-hidden bg-[#C5D9B0] text-white transition-all duration-300 block"
                >
                  {/* Full Artwork Background */}
                  <div className="relative w-full h-full">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 640px) 320px, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Bottom CTA */}
                  <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 z-10 flex items-end justify-between gap-3">
                    <p className="text-white text-[18px] sm:text-[20px] font-normal leading-[1.15] tracking-tight">
                      View all our <br />Destination
                    </p>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-white text-[#8FAE80] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <ArrowRight className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>
                </Link>
              ) : (
                /* Standard Destination Card (No shadow, no stroke) */
                <Link
                  href={dest.href}
                  className="group relative block aspect-[3/3.9] sm:aspect-[3/4.2] rounded-[8px] overflow-hidden bg-white transition-all duration-300"
                >
                  {/* Top Pill Tag */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-center z-10">
                    <div
                      className="
                        w-full
                        h-[32px] sm:h-[35px]
                        flex items-center justify-center
                        bg-[#FFFCF2]
                        backdrop-blur-[4px]
                        rounded-[70px]
                        px-3 sm:px-4
                        text-[12.5px] sm:text-[13px]
                        font-medium
                        text-[#52613F]
                        tracking-tight
                        translate-y-1 sm:translate-y-2.5
                        transition-colors
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
                      sizes="(max-width: 640px) 320px, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
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
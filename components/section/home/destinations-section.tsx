"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface DestinationItem {
  name: string;
  pillLabel: string;
  image: string;
  href: string;
}

const DESTINATIONS: DestinationItem[] = [
  {
    name: "Kanyakumari",
    pillLabel: "Kanyakumari",
    image: "/images/destinations/kanyakumari.png",
    href: "/rooms",
  },
  {
    name: "Madurai",
    pillLabel: "Madurai",
    image: "/images/destinations/madurai.png",
    href: "/rooms",
  },
  {
    name: "Coimbatore",
    pillLabel: "Coimbatore",
    image: "/images/destinations/coimbatore.png",
    href: "/coimbatore",
  },
];

export default function DestinationsSection() {
  return (
    <section
      id="destinations"
      className="bg-transparent pt-20 sm:pt-24 md:pt-28 pb-10 md:pb-20 lg:pb-24 scroll-mt-[120px] 2xl:scroll-mt-[140px]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        {/*
          NOTE: Changed from `whileInView` to `animate` (mount-triggered).
          The previous `whileInView` + `once: true` setup could permanently
          fail to fire: while HeroNavbar's hero-collapse animation is still
          resizing the page layout (spacer height animating from 100svh
          down to navbarH+32px), the IntersectionObserver behind
          `whileInView` can sample this heading's position mid-reflow and
          decide it hasn't crossed the visibility threshold yet. Because
          `once: true` marks the trigger as "used" after that first (missed)
          check, the heading would then stay at opacity: 0 forever on scroll.
          Since this heading sits near the top of the page anyway, there's
          no real benefit to scroll-triggering it — animating on mount
          removes the dependency on scroll position/timing entirely.
        */}
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

        {/* 4 Cards Grid - One by one centered on mobile with compact max-w, 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center">
          {DESTINATIONS.map((dest, index) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px 200px 0px" }}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-none"
            >
              <Link
                href={dest.href}
                className="group relative block aspect-[3/3.8] sm:aspect-[3/4.2] rounded-[8px] overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                {/* Top Pill Tag */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-center z-10">
                  <div
                    className="
                      w-full
                      h-[30px] sm:h-[35px]
                      flex items-center justify-center
                      bg-[#FFFCF2]
                      backdrop-blur-[4px]
                      rounded-[70px]
                      px-3 sm:px-4
                      text-[12px] sm:text-[13px]
                      font-medium
                      text-[#52613F]
                      tracking-tight
                      shadow-none
                      translate-y-1.5 sm:translate-y-3
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
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* 4th Card: View all our Destination */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "0px 0px 200px 0px" }}
            transition={{
              delay: 0.25,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-none"
          >
            <Link
              href="/rooms"
              className="group relative flex flex-col aspect-[3/3.8] sm:aspect-[3/4.2] rounded-[8px] overflow-hidden bg-[#C5D9B0] text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300"
            >
              {/* Full Artwork Background */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/destinations/destination-card-bg.png"
                  alt="View all our destinations"
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Bottom CTA */}
              <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 z-10 flex items-center sm:items-end justify-between gap-2 sm:gap-3">
                <p className="text-white text-[13.5px] sm:text-[18px] md:text-[20px] font-normal leading-tight sm:leading-[1.15] tracking-tight drop-shadow-sm whitespace-nowrap sm:whitespace-normal underline sm:no-underline underline-offset-4 decoration-white">
                  View all our <br className="hidden sm:inline" />Destination
                </p>

                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[6px] sm:rounded-[8px] bg-white text-[#8FAE80] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
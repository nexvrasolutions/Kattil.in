"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { usePageView } from "@/hooks/usePageView";
import type { AboutData } from "./page";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const VALUES_DATA = [
  {
    title: "Comfort",
    description:
      "Thoughtfully designed spaces that make settling in feel effortless.",
  },
  {
    title: "Community",
    description:
      "Shared spaces and experiences that make it easy to meet, connect, and belong.",
  },
  {
    title: "Convenience",
    description:
      "Prime locations, Wi-Fi, secure lockers, and everything you need for a seamless stay.",
  },
  {
    title: "Experience",
    description:
      "A balance of productivity, relaxation, local discovery, and meaningful connections.",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Prince",
    role: "CEO & Founder",
    image: "/images/team/team-1.png",
  },
  {
    name: "Prince",
    role: "CEO & Founder",
    image: "/images/team/team-2.png",
  },
  {
    name: "Prince",
    role: "CEO & Founder",
    image: "/images/team/team-3.png",
  },
];

function LockerIcon({ className = "w-5 h-5 stroke-[1.6]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <circle cx="8.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function AboutContent({ about }: { about: AboutData | null }) {
  usePageView();

  const heroImage = about?.images?.[0] || "/assets/about-us-1.webp";

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      <Navbar />

      {/* ================= 1. HERO SECTION (SAGE GREEN) ================= */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-8 sm:pb-9 md:pb-10 lg:pb-12">
        {/* Hero Content - Aligned exactly with Navbar 'Home' and 'Book Now' */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 flex items-end justify-between">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-xl text-left relative z-10"
            >
              <p className="font-sans text-[14px] sm:text-[15px] md:text-[14px] uppercase text-white/85 mb-[28px]">
                WHO WE ARE
              </p>

              <h1 className="text-white text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-[1.08] tracking-tight">
                <span className="font-sans">The Story </span>
                <span className="font-serif italic font-normal">Behind</span>
                <span className="block font-serif italic font-normal mt-1 sm:mt-1.5">
                  Kattil
                </span>
              </h1>
            </motion.div>

            {/* Background Monument Skyline Silhouette - Aligned straight down to Book Now */}
            <div
              className="
                hidden lg:block
                absolute right-5 md:right-8 lg:right-15 bottom-0
                w-[320px] sm:w-[380px] md:w-[440px] lg:w-[480px] xl:w-[520px] 2xl:w-[560px]
                h-[150px] sm:h-[180px] md:h-[210px] lg:h-[230px] xl:h-[250px]
                pointer-events-none select-none
                overflow-hidden z-0
              "
            >
              <div
                className="w-full h-full opacity-60 mix-blend-multiply"
                style={{
                  backgroundImage: "url('/images/destinations/hero-monument-illustration.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "right bottom",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. STORY SECTION (WARM CREAM) ================= */}
      <section className="relative z-20 rounded-t-[20px] bg-[#FAF8F2] overflow-hidden -mt-2">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-14 sm:pb-18 md:pb-24">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Top Story: Text on Left, Photo on Right aligned with Book Now */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-12 xl:gap-16 items-center mt-8">              {/* Left Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center text-left"
              >
                <p className="font-sans text-[11px] sm:text-[12px] font-bold tracking-[0.10em] uppercase text-[#0d1b2e] mb-4">
                  THE HOMELY RESET
                </p>

                <h2 className="font-[Public_Sans] text-[#0d1b2e] text-[36px] font-normal leading-[42px] tracking-[-1px] mb-10">
                  More than a stay.
                  <span className="block mt-1">
                    A place{" "}
                    <span className="font-serif italic font-normal text-[#0d1b2e]">
                      to Belong
                    </span>
                  </span>
                </h2>

                <div className="space-y-4 sm:space-y-5 text-[#0d1b2e]/75 font-sans text-[14.5px] sm:text-[15.5px] md:text-[16px] leading-[1.68] max-w-xl">
                  <p>
                    Kattil is a premium heritage inspired hostel and co-living
                    space created for travellers, digital nomads, and modern
                    explorers looking for more than just a room.
                  </p>
                  <p>
                    We bring together thoughtful spaces, everyday comfort, and a
                    sense of community creating an environment where you can
                    work, rest, explore, and connect with ease.
                  </p>
                  <p >
                    Our goal is simple, make every stay comfortable, meaningful,
                    and memorable.
                  </p>
                </div>
              </motion.div>

              {/* Right Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end"
              >
                <div className="relative w-[575px] h-[356px] rounded-[8px] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.07)]">
                  <Image
                    src={heroImage}
                    alt="Kattil Experience - Heritage Stay"
                    fill
                    priority
                    sizes="575px"
                    className="object-cover object-center"
                  />
                </div>
              </motion.div>
            </div>

            {/* ================= 3. VALUES / PILLARS CARD ================= */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="
                mt-14 sm:mt-18 md:mt-24
                w-full
                bg-[#F0EAD2]
                rounded-[8px] sm:rounded-[12px] md:rounded-[16px]
                px-6 sm:px-8 md:px-10 lg:px-12 xl:px-14
                py-8 sm:py-10 md:py-12
              "
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 xl:gap-8">
                {VALUES_DATA.map((item, idx) => (
                  <div key={idx} className="flex flex-col text-left">
                    {/* Icon Badge */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-[#0d1b2e] shadow-sm mb-4 sm:mb-5">
                      <LockerIcon />
                    </div>

                    {/* Title */}
                    <h3 className="font-sans font-semibold text-[#0d1b2e] text-[17px] sm:text-[18px] md:text-[19px] mb-4">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-[#0d1b2e]/65 text-[13px] sm:text-[13.5px] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ================= 4. TEAM SECTION ================= */}
            <div className="mt-16 sm:mt-20 md:mt-28">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-start">
                {/* Left Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="lg:col-span-3 xl:col-span-3 text-left"
                >
                  <p className="font-sans text-[11px] sm:text-[12px] font-bold tracking-[0.10em] uppercase text-[#0d1b2e] mb-3 sm:mb-4">
                    OUR TEAM
                  </p>

                  <h2 className="font-sans text-[#0d1b2e] text-[28px] sm:text-[32px] md:text-[36px] font-semibold leading-[1.12] tracking-tight">
                    The people
                    <span className="block font-sans font-semibold mt-1">
                      behind{" "}
                      <span className="font-serif italic font-normal text-[#0d1b2e]">
                        Kattil
                      </span>
                    </span>
                  </h2>
                </motion.div>

                {/* Right Team Cards */}
                <div className="lg:col-span-9 xl:col-span-9">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4 md:gap-6">
                    {TEAM_MEMBERS.map((member, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: 0.1 * idx,
                          ease: EASE,
                        }}
                        className="group flex flex-col"
                      >
                        {/* Photo */}
                        <div className="relative w-full aspect-[276/356] rounded-[8px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] bg-[#0d1b2e]/5">
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        </div>

                        {/* Info */}
                        <div className="mt-3 sm:mt-3.5 text-left">
                          <h4 className="font-sans font-semibold text-[#0d1b2e] text-[17px] sm:text-[18px] leading-tight">
                            {member.name}
                          </h4>
                          <p className="font-sans text-[#0d1b2e]/55 text-[12.5px] sm:text-[13px] mt-0.5">
                            {member.role}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

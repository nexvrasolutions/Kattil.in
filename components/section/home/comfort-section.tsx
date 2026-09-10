"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface ComfortFeature {
  title: string;
  description: string;
}

const FEATURES: ComfortFeature[] = [
  {
    title: "Premium Amenities",
    description: "Comfortable rooms with modern amenities.",
  },
  {
    title: "Prime Locations",
    description: "Our properties are located where it matters most.",
  },
  {
    title: "Hassle-free Booking",
    description: "Simple, secure and quick booking experience.",
  },
  {
    title: "Trusted Hospitality",
    description: "We're here to make your stay memorable.",
  },
];

export default function ComfortSection() {
  return (
    <section
      className="w-full flex items-center justify-center px-3 md:px-5"
      style={{
        background: "linear-gradient(180deg, rgba(240, 234, 210, 0.8) 0%, rgba(240, 234, 210, 0) 100%)",
      }}
    >
      <div className="w-full max-w-[1560px] 2xl:max-w-[1680px] mx-auto min-h-[500px] lg:min-h-[540px] flex items-center pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-[85px] lg:pb-[70px] px-5 sm:px-10 lg:px-14 xl:px-20 box-border">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Left Column: Community Dining Image */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative w-full max-w-full lg:max-w-[432px] aspect-[432/340] rounded-[8px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)]">              <Image
              src="/images/home/dining-community.png"
              alt="Community and comfort at Kattil"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
            </div>
          </motion.div>

          {/* Right Column: Heading & 2x2 Features */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 lg:translate-x-[12px] lg:w-[calc(100%-12px)]"
          >
            {/* Heading */}
            <h2 className="text-[#0d1b2e] text-[34px] sm:text-[42px] md:text-[46px] font-sans font-normal leading-[1.18] tracking-tight mb-10">
              Designed for{"  "}
              <span className="font-serif italic font-normal text-[#0d1b2e]">
                Your
              </span>
              <br />
              <span className="font-serif italic font-normal text-[#0d1b2e]">
                Comfort
              </span>
            </h2>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-8 mb-8">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: 0.15 + index * 0.08,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EDF5E4] border border-[#526442]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-[#526442]" />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#0d1b2e] leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Link */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Link
                href="/about-us"
                className="inline-block text-[14px] text-gray-600 hover:text-[#0d1b2e] underline underline-offset-4 font-medium transition-colors"
              >
                More about us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

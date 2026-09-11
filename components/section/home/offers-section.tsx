"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function OffersSection() {
  return (
    <section className="w-full bg-transparent pt-4 sm:pt-6 md:pt-8 lg:pt-0 pb-10 sm:pb-14 md:pb-20 px-3 md:px-5">
      <div className="w-full max-w-[1920px] mx-auto">
        <div
          className="
            relative w-full overflow-hidden
            bg-[#0E2E4E]
            rounded-[12px]
            min-h-[320px]
            sm:min-h-[380px]
            md:min-h-[420px]
            lg:h-[465px]
            lg:min-h-[465px]
            flex items-center
            px-5
            sm:px-6
            md:px-8
            lg:px-14
            py-8
            sm:py-10
            lg:py-0
          "
        >
          <div
            className="
              relative z-10 w-full
              grid grid-cols-1 lg:grid-cols-12
              gap-8 sm:gap-10 lg:gap-4 xl:gap-8
              items-center
            "
          >
            {/* ================= LEFT CONTENT ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                lg:col-span-5
                flex flex-col justify-center
                text-left
                relative z-30
              "
            >
              <h2
                className=" 
    text-[#D2E6BC]
    text-[28px] 
    sm:text-[34px] 
    md:text-[38px] 
    lg:text-[42px] 
    xl:text-[46px] 
    font-sans font-normal 
    leading-[1.12] 
    tracking-tight 
  "
              >
                Exclusive Stays,
                <span className="block font-serif italic font-normal mt-1">
                  Thoughtful Offers
                </span>
              </h2>
              <p
                className="
                  text-white/80
                  text-[14px]
                  md:text-[15px]
                  font-sans
                  font-normal
                  leading-[22px]
                  md:leading-[24px]
                  tracking-[-0.2px]
                  max-w-[440px]
                  mt-5
                "
              >
                Discover thoughtfully curated offers designed to
                <br className="hidden sm:inline" /> make your stay more rewarding, from special rates
                <br className="hidden sm:inline" /> to exclusive experiences.
              </p>
              <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-[80px]">
                <Link
                  href=""
                  className="
      inline-block  
      text-[#D2E6BC]  
      hover:text-white  
      underline underline-offset-4  
      text-[14px]  
      sm:text-[14px]  
      lg:text-[15px]  
      font-medium  
      transition-colors  
    "
                >
                  Explore Offers
                </Link>
              </div>
            </motion.div>

            {/* ================= RIGHT VISUAL ================= */}
            <div
              className="
                hidden lg:flex
                lg:col-span-7
                items-center justify-end
                w-full
              "
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  relative
                  w-full
                  max-w-[520px]
                  xl:max-w-[620px]
                  select-none
                  flex items-center justify-end
                "
              >
                <Image
                  src="/images/home/offers-map-visual.png"
                  alt="Exclusive Stays Map"
                  width={467}
                  height={633}
                  priority
                  className="
  relative 
  w-full 
  max-w-[380px] 
  xl:max-w-[480px] 
  select-none 
  flex items-center justify-end
  translate-x-[-60px]
  xl:translate-x-[-70px]
"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
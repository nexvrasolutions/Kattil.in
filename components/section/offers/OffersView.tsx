"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { usePageView } from "@/hooks/usePageView";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface OfferProperty {
  slug: string;
  name: string;
  city: string;
  tagline: string;
  image: string;
  bookingUrl: string;
}

// Offers keyed by property slug. Properties without an entry use a smart default offer.
const PROPERTY_OFFERS: Record<
  string,
  { title: string; summary: string; benefits: string[] }
> = {
  "the-sparrow": {
    title: "Kaniyakumari coastal stay",
    summary: "Stay + breakfast + local experience.",
    benefits: ["Stay", "Breakfast", "Local experience"],
  },
  "kattil-executive-stay": {
    title: "Chennai weekend escape",
    summary: "Special rate at Kattil Chennai.",
    benefits: ["Special weekend rate", "Complimentary Wi-Fi", "24/7 Butler support"],
  },
  "kattil-stay-madurai": {
    title: "Temple City heritage retreat",
    summary: "Homely comfort + breakfast + temple guide.",
    benefits: ["Special direct rate", "Authentic breakfast", "Temple tour guidance"],
  },
  "hostel-gandhi": {
    title: "Backpackers & nomad getaway",
    summary: "Cozy stay + high-speed Wi-Fi + lounge access.",
    benefits: ["Special nomad rate", "High-speed Wi-Fi", "Community lounge access"],
  },
  "kattil-stay-coimbatore": {
    title: "Manchester of South getaway",
    summary: "Serene suite stay + breakfast + city views.",
    benefits: ["Special suite rate", "Breakfast included", "City view lounge"],
  },
};

const EXPERIENCE_ITEMS = [
  "Accommodation",
  "Breakfast",
  "Local experience",
  "Dining",
  "Destination activity",
  "Late checkout",
];

export default function OffersView({ properties }: { properties: OfferProperty[] }) {
  usePageView();

  // Properties with a defined offer lead; the rest keep their DB order.
  const sortedProperties = [...properties].sort(
    (a, b) => Number(b.slug in PROPERTY_OFFERS) - Number(a.slug in PROPERTY_OFFERS)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      {/* ── 1. Hero ───────────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[280px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-12 sm:pb-14 md:pb-16">
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

        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="font-sans text-[15px] sm:text-[14px] uppercase text-[#FFFFFF] mb-4 drop-shadow-sm"
            >
              KATTIL OFFERS
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] leading-[1.12]">
                Exclusive Stays.
              </span>
              <span className="block mt-1 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15]">
                Thoughtful Offers.
              </span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── 2. Property Offers ────────────────────────────────────────── */}
      <section className="relative z-20 w-full pt-16 md:pt-24 pb-16 md:pb-24 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-2xl text-left"
            >
              <p className="font-sans text-[11px] sm:text-[12px] font-bold uppercase text-[#0d1b2e] mb-3 sm:mb-4">
                PROPERTY OFFERS
              </p>
              <h2 className="font-sans text-[#0d1b2e] text-[28px] sm:text-[32px] md:text-[36px] leading-[1.12] tracking-tight">
                Special stays at{" "}
                <span className="font-serif italic font-normal">our properties</span>
              </h2>
              <p className="font-sans text-[#0d1b2e]/65 text-[14px] md:text-[15px] leading-relaxed mt-4">
                Offers made for individual Kattil locations.
              </p>
            </motion.div>

            <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {sortedProperties.map((property, idx) => {
                const offer = PROPERTY_OFFERS[property.slug];
                const summary =
                  offer?.summary || property.tagline || `Stay at ${property.name}, ${property.city}.`;
                return (
                  <motion.div
                    key={property.slug}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.6, delay: 0.1 * (idx % 3), ease: EASE }}
                    className="group flex flex-col rounded-[8px] sm:rounded-[12px] overflow-hidden bg-[#F0EAD2] text-[#0d1b2e]"
                  >
                    {property.image && (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0d1b2e]/5">
                        <Image
                          src={property.image}
                          alt={property.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-500 ease-out"
                        />
                      </div>
                    )}

                    <div className="flex flex-col flex-1 px-6 sm:px-8 md:px-10 py-8 sm:py-10">
                      <p
                        className="font-sans text-[11px] sm:text-[12px] font-bold uppercase mb-3 text-[#0d1b2e]"
                      >
                        {offer ? `${property.name} · ${property.city}` : property.city}
                      </p>
                      <h3
                        className="font-sans font-normal text-[22px] sm:text-[24px] md:text-[26px] leading-tight text-[#0d1b2e]"
                      >
                        {offer?.title || property.name}
                      </h3>
                      <p
                        className="font-sans text-[13px] md:text-[14px] leading-relaxed mt-2 text-[#0d1b2e]/65"
                      >
                        {summary}
                      </p>

                      {offer && (
                        <ul className="mt-6 space-y-3">
                          {offer.benefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-center gap-3 font-sans text-[13px] md:text-[14px]"
                            >
                              <span
                                aria-hidden
                                className="w-3 h-px shrink-0 bg-[#0d1b2e]"
                              />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-8 flex-1 flex items-end">
                        <motion.a
                          whileTap={{ scale: 0.98 }}
                          href={property.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Book your stay at ${property.name}`}
                          className="w-full min-h-[44px] py-[12px] px-[32px] rounded-[6px] border border-[#111827] flex items-center justify-center text-[#111827] font-[Public_Sans] font-medium text-[14px] hover:bg-[#0d1b2e] hover:text-white transition-all text-center"
                        >
                          Book Your Stay
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Experience ─────────────────────────────────────────────── */}
      <section className="w-full pb-16 md:pb-24 bg-[#FAF8F5]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: EASE }}
            className="bg-[#0E2E4E] text-white rounded-[12px] px-5 md:px-8 lg:px-15 py-12 sm:py-16 md:py-20 shadow-[0_12px_40px_rgba(14,39,60,0.2)] relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-5">
                <p className="font-sans text-[11px] sm:text-[12px] font-bold uppercase text-white/85 mb-3 sm:mb-4">
                  EXPERIENCE
                </p>
                <h2 className="tracking-tight leading-tight font-sans text-3xl sm:text-4xl md:text-[36px] font-normal text-[#d2e6bc]">
                  The weekend{" "}
                  <span className="font-serif italic">reset</span>
                </h2>
                <p className="font-sans text-[14px] md:text-[15px] text-[#a6bfd5] leading-relaxed mt-5 max-w-md">
                  A little time away can make all the difference. Go beyond your
                  room and discover more of the destination around you.
                </p>
              </div>

              <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {EXPERIENCE_ITEMS.map((item, idx) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.1 + idx * 0.06, ease: EASE }}
                    className="flex items-center gap-3 rounded-[8px] border border-white/15 px-5 py-4 font-sans text-[14px] md:text-[15px] text-white transition-colors hover:border-[#d2e6bc]/60 hover:bg-white/5"
                  >
                    <span aria-hidden className="w-3 h-px shrink-0 bg-[#d2e6bc]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

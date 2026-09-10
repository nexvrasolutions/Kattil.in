"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SkylineSilhouette from "@/components/ui/SkylineSilhouette";

// Custom 2-door cabinet / nightstand icon matching the exact design uploaded by user
function FurnitureIcon({ className = "w-6 h-6 text-[#4a583d]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top rounded lid / counter */}
      <path d="M4 6.5C4 5.12 5.12 4 6.5 4H17.5C18.88 4 20 5.12 20 6.5V7H4V6.5Z" />
      {/* Main cabinet body */}
      <path d="M4 7H20V16C20 17.6569 18.6569 19 17 19H7C5.34315 19 4 17.6569 4 16V7Z" />
      {/* Center vertical split */}
      <line x1="12" y1="7" x2="12" y2="19" />
      {/* Left door handle */}
      <line x1="8.5" y1="11.5" x2="8.5" y2="14.5" strokeWidth="2.4" strokeLinecap="round" />
      {/* Right door handle */}
      <line x1="15.5" y1="11.5" x2="15.5" y2="14.5" strokeWidth="2.4" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="6.5" y1="19" x2="5.5" y2="21.5" strokeWidth="2" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="17.5" y1="19" x2="18.5" y2="21.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const WHY_PARTNER_ITEMS = [
  {
    title: "More Bookings",
    description: "Thoughtfully designed spaces that make settling in feel effortless.",
  },
  {
    title: "Better Operations",
    description: "Thoughtfully designed spaces that make settling in feel effortless.",
  },
  {
    title: "Better Revenue",
    description: "Thoughtfully designed spaces that make settling in feel effortless.",
  },
  {
    title: "You Keep Ownership",
    description: "Thoughtfully designed spaces that make settling in feel effortless.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Tell Us About Your Property",
    description:
      "Share basic details about your hotel, villa, guesthouse, homestay or hospitality property. Tell us about its location, number of rooms, current operations, and your goals.",
  },
  {
    step: "02",
    title: "We Understand Your Property",
    description:
      "Our team studies your property's location, market, rooms, current performance and business potential. We identify where improvements can be made.",
  },
  {
    step: "03",
    title: "We Manage Your Property",
    description:
      "Once we partner with you, our team takes care of the day-to-day operations. From bookings and staff to housekeeping, maintenance and guest management.",
  },
  {
    step: "04",
    title: "We Grow Together",
    description:
      "Our process is simple and transparent. We understand your property, take care of the operations, and work with you to improve its performance.",
  },
];

const PROPERTY_TYPES = [
  {
    title: "Hotels",
    image: "/images/partners/property-hotel.png",
  },
  {
    title: "Resorts",
    image: "/images/partners/property-hotel.png",
  },
  {
    title: "Guesthouses",
    image: "/images/partners/property-hotel.png",
  },
  {
    title: "Villas",
    image: "/images/partners/property-hotel.png",
  },
];

const PARTNERSHIP_MODELS = [
  {
    title: "No Upfront Fee",
    description: "Thoughtfully designed spaces that make settling in feel effortless.",
  },
  {
    title: "Shared Revenue",
    description: "We grow the property together and share the success.",
  },
  {
    title: "Transparent Reporting",
    description: "You receive clear updates about your property's performance.",
  },
  {
    title: "Full Ownership",
    description: "Thoughtfully designed spaces that make settling in feel effortless.",
  },
];

export default function PartnersView() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Section with Monuments Skyline Silhouette ─────────── */}
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
            <p className="font-sans text-[14px] sm:text-[15px]  uppercase text-[#FFFFFF] mb-4 drop-shadow-sm">
              PARTNER WITH KATTIL
            </p>

            <h1 className="text-white tracking-tight">
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.12]">
                Your Property. Our
              </span>
              <span className="block mt-1">
                <span className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white">
                  Expertise.{" "}
                </span>
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal italic text-[#f4f7ef] leading-[1.15]">
                  Shared Growth.
                </span>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── 2. Why Partner with Kattil? ───────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF8F5]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Title */}
            <div className="text-center mb-14 md:mb-18">
              <h2 className="text-[#111827] tracking-tight">
                <span className="font-sans text-3xl sm:text-4xl md:text-[42px] font-normal">
                  Why partner with{" "}
                </span>
                <span className="font-serif text-3xl sm:text-4xl md:text-[44px] font-normal italic">
                  Kattil?
                </span>
              </h2>
            </div>

            {/* 4 Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 text-left">
              {WHY_PARTNER_ITEMS.map((item, idx) => (
                <div key={idx} className="flex flex-col items-start text-left">
                  {/* Round Icon Badge */}
                  <div className="w-14 h-14 rounded-full bg-[#FFFFFF] flex items-center justify-center mb-5">
                    <FurnitureIcon className="w-6 h-6 text-[#4a583d]" />
                  </div>

                  <h3 className="font-sans font-semibold text-[17px] md:text-[18px] text-[#111827] mb-2">
                    {item.title}
                  </h3>

                  <p className="font-sans text-[13px] md:text-[14px] text-[#6b7280] leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Large Team / Community Banner Image */}
            <div className="mt-14 md:mt-20 w-full aspect-[16/9] sm:aspect-[21/10] md:aspect-[24/10] max-h-[540px] relative rounded-[8px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#e5e7eb]/60">
              <Image
                src="/images/partners/community-group.png"
                alt="Kattil Community and Team"
                fill
                sizes="(max-width: 1920px) 100vw, 1920px"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. How It Works: From your property Better performing ───────── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF8F5] scroll-mt-36 md:scroll-mt-44">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* Left Column: Heading with gap below floating navbar */}
              <div className="lg:col-span-5 lg:sticky lg:top-[170px] xl:lg:top-[180px]">
                <p className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.25em] text-[#6b7280] mb-3">
                  HOW IT WORKS
                </p>

                <h2 className="text-[#111827] tracking-tight leading-tight">
                  <span className="block font-sans text-3xl sm:text-4xl md:text-[44px] font-normal">
                    From your property
                  </span>
                  <span className="block font-serif text-3xl sm:text-4xl md:text-[46px] font-normal italic mt-1">
                    Better performing
                  </span>
                </h2>
              </div>

              {/* Right Column: 4 Numbered Steps that scroll smoothly */}
              <div className="lg:col-span-7 divide-y divide-[#e5e7eb]">
                {HOW_IT_WORKS_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className="py-10 md:py-14 first:pt-0 lg:first:pt-[30px] last:pb-2 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 transition-colors"
                  >
                    {/* Number */}
                    <span className="font-mono text-[13px] md:text-[14px] font-semibold text-[#9ca3af] tracking-wider shrink-0 pt-1">
                      {step.step}
                    </span>

                    {/* Step Title */}
                    <h3 className="font-sans font-semibold text-[17px] md:text-[19px] text-[#111827] sm:w-56 shrink-0 leading-snug">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="font-sans text-[13px] md:text-[14px] text-[#6b7280] leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. What Properties Can Partner with Us? ───────────────────── */}
      <section
        className="w-full py-16 md:py-24"
        style={{
          background: "linear-gradient(180deg, rgba(240, 234, 210, 0) 0%, #F0EAD2 100%)",
        }}
      >
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Heading: 2 centered lines */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-[#111827] tracking-tight">
                <span className="block font-sans text-3xl sm:text-4xl md:text-[42px] font-normal">
                  What properties can
                </span>
                <span className="block font-serif text-3xl sm:text-4xl md:text-[44px] font-normal italic mt-1 text-[#111827]">
                  Partner with us?
                </span>
              </h2>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
              {PROPERTY_TYPES.map((prop, idx) => (
                <div key={idx} className="group flex flex-col text-left">
                  {/* Card Image */}
                  <div className="relative w-full aspect-[4/5] rounded-[10px] md:rounded-[12px] overflow-hidden bg-[#e5e7eb] shadow-xs">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-sans text-[16px] md:text-[17px] font-medium text-[#111827] mt-3.5 text-left">
                    {prop.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. A Simple Partnership Model (Deep Navy Card) ─────────────── */}
      <section className="w-full py-8 md:py-12 bg-[#F0EAD2]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            <div className="bg-[#0E2E4E] text-white rounded-[8px] p-8 sm:p-12 md:p-16 lg:p-20 shadow-[0_12px_40px_rgba(14,39,60,0.2)] relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {/* Left Column: Heading + Subtitle */}
                <div className="lg:col-span-5">
                  <h2 className="text-white tracking-tight leading-tight">
                    <span className="block font-sans text-3xl sm:text-4xl md:text-[44px] font-normal text-[#d2e6bc]">
                      A simple
                    </span>
                    <span className="block mt-1">
                      <span className="font-sans text-3xl sm:text-4xl md:text-[44px] font-normal text-[#d2e6bc]">
                        partnership{" "}
                      </span>
                      <span className="font-serif text-3xl sm:text-4xl md:text-[46px] font-normal italic text-[#d2e6bc]">
                        Model
                      </span>
                    </span>
                  </h2>

                  <p className="font-sans text-[14px] md:text-[15px] text-[#a6bfd5] leading-relaxed mt-5 max-w-md">
                    Discover thoughtfully curated offers designed to make your stay more rewarding,
                    from special rates to exclusive experiences.
                  </p>
                </div>

                {/* Right Column: 2x2 Feature Grid */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                  {PARTNERSHIP_MODELS.map((model, idx) => (
                    <div key={idx} className="flex flex-col">
                      {/* White Circular Badge */}
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                        <FurnitureIcon className="w-5 h-5 text-[#0e273c]" />
                      </div>

                      <h3 className="font-sans font-semibold text-[17px] md:text-[18px] text-white mb-1.5">
                        {model.title}
                      </h3>

                      <p className="font-sans text-[13px] md:text-[14px] text-[#9bb3ca] leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Your Property Could Do More (CTA Section) ──────────────── */}
      <section className="w-full py-16 md:py-24 bg-[#F0EAD2]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15 text-center max-w-3xl mx-auto">
            <h2 className="text-[#111827] tracking-tight">
              <span className="font-sans text-3xl sm:text-4xl md:text-[42px] font-normal">
                Your property could{" "}
              </span>
              <span className="font-serif text-3xl sm:text-4xl md:text-[44px] font-normal italic">
                Do more.
              </span>
            </h2>

            <p className="font-sans text-[14px] md:text-[16px] text-[#6b7280] leading-relaxed mt-4 max-w-xl mx-auto">
              If your property has potential but you&apos;re struggling with bookings, staff,
              operations or revenue, let&apos;s talk.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <a
                href="https://wa.me/917448749779?text=Hi%20Kattil%20Team%2C%20I%20am%20interested%20in%20partnering%20with%20you%20for%20my%20property."
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-[8px] bg-[#0E2E4E] text-white font-sans text-[14px] font-semibold hover:bg-[#153a57] transition-colors shadow-sm"
              >
                Partner With us
              </a>

              <a
                href="tel:+917448749779"
                className="px-8 py-3.5 rounded-[6px] border border-[#0e273c] text-[#0e273c] font-sans text-[14px] font-semibold hover:bg-[#0e273c]/5 transition-colors"
              >
                View Broucher
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

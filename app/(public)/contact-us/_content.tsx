"use client";

import { useState } from "react";
import { usePageView } from "@/hooks/usePageView";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import type { LocationItem } from "./page";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function formatLocationLabel(label: string) {
  if (!label) return "";
  return label
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ContactContent({ locations }: { locations: LocationItem[] }) {
  usePageView();
  const validLocations = (locations ?? []).filter((l) => Boolean(l.label && l.label.trim()));
  const [activeId, setActiveId] = useState(validLocations[0]?.id ?? "");
  const [mapLoading, setMapLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const active = validLocations.find((l) => l.id === activeId) ?? validLocations[0];

  const handleTabChange = (id: string) => {
    if (id === activeId) return;
    setMapLoading(true);
    setActiveId(id);
    setMapKey((k) => k + 1);
  };

  if (!active) {
    return (
      <>
        <Navbar />
        <section className="bg-secondary min-h-screen flex items-center justify-center">
          <p className="font-sans text-white/60 text-base">Contact information coming soon.</p>
        </section>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      {/* ── 1. Hero Header Section (Sage Green) ───────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[280px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-12 sm:pb-14 md:pb-16">
        {/* Right Background Monument Skyline Silhouette */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.9, x: 0 }}
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
              className="font-[Public_Sans] font-semibold text-[14px] leading-[14px] tracking-normal text-left align-middle uppercase text-white/95 mb-3 drop-shadow-xs"
            >
              GET IN TOUCH
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] leading-[1.12]">
                We&apos;d Love to
              </span>
              <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1 whitespace-nowrap">
                Hear from You
              </span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── 2. Map + Contact info section ─────────────────────────────────── */}
      <section className="relative z-20 w-full py-10 sm:py-12 md:py-16 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">

            {/* Location Tabs (Matching Gallery / Blog Pill Design) */}
            {validLocations.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
                className="mb-8 sm:mb-10"
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {validLocations.map((loc) => {
                    const isActive = activeId === loc.id;
                    const formattedName = formatLocationLabel(loc.label);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleTabChange(loc.id)}
                        className={`font-[Public_Sans] text-[13px] sm:text-[13.5px] transition-all whitespace-nowrap cursor-pointer px-3.5 sm:px-4 py-1.5 rounded-[6px] ${
                          isActive
                            ? "bg-[#b4c7a5] text-[#22301c] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                            : "text-[#6b7280] hover:text-[#111827] font-medium hover:bg-[#eae8e3]"
                        }`}
                      >
                        {formattedName}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 items-stretch">

              {/* Map */}
              <div className="relative overflow-hidden rounded-2xl h-80 sm:h-96 lg:h-auto min-h-[360px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                {active.mapSrc ? (
                  <iframe
                    key={mapKey}
                    src={active.mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${active.label} location map`}
                    onLoad={() => setMapLoading(false)}
                  />
                ) : (
                  <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                    <p className="font-sans text-white/40 text-sm">Map not available</p>
                  </div>
                )}

                <AnimatePresence>
                  {mapLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-primary flex flex-col items-center justify-center gap-5"
                    >
                      <motion.img
                        src="/assets/logo.png"
                        alt="Loading"
                        className="h-12 md:h-14 object-contain"
                        style={{ filter: "brightness(0) invert(1)" }}
                        animate={{ opacity: [0.35, 1, 0.35], scale: [0.97, 1.03, 0.97] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-secondary/55"
                            animate={{ opacity: [0.15, 1, 0.15], y: [0, -5, 0] }}
                            transition={{ duration: 0.85, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact info card */}
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="relative overflow-hidden rounded-2xl p-7 sm:p-9 lg:p-10 flex flex-col justify-center gap-6 border border-white/5 shadow-[0_16px_40px_rgba(13,27,46,0.3)]"
                style={{
                  backgroundColor: "#0d1b2e",
                  transform: "translateZ(0)",
                }}
              >
                {/* Navbar texture overlay - Exact match to Navbar */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    backgroundImage: "url('/assets/overlay.png')",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    transform: "translateZ(0)",
                  }}
                />

                <div className="relative z-10 flex flex-col gap-7 sm:gap-8">
                  {active.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4.5 h-4.5 text-[#D2E6BC]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-[Public_Sans] text-[14px] font-semibold uppercase text-[#D2E6BC]">
                          Address
                        </span>
                        <p className="font-[Public_Sans] font-normal text-white text-[14px] sm:text-[14px] leading-[1.6]">
                          {active.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {active.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-4.5 h-4.5 text-[#D2E6BC]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-[Public_Sans] text-[12px] font-semibold uppercase tracking-[0.14em] text-[#D2E6BC]">
                          Phone
                        </span>
                        <a
                          href={`tel:${active.phone.replace(/\s/g, "")}`}
                          className="font-[Public_Sans] font-medium text-white text-[15px] sm:text-[15.5px] leading-[1.6] hover:text-[#D2E6BC] transition-colors duration-200"
                        >
                          {active.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {active.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4.5 h-4.5 text-[#D2E6BC]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-[Public_Sans] text-[12px] font-semibold uppercase tracking-[0.14em] text-[#D2E6BC]">
                          Email
                        </span>
                        <a
                          href={`mailto:${active.email}`}
                          className="font-[Public_Sans] font-medium text-white text-[15px] sm:text-[15.5px] leading-[1.6] hover:text-[#D2E6BC] transition-colors duration-200 break-all"
                        >
                          {active.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


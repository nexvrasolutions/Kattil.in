"use client";

import { useState } from "react";
import { usePageView } from "@/hooks/usePageView";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import type { LocationItem } from "./page";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
    <>
      <Navbar />

      {/* ── Header section ─────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-8 sm:pb-9 md:pb-10 lg:pb-12">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20 w-full">

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.28em] text-tertiary mb-5"
          >
            Contact Us
          </motion.p>

          {validLocations.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
              className="flex items-center gap-2.5"
            >
              {validLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleTabChange(loc.id)}
                  className="relative overflow-hidden px-5 py-2.5 rounded-full border font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 cursor-pointer"
                  style={{
                    backgroundColor: activeId === loc.id ? "var(--color-primary)" : "transparent",
                    borderColor: activeId === loc.id ? "transparent" : "white",
                    color: "white",
                  }}
                >
                  {loc.label}
                  {activeId === loc.id && (
                    <motion.span
                      layoutId="activeContactPill"
                      className="absolute inset-0 bg-white rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Map + Contact info section ─────────────────────────────────── */}
      <section className="relative z-20 bg-[#FAF8F5] py-10 md:py-14 lg:py-20 rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20">

          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

            {/* Map */}
            <div className="relative overflow-hidden rounded-2xl h-72 sm:h-96 lg:h-120">
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
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              className="bg-primary rounded-2xl px-8 py-9 lg:px-10 lg:py-11 flex flex-col gap-8"
            >
              {active.address && (
                <div className="flex flex-col gap-2">
                  <span className="font-sans font-normal text-tertiary" style={{ fontSize: 16, lineHeight: "22px" }}>Address :</span>
                  <p className="font-sans font-medium text-white" style={{ fontSize: 16, lineHeight: "22px" }}>{active.address}</p>
                </div>
              )}
              {active.phone && (
                <div className="flex flex-col gap-2">
                  <span className="font-sans font-normal text-tertiary" style={{ fontSize: 16, lineHeight: "22px" }}>Phone :</span>
                  <a href={`tel:${active.phone.replace(/\s/g, "")}`} className="font-sans font-medium text-white hover:text-secondary transition-colors duration-200" style={{ fontSize: 16, lineHeight: "22px" }}>{active.phone}</a>
                </div>
              )}
              {active.email && (
                <div className="flex flex-col gap-2">
                  <span className="font-sans font-normal text-tertiary" style={{ fontSize: 16, lineHeight: "22px" }}>Email :</span>
                  <a href={`mailto:${active.email}`} className="font-sans font-medium text-white hover:text-secondary transition-colors duration-200 break-all" style={{ fontSize: 16, lineHeight: "22px" }}>{active.email}</a>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}

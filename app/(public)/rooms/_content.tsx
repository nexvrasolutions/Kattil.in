"use client";

import { useState, useRef } from "react";
import { usePageView } from "@/hooks/usePageView";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";

export interface RoomItem {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  link?: string;
  description?: string;
  city: { name: string; slug: string };
}

export interface CityTab {
  _id: string;
  name: string;
  slug: string;
  label?: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function AnimatedWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: delay + i * 0.06, ease: "easeOut" }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function trackBookNow(branch: string, roomName: string, roomId: string) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "book_now", page: "/rooms", branch, roomName, roomId }),
  }).catch(() => {});
}

function RoomCard({ room, index, branch }: { room: RoomItem; index: number; branch: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.09 }}
      className="flex flex-col group"
    >
      <div className="relative aspect-3/2 md:aspect-4/4 xl:aspect-4/3 2xl:aspect-4/4 overflow-hidden rounded-xl mb-2 md:mb-5">
        {room.images?.[0] ? (
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={index < 2}
          />
        ) : (
          <div className="h-full w-full bg-primary/10" />
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm flex items-center justify-center py-1 rounded-xl px-3">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.22em] text-primary">Available</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-2.5">
        <h3 className="font-sans text-xl font-semibold text-primary leading-8">{room.name}</h3>

        {room.link && (
          <motion.div className="relative overflow-hidden mt-2 md:mt-3 rounded-lg bg-primary w-full cursor-pointer" whileHover="hover" initial="rest" animate="rest">
            <a
              href={room.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-center py-4 w-full"
              onClick={() => trackBookNow(branch, room.name, String(room._id))}
            >
              <motion.span variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }} style={{ transformOrigin: "left" }} transition={{ duration: 0.48, ease: EASE }} className="absolute inset-0 bg-secondary" />
              <motion.span variants={{ rest: { color: "#ffffff" }, hover: { color: "#081A2B" } }} transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }} className="relative z-10 font-sans text-[11px] font-bold uppercase tracking-[0.22em]">
                Book Now
              </motion.span>
            </a>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

export default function RoomsContent({
  cities,
  grouped,
  initialCity,
}: {
  cities: CityTab[];
  grouped: Record<string, RoomItem[]>;
  initialCity?: string;
}) {
  usePageView();
  const tabs = cities.length > 0 ? cities.map((c) => c.slug) : [];
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialCity) {
      const match = tabs.find((t) => t.toLowerCase() === initialCity.toLowerCase());
      if (match) return match;
    }
    return tabs[0] ?? "";
  });
  const dirRef = useRef(0);

  function handleTabChange(slug: string) {
    if (slug === activeTab) return;
    dirRef.current = tabs.indexOf(slug) > tabs.indexOf(activeTab) ? 1 : -1;
    setActiveTab(slug);
  }

  const currentRooms = grouped[activeTab] ?? [];
  const activeCity = cities.find((c) => c.slug === activeTab);

  if (cities.length === 0) {
    return (
      <>
        <Navbar />
        <section className="bg-secondary pt-28 md:pt-36 lg:pt-45 pb-28">
          <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20 text-center">
            <p className="font-sans text-white/60 text-base">No rooms available yet.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-secondary pt-28 md:pt-36 lg:pt-45 pb-8 md:pb-14">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-0">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-normal text-white leading-[1.05] tracking-tight mb-10">
                <AnimatedWords text="Refined Living" delay={0.12} />
              </h1>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }} className="flex items-center gap-2.5 shrink-0">
                {cities.map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => handleTabChange(city.slug)}
                    className="relative overflow-hidden px-5 py-2.5 rounded-full border font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 cursor-pointer"
                    style={{
                      backgroundColor: activeTab === city.slug ? "var(--color-primary)" : "transparent",
                      borderColor: activeTab === city.slug ? "transparent" : "white",
                      color: "white",
                    }}
                  >
                    {city.label ?? city.name}
                    {activeTab === city.slug && (
                      <motion.span layoutId="activeRoomPill" className="absolute inset-0 bg-white rounded-full -z-10" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-tertiary py-14 md:py-20 lg:py-15 overflow-hidden">
        <div className="mx-auto flex flex-col gap-5 max-w-480 px-5 md:px-8 lg:px-20">
          <AnimatePresence mode="wait" custom={dirRef.current}>
            <motion.div
              key={activeTab}
              custom={dirRef.current}
              variants={{
                enter: (d: number) => ({ x: d * 56, opacity: 0, filter: "blur(6px)" }),
                center: { x: 0, opacity: 1, filter: "blur(0px)" },
                exit: (d: number) => ({ x: d * -56, opacity: 0, filter: "blur(4px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: EASE }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-5"
            >
              {currentRooms.length === 0 ? (
                <p className="col-span-full font-sans text-primary/50 text-sm text-center py-10">
                  No rooms available for {activeCity?.name ?? activeTab}.
                </p>
              ) : (
                currentRooms.map((room, i) => <RoomCard key={String(room._id)} room={room} index={i} branch={activeTab} />)
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

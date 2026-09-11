"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wifi, Sparkles, Building2, MapPin, Check, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BookingBarWidget from "@/components/layout/booking-bar-widget";
import { PropertyRoomOption } from "./PropertyDetailsView";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RoomsListingViewProps {
  destinationSlug?: string;
  destinationName?: string;
  propertyName?: string;
  hotelValue?: string;
  rooms: PropertyRoomOption[];
  allCities?: { name: string; slug: string }[];
}

export default function RoomsListingView({
  destinationSlug,
  destinationName,
  propertyName,
  hotelValue = "kattil",
  rooms: initialRooms,
  allCities = [],
}: RoomsListingViewProps) {
  const [rooms] = useState<PropertyRoomOption[]>(initialRooms);

  const headingDestination = destinationName || (destinationSlug ? destinationSlug.charAt(0).toUpperCase() + destinationSlug.slice(1) : "");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Top Navigation */}
      <Navbar />

      {/* ── Top Hero / Booking Bar Section ─────────────────────────────────── */}
      <section className="relative w-full bg-[#0d1b2e] pt-32 sm:pt-36 md:pt-40 pb-14 md:pb-18 overflow-hidden">
        {/* Background Overlay Texture */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/assets/overlay.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
            opacity: 0.6,
          }}
        />

        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-15 text-center">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="font-sans text-[11px] sm:text-xs md:text-[13px] font-semibold text-[#D2E6BC] uppercase tracking-[0.16em] mb-2.5"
          >
            {headingDestination ? `REFINED LIVING • ${headingDestination.toUpperCase()}` : "REFINED LIVING • ALL DESTINATIONS"}
          </motion.p>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
            className="text-white tracking-tight mb-3"
          >
            <span className="block font-sans text-2xl min-[360px]:text-3xl sm:text-4xl md:text-[44px] font-bold leading-[1.15]">
              {headingDestination ? `Available Rooms in ${headingDestination}` : "Explore Our Handpicked Rooms"}
            </span>
            <span className="block font-serif text-lg min-[360px]:text-xl sm:text-2xl md:text-[28px] font-normal italic text-[#e2ebd6] leading-[1.2] mt-1">
              {propertyName ? `${propertyName} — Book direct for the best rate` : "Find your ideal stay and comfort"}
            </span>
          </motion.h1>

          {/* ── Booking Bar Widget with Pre-Selected & Locked Destination ──── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="mt-8 md:mt-10 max-w-4xl mx-auto"
          >
            <BookingBarWidget
              initialDestination={destinationSlug}
              initialProperty={propertyName}
              lockedDestination={Boolean(destinationSlug)}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Rooms Listing Section ──────────────────────────────────────────── */}
      <main className="relative z-20 flex-1 py-12 md:py-16 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-15">
          {/* Header Row: Count + Destination indicator */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p className="font-sans text-[16px] md:text-[18px] text-[#4b5563]">
                Showing <span className="font-bold text-[#111827]">{rooms.length}</span>{" "}
                room option{rooms.length === 1 ? "" : "s"}
                {headingDestination ? (
                  <span> in <span className="font-bold text-[#111827]">{headingDestination}</span></span>
                ) : null}
              </p>
              {propertyName && (
                <p className="font-sans text-[13px] text-[#6b7280] mt-0.5">
                  Property: <span className="font-semibold text-[#374151]">{propertyName}</span>
                </p>
              )}
            </div>

            {/* Quick destination switch or view all */}
            <div className="flex items-center gap-2 flex-wrap">
              {destinationSlug && (
                <Link
                  href="/rooms"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>View all destinations</span>
                </Link>
              )}
              {allCities.length > 0 &&
                allCities.map((c) => {
                  const isActive = destinationSlug?.toLowerCase() === c.slug.toLowerCase();
                  return (
                    <Link
                      key={c.slug}
                      href={`/rooms?destination=${encodeURIComponent(c.slug)}`}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#0d1b2e] text-white shadow-xs"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {c.name}
                    </Link>
                  );
                })}
            </div>
          </motion.div>

          {/* Rooms Grid */}
          {rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] max-w-xl mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-[#edf5e4] flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-[#526442]" />
              </div>
              <h3 className="font-sans text-xl font-semibold text-[#111827] mb-2">
                No rooms found
              </h3>
              <p className="font-sans text-sm text-[#6b7280] leading-relaxed mb-6">
                We couldn&apos;t find room options for the selected location. Please check other destinations or contact us for assistance.
              </p>
              <Link
                href="/rooms"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#0d1b2e] text-white text-sm font-medium hover:bg-[#162840] transition-colors"
              >
                View All Rooms
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {rooms.map((room, idx) => {
                const roomImg =
                  (room.images && room.images.length > 0 && room.images[0]) ||
                  "/assets/ac-double-room.webp";
                const badge =
                  room.badge ||
                  (idx === 0
                    ? "Private room"
                    : idx === 1
                      ? "Dormitory"
                      : "Private room");
                const amenities =
                  room.amenities && room.amenities.length > 0
                    ? room.amenities
                    : ["Free Wifi", "Restaurant", "Study Desk"];
                const directBookingUrl =
                  room.bookingLink && room.bookingLink.startsWith("http")
                    ? room.bookingLink
                    : `https://live.ipms247.com/booking/book-rooms-${hotelValue}`;

                return (
                  <motion.div
                    key={room._id || idx}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    className="group bg-white rounded-[12px] overflow-hidden border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col"
                  >
                    {/* Room Image */}
                    <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden block">
                      <Image
                        src={roomImg}
                        alt={room.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs">
                        <span className="font-sans text-[11.5px] font-semibold text-[#526442]">
                          {badge}
                        </span>
                      </div>
                    </div>

                    {/* Room Body */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        {/* Title */}
                        <h3 className="font-sans text-[20px] md:text-[22px] font-semibold text-[#111827] leading-snug tracking-tight group-hover:text-[#526442] transition-colors">
                          {room.name}
                        </h3>

                        {/* Description */}
                        <p className="font-sans text-[13.5px] text-[#6b7280] leading-relaxed mt-2 line-clamp-2">
                          {room.description ||
                            "Thoughtfully designed room with modern amenities, warm hospitality, and comfort."}
                        </p>

                        {/* Amenities */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {amenities.map((amenity, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#F5F3EB] text-[12px] font-medium text-[#4b5563]"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Price + Book Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        {room.price ? (
                          <div>
                            <span className="text-xs text-gray-500 block">Starting from</span>
                            <span className="font-sans text-lg font-bold text-[#111827]">
                              {room.price}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs text-gray-500 block">Best Direct Rate</span>
                            <span className="font-sans text-sm font-semibold text-[#526442]">
                              Guaranteed
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {destinationSlug && (
                            <Link
                              href={`/properties/${destinationSlug}`}
                              className="px-3.5 py-2.5 rounded-[8px] border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Details
                            </Link>
                          )}
                          <motion.a
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.98 }}
                            href={directBookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-[8px] bg-[#0d1b2e] hover:bg-[#162840] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <span>Book Now</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


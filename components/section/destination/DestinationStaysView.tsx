"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Wifi, Utensils, Sparkles, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export interface PropertyStay {
  _id: string;
  name: string;
  slug?: string;
  badge?: string; // e.g. "Private room", "Home stay", "Deluxe Suite"
  category?: string;
  images: string[];
  amenities?: string[]; // e.g. ["Free Wifi", "Restaurant"]
  link?: string;
  description?: string;
  occupancy?: string;
  price?: string;
}

interface DestinationStaysViewProps {
  cityName: string;
  citySlug: string;
  properties: PropertyStay[];
}

// Interface for properties
export default function DestinationStaysView({
  cityName,
  citySlug,
  properties: initialProperties,
}: DestinationStaysViewProps) {
  const [stays, setStays] = useState<PropertyStay[]>(
    initialProperties && initialProperties.length > 0
      ? initialProperties
      : []
  );

  // Live client-side fetch from database API to ensure instant updates when admin adds rooms
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/rooms?city=${encodeURIComponent(citySlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data?.rooms)) {
          const mapped: PropertyStay[] = data.data.rooms.map((r: any, idx: number) => ({
            _id: String(r._id),
            name: r.name,
            slug: r.slug,
            badge: r.badge?.trim() || (idx % 2 === 0 ? "Private room" : "Home stay"),
            category: r.category,
            images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
            amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant"],
            link: r.link?.trim() || `/properties/${r.slug || r._id}`,
            description: r.description,
            occupancy: r.occupancy,
          }));
          setStays(mapped);
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [citySlug]);

  const totalCount = stays.length;
  const formattedCount = totalCount < 10 ? `0${totalCount}` : `${totalCount}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Top Navigation */}
      <Navbar />

      {/* ── Sage Green Hero Section with Monument Line-Art ──────────────── */}
      <section className="relative w-full bg-[#9caf88] overflow-hidden pt-36 md:pt-44 lg:pt-52 pb-16 md:pb-24">
        {/* Background architectural monument sketch - hidden on mobile responsive */}
        <div className="hidden md:flex absolute right-0 bottom-0 top-auto md:h-[78%] lg:h-[84%] md:w-[42%] lg:w-[36%] max-w-[500px] pointer-events-none z-0 overflow-hidden items-end justify-end md:pr-6">
          <div
            className="w-full h-full opacity-85 md:opacity-90 bg-no-repeat"
            style={{
              backgroundImage: "url('/images/destinations/hero-monument-sketch.png')",
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
            }}
          />
        </div>

        {/* Hero Content - Aligned exactly with Navbar 'Home' (left) and 'Book Now' (right) */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 max-w-3xl">
            <p
              className="
    font-[Public_Sans]
    font-semibold
    text-[14px]
    sm:text-[12px]
    leading-[14px]
    tracking-[0]
    text-left
    align-middle
    uppercase
    text-[#eaf2e1]
    mb-4
    drop-shadow-sm
  "
            >
              FIND YOUR PERFECT STAY
            </p>

            <h1 className="text-white tracking-tight">
              <span className="block font-sans text-[20px] min-[360px]:text-[22px] min-[390px]:text-[24px] sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.15] whitespace-nowrap">
                Discover handpicked stays
              </span>
              <span className="block font-serif text-[20px] min-[360px]:text-[22px] min-[390px]:text-[24px] sm:text-3xl md:text-4xl lg:text-[42px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1">
                that feel like home.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── Main Properties Listing Grid ─────────────────────────────────── */}
      <main className="flex-1 py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Subheader: Showing 02 Properties in Madurai */}
            <div className="mb-8 md:mb-10 flex items-center justify-between">
              <p className="font-sans text-[15px] md:text-[17px] text-[#4b5563]">
                Showing <span className="font-bold text-[#111827]">{formattedCount}</span>{" "}
                Properties in <span className="font-bold text-[#111827]">{cityName}</span>
              </p>
            </div>

            {/* Cards Grid or Empty State */}
            {stays.length === 0 ? (
              <div className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#edf5e4] flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-[#526442]" />
                </div>
                <h3 className="font-sans text-xl font-semibold text-[#111827] mb-2">
                  Stays in {cityName} Coming Soon
                </h3>
                <p className="font-sans text-sm text-[#6b7280] leading-relaxed mb-6">
                  We are currently curating handpicked properties in {cityName}. In the meantime, explore our available stays in Chennai and Madurai or get in touch with us.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href="/rooms"
                    className="px-5 py-2.5 rounded-lg bg-[#0d1b2e] text-white text-sm font-medium hover:bg-[#162840] transition-colors"
                  >
                    View All Rooms
                  </Link>
                  <Link
                    href="/contact-us"
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-[#374151] text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {stays.map((stay, idx) => {
                  const imgSrc =
                    (stay.images && stay.images.length > 0 && stay.images[0]) ||
                    "/assets/ac-double-room.webp";
                  const stayBadge =
                    stay.badge?.trim() ||
                    (stay.category === "deluxe"
                      ? "Private room"
                      : stay.category === "suite"
                        ? "Luxury Suite"
                        : idx % 2 === 0
                          ? "Private room"
                          : "Home stay");
                  const targetLink =
                    stay.slug
                      ? `/properties/${stay.slug}`
                      : stay._id
                        ? `/properties/${stay._id}`
                        : "/properties/kattil-executive-stay";
                  const stayAmenities =
                    stay.amenities && stay.amenities.length > 0
                      ? stay.amenities
                      : ["Free Wifi", "Restaurant"];

                  return (
                    <div
                      key={stay._id || idx}
                      className="group bg-white rounded-[8px] overflow-hidden border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col"
                    >
                      {/* Property Image */}
                      <Link
                        href={targetLink}
                        className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden block"
                      >
                        <Image
                          src={imgSrc}
                          alt={stay.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                        />
                      </Link>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          {/* Badge / Category */}
                          <p className="font-sans text-[13px] text-[#6b7280] font-normal mb-1.5">
                            {stayBadge}
                          </p>

                          {/* Property Title */}
                          <Link href={targetLink} className="block">
                            <h3 className="font-sans text-[20px] md:text-[22px] font-semibold text-[#111827] leading-snug tracking-tight group-hover:text-[#526442] transition-colors">
                              {stay.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Footer Row: Amenities + View Link */}
                        <div className="mt-6 pt-2 flex items-center justify-between gap-3">
                          {/* Amenities pills */}
                          <div className="flex flex-wrap items-center gap-2">
                            {stayAmenities.map((amenity, aIdx) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-[#f3f4f6] text-[12px] font-medium text-[#4b5563]"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>

                          {/* View Link */}
                          <Link
                            href={targetLink}
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] group-hover:text-[#526442] transition-colors shrink-0"
                          >
                            View <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

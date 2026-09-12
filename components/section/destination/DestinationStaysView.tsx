"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface PropertyStay {
  _id: string;
  name: string;
  slug?: string;
  badge?: string;
  category?: string;
  images: string[];
  amenities?: string[];
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

  // ---------------------------------------------------------
  // Fetch latest properties from backend
  // ---------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/properties?city=${encodeURIComponent(citySlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data?.properties) && data.data.properties.length > 0) {
          const mapped: PropertyStay[] = data.data.properties.map(
            (p: any) => ({
              _id: String(p._id),
              name: p.name,
              slug: p.slug,
              badge: p.badge?.trim() || "Private room",
              category: p.category,
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/assets/ac-double-room.webp"],
              amenities: Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities : ["Free Wifi", "Restaurant"],
              link: `/properties/${p.slug || p._id}`,
              description: p.description,
            })
          );
          setStays(mapped);
        } else {
          // Fallback to rooms if no properties created yet
          fetch(`/api/rooms?city=${encodeURIComponent(citySlug)}`)
            .then((res) => res.json())
            .then((rData) => {
              if (isMounted && rData.success && Array.isArray(rData.data?.rooms) && rData.data.rooms.length > 0) {
                const mapped: PropertyStay[] = rData.data.rooms.map(
                  (r: any, idx: number) => ({
                    _id: String(r._id),
                    name: r.name,
                    slug: r.slug,
                    badge: r.badge?.trim() || (idx % 2 === 0 ? "Private room" : "Home stay"),
                    category: r.category,
                    images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
                    amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant"],
                    link: r.link?.trim() || `/properties/${r.slug || r._id}`,
                    description: r.description,
                  })
                );
                setStays(mapped);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [citySlug]);

  // ---------------------------------------------------------
  // Property count
  // ---------------------------------------------------------
  const totalCount = stays.length;

  const formattedCount =
    totalCount < 10 ? `0${totalCount}` : `${totalCount}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <Navbar />

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section
        className="
          relative
          w-full
          bg-[#8E9F78]
          overflow-hidden
          min-h-[300px]
          sm:min-h-[400px]
          md:min-h-[450px]
          lg:min-h-[500px]
          flex
          flex-col
          justify-end
          pt-28
          sm:pt-32
          md:pt-34
          lg:pt-36
          pb-8
          sm:pb-9
          md:pb-10
          lg:pb-12
        "
      >
        {/* Background Monument Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.2 }}
          className="
            hidden
            md:flex
            absolute
            right-0
            bottom-0
            top-auto
            md:h-[78%]
            lg:h-[84%]
            md:w-[42%]
            lg:w-[36%]
            max-w-[500px]
            pointer-events-none
            z-0
            overflow-hidden
            items-end
            justify-end
            md:pr-6
          "
        >
          <div
            className="
              w-full
              h-full
              bg-no-repeat
            "
            style={{
              backgroundImage:
                "url('/images/destinations/hero-monument-sketch.png')",
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
            }}
          />
        </motion.div>

        {/* Hero Content */}
        <div
          className="
            relative
            z-10
            w-full
            max-w-[1920px]
            mx-auto
            px-3
            md:px-5
          "
        >
          <div
            className="
              relative
              px-5
              md:px-8
              lg:px-15
              max-w-3xl
            "
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="
                font-[Public_Sans]
                font-semibold
                text-[14px]
                sm:text-[12px]
                leading-[14px]
                tracking-[0]
                text-left
                uppercase
                text-[#eaf2e1]
                mb-4
                drop-shadow-sm
              "
            >
              FIND YOUR PERFECT
            </motion.p>

            {/* Hero Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >

              <span
                className="
                  block
                  font-sans
                  text-[20px]
                  min-[360px]:text-[22px]
                  min-[390px]:text-[24px]
                  sm:text-3xl
                  md:text-4xl
                  lg:text-[40px]
                  leading-[1.15]
                  whitespace-nowrap
                "
              >
                Discover handpicked stays
              </span>

              <span
                className="
                  block
                  font-serif
                  text-[20px]
                  min-[360px]:text-[22px]
                  min-[390px]:text-[24px]
                  sm:text-3xl
                  md:text-4xl
                  lg:text-[42px]
                  font-normal
                  italic
                  text-[#f4f7ef]
                  leading-[1.15]
                  mt-1
                "
              >
                that feel like home.
              </span>

            </motion.h1>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROPERTIES SECTION
      ===================================================== */}
      <main className="relative z-20 flex-1 py-12 md:py-16 lg:py-20 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">

        <div
          className="
            w-full
            max-w-[1920px]
            mx-auto
            px-3
            md:px-5
          "
        >
          <div
            className="
              px-5
              md:px-8
              lg:px-15
            "
          >

            {/* -------------------------------------------------
                PROPERTY COUNT
            ------------------------------------------------- */}
            <div
              className="
                mb-8
                md:mb-10
                flex
                items-center
                justify-between
              "
            >
              <p
                className="
                  font-sans
                  text-[15px]
                  md:text-[17px]
                  text-[#4b5563]
                "
              >
                Showing{" "}
                <span className="font-bold text-[#111827]">
                  {formattedCount}
                </span>{" "}
                Properties in{" "}
                <span className="font-bold text-[#111827]">
                  {cityName}
                </span>
              </p>
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}
            {stays.length === 0 ? (

              <div
                className="
                  py-16
                  px-6
                  text-center
                  bg-white
                  rounded-[8px]
                  border
                  border-gray-100
                  shadow-[0_4px_24px_rgba(0,0,0,0.03)]
                  max-w-xl
                  mx-auto
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-[#edf5e4]
                    flex
                    items-center
                    justify-center
                    mx-auto
                    mb-4
                  "
                >
                  <MapPin
                    className="
                      w-6
                      h-6
                      text-[#526442]
                    "
                  />
                </div>

                <h3
                  className="
                    font-sans
                    text-xl
                    font-semibold
                    text-[#111827]
                    mb-2
                  "
                >
                  Stays in {cityName} Coming Soon
                </h3>

                <p
                  className="
                    font-sans
                    text-sm
                    text-[#6b7280]
                    leading-relaxed
                    mb-6
                  "
                >
                  We are currently curating handpicked
                  properties in {cityName}. In the meantime,
                  feel free to get in touch with us.
                </p>

                <div className="flex items-center justify-center">

                  <Link
                    href="/contact-us"
                    className="
                      inline-flex
                      items-center
                      px-6
                      py-2.5
                      rounded-[8px]
                      bg-[#0d1b2e]
                      text-white
                      text-sm
                      font-medium
                      hover:bg-[#162840]
                      transition-colors
                      shadow-sm
                    "
                  >
                    Contact Us
                  </Link>

                </div>
              </div>

            ) : (

              /* =================================================
                 PROPERTY GRID
              ================================================= */
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  lg:grid-cols-3
                  gap-7
                  sm:gap-8
                  md:gap-8
                  justify-items-center
                  lg:justify-items-start
                "
              >

                {stays.map((stay, idx) => {

                  /* ---------------------------------------------
                     IMAGE
                  --------------------------------------------- */
                  const imgSrc =
                    (
                      stay.images &&
                      stay.images.length > 0 &&
                      stay.images[0]
                    ) ||
                    "/assets/ac-double-room.webp";

                  /* ---------------------------------------------
                     BADGE
                  --------------------------------------------- */
                  const stayBadge =
                    stay.badge?.trim() ||
                    (
                      stay.category === "deluxe"
                        ? "Private room"
                        : stay.category === "suite"
                          ? "Luxury Suite"
                          : idx % 2 === 0
                            ? "Private room"
                            : "Home stay"
                    );

                  /* ---------------------------------------------
                     PROPERTY LINK
                  --------------------------------------------- */
                  const targetLink =
                    stay.link && stay.link.startsWith("http")
                      ? stay.link
                      : stay.link && stay.link.trim().length > 0
                        ? (stay.link.includes("?") ? `${stay.link}&city=${encodeURIComponent(citySlug)}` : `${stay.link}?city=${encodeURIComponent(citySlug)}`)
                        : stay.slug
                          ? `/properties/${stay.slug}?city=${encodeURIComponent(citySlug)}`
                          : stay._id
                            ? `/properties/${stay._id}?city=${encodeURIComponent(citySlug)}`
                            : `/properties/kattil-executive-stay?city=${encodeURIComponent(citySlug)}`;

                  /* ---------------------------------------------
                     AMENITIES
                  --------------------------------------------- */
                  const stayAmenities =
                    stay.amenities &&
                      stay.amenities.length > 0
                      ? stay.amenities
                      : ["Free Wifi", "Restaurant"];

                  return (

                    /* =================================================
                       PROPERTY CARD
                    ================================================= */
                    <motion.div
                      key={stay._id || idx}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
                      whileHover={{ y: -6, transition: { duration: 0.25 } }}
                      className="
                        group
                        w-full
                        max-w-[413px]
                        bg-white
                        rounded-[8px]
                        overflow-hidden
                        border
                        border-gray-100
                        shadow-[0_4px_24px_rgba(0,0,0,0.03)]
                        hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)]
                        transition-all
                        duration-300
                        flex
                        flex-col
                      "
                    >

                      {/* =================================================
                          PROPERTY IMAGE
                      ================================================= */}
                      <Link
                        href={targetLink}
                        prefetch={true}
                        className="
                          relative
                          block
                          w-full
                          h-[300px]
                          min-[400px]:h-[320px]
                          sm:h-[300px]
                          md:h-[279px]
                          bg-gray-100
                          overflow-hidden
                          rounded-t-[8px]
                        "
                      >
                        <Image
                          src={imgSrc}
                          alt={stay.name}
                          fill
                          sizes="
                            (max-width: 768px) 100vw,
                            (max-width: 1200px) 50vw,
                            413px
                          "
                          className="
                            object-cover
                            group-hover:scale-[1.04]
                            transition-transform
                            duration-700
                            ease-out
                          "
                        />
                      </Link>

                      {/* =================================================
                          CARD CONTENT
                      ================================================= */}
                      <div
                        className="
                          w-full
                          px-4
                          pt-[16px]
                          pb-4
                          flex
                          flex-col
                          gap-[10px]
                        "
                      >

                        {/* ---------------------------------------------
                            TOP CONTENT
                        --------------------------------------------- */}
                        <div>

                          {/* Badge */}
                          <p
                            className="
                              font-sans
                              text-[13px]
                              leading-[18px]
                              font-normal
                              text-[#526442]
                              mb-[4px]
                            "
                          >
                            {stayBadge}
                          </p>

                          {/* Property Name */}
                          <Link
                            href={targetLink}
                            prefetch={true}
                            className="block"
                          >
                            <h3
                              className="
                                font-sans
                                text-[24px]
                                font-medium
                                text-[#292929]
                                leading-[1.1]
                                tracking-[-0.4px]
                                group-hover:text-[#526442]
                                transition-colors
                              "
                            >
                              {stay.name}
                            </h3>
                          </Link>

                        </div>

                        {/* ---------------------------------------------
                            BOTTOM ROW
                        --------------------------------------------- */}
                        <div
                          className="
                            mt-auto
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          {/* Amenities: dynamic badges from stay */}
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            {stayAmenities.slice(0, 2).map((amenity, aIdx) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#F5F3EB] text-[12px] font-medium text-[#526442] whitespace-nowrap"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>

                          {/* View */}
                          <Link
                            href={targetLink}
                            prefetch={true}
                            className="
                              inline-flex
                              items-center
                              gap-[7px]
                              text-[13px]
                              leading-[18px]
                              font-normal
                              text-[#526442]
                              hover:text-[#374b2f]
                              transition-colors
                              shrink-0
                            "
                          >

                            <span>
                              View
                            </span>

                            <ArrowRight
                              className="
                                w-[16px]
                                h-[16px]
                                stroke-[1.5]
                                group-hover:translate-x-1
                                transition-transform
                                duration-200
                              "
                            />

                          </Link>

                        </div>

                      </div>

                    </motion.div>
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
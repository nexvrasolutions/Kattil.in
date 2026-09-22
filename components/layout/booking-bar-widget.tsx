"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Calendar,
  ChevronDown,
  Search,
  X,
  MapPin,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils/safeFetch";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface HotelPlaceItem {
  id: string;
  name: string; // e.g. "Kattil Chennai"
  place: string; // e.g. "Chennai"
  state: string; // e.g. "Tamil Nadu"
  slug: string;
  hotelValue: string;
  bookingEngineUrl?: string;
  hotelCount?: string;
}

interface FpInstance {
  destroy: () => void;
  close: () => void;
  open: () => void;
  isOpen?: boolean;
  calendarContainer?: HTMLElement;
  setDate: (d: (Date | string)[] | Date | string, triggerChange?: boolean) => void;
  set: (opt: string, val: unknown) => void;
  selectedDates: Date[];
  [key: string]: any;
}

declare global {
  interface Window {
    flatpickr?: (el: HTMLElement, opts: Record<string, unknown>) => FpInstance;
  }
}

// Default fallback list of places & hotels
const DEFAULT_HOTEL_PLACES: HotelPlaceItem[] = [
  {
    id: "prop-hostel-gandhi",
    name: "Hostel Gandhi",
    place: "Chennai",
    state: "Tamil Nadu",
    slug: "hostel-gandhi",
    hotelValue: "hostelgandhi",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-hostelgandhi",
  },
  {
    id: "prop-the-sparrow",
    name: "The Sparrow",
    place: "Kaniyakumari",
    state: "Tamil Nadu",
    slug: "the-sparrow",
    hotelValue: "thesparrow",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-thesparrow",
  },
  {
    id: "prop-kattil-executive-stay",
    name: "Kattil Chennai",
    place: "Chennai",
    state: "Tamil Nadu",
    slug: "kattil-executive-stay",
    hotelValue: "kattilchennai",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattilchennai",
  },
  {
    id: "prop-kattil-coimbatore",
    name: "Kattil Coimbatore",
    place: "Coimbatore",
    state: "Tamil Nadu",
    slug: "kattil-stay-coimbatore",
    hotelValue: "kattilcoimbatore",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattilcoimbatore",
  },
];

function forPost(d: Date | null): string {
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function formatDateDisplay(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getHotelValueForSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (s.includes("gandhi")) return "hostelgandhi";
  if (s.includes("sparrow")) return "thesparrow";
  if (s === "chennai") return "kattilchennai";
  if (s === "coimbatore") return "kattilcoimbatore";
  if (s === "colachel") return "kattilcolachel";
  if (s === "kanniyakumari" || s === "kaniyakumari" || s === "kanyakumari") return "thesparrow";
  return `kattil${s}`;
}

export interface BookingBarWidgetProps {
  initialDestination?: string;
  initialProperty?: string;
  lockedDestination?: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookingBarWidget({
  initialDestination,
  initialProperty,
  lockedDestination = false,
}: BookingBarWidgetProps = {}) {
  const [selectedHotel, setSelectedHotel] = useState<HotelPlaceItem | null>(() => {
    if (!initialDestination && !initialProperty) return null;
    const destLower = (initialDestination || "").toLowerCase().trim();
    const propLower = (initialProperty || "").toLowerCase().trim();
    const match = DEFAULT_HOTEL_PLACES.find((h) => {
      return (
        (propLower &&
          (h.name.toLowerCase().includes(propLower) ||
            propLower.includes(h.name.toLowerCase()) ||
            h.slug.toLowerCase() === propLower)) ||
        (destLower &&
          (h.slug.toLowerCase() === destLower ||
            h.place.toLowerCase() === destLower ||
            destLower.includes(h.slug.toLowerCase()) ||
            destLower.includes(h.place.toLowerCase())))
      );
    });
    if (match) return match;
    if (destLower || propLower) {
      const placeName = destLower ? destLower.charAt(0).toUpperCase() + destLower.slice(1) : "";
      return {
        id: `dest-${destLower || propLower}`,
        name: initialProperty || `Kattil ${placeName}`,
        place: placeName || "Tamil Nadu",
        state: "Tamil Nadu",
        slug: destLower || propLower,
        hotelValue: getHotelValueForSlug(propLower || destLower),
      };
    }
    return null;
  });
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hotelsList, setHotelsList] = useState<HotelPlaceItem[]>(DEFAULT_HOTEL_PLACES);
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const dateBoxRef = useRef<HTMLDivElement>(null);
  const fpInstance = useRef<FpInstance | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [dropdownOpen]);

  // Sync selectedHotel when initialDestination or initialProperty prop changes
  useEffect(() => {
    if (!initialDestination && !initialProperty) return;
    const destLower = (initialDestination || "").toLowerCase().trim();
    const propLower = (initialProperty || "").toLowerCase().trim();

    const match = hotelsList.find((h) => {
      return (
        (propLower &&
          (h.name.toLowerCase().includes(propLower) ||
            propLower.includes(h.name.toLowerCase()) ||
            h.slug.toLowerCase() === propLower)) ||
        (destLower &&
          (h.slug.toLowerCase() === destLower ||
            h.place.toLowerCase() === destLower ||
            destLower.includes(h.slug.toLowerCase()) ||
            destLower.includes(h.place.toLowerCase())))
      );
    });

    if (match) {
      setSelectedHotel(match);
      setHotelError(null);
    } else if (destLower || propLower) {
      const placeName = destLower ? destLower.charAt(0).toUpperCase() + destLower.slice(1) : "";
      setSelectedHotel({
        id: `dest-${destLower || propLower}`,
        name: initialProperty || `Kattil ${placeName}`,
        place: placeName || "Tamil Nadu",
        state: "Tamil Nadu",
        slug: destLower || propLower,
        hotelValue: getHotelValueForSlug(propLower || destLower),
      });
      setHotelError(null);
    }
  }, [initialDestination, initialProperty, hotelsList]);

  // Dynamically load active properties & destinations from database API
  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        const [propsRes, destsRes] = await Promise.all([
          safeFetchJson<{ success: boolean; data: any[] | { count: number; properties: any[] } }>("/api/properties"),
          safeFetchJson<{ success: boolean; data: any[] }>("/api/destinations"),
        ]);

        if (!isMounted) return;

        let items: HotelPlaceItem[] = [];

        // 1. Map all active properties from database
        const rawProps = Array.isArray(propsRes?.data)
          ? propsRes.data
          : (propsRes?.data as any)?.properties || (propsRes as any)?.properties || [];

        if (Array.isArray(rawProps) && rawProps.length > 0) {
          items = rawProps.map((p: any) => {
            const cityName = p.city?.name || "Destination";
            const citySlug = p.city?.slug || cityName.toLowerCase();
            let extractedCode = "";
            if (p.bookingEngineUrl) {
              const match = p.bookingEngineUrl.match(/book-rooms-([^/?#]+)/);
              if (match) extractedCode = match[1];
            }
            const hotelVal = p.hotelCode || extractedCode || getHotelValueForSlug(p.slug || citySlug);

            return {
              id: `prop-${p._id || p.slug}`,
              name: p.name,
              place: cityName,
              state: "Tamil Nadu",
              slug: p.slug || citySlug,
              hotelValue: hotelVal,
              bookingEngineUrl: p.bookingEngineUrl,
            };
          });
        }

        // 2. Fallback to destinations if no properties exist
        if (items.length === 0 && destsRes?.success && Array.isArray(destsRes.data) && destsRes.data.length > 0) {
          items = destsRes.data.map((d: any) => {
            const placeName = d.name || "Destination";
            const slug = d.slug || placeName.toLowerCase();
            return {
              id: `dest-${d._id || slug}`,
              name: `Kattil ${placeName}`,
              place: placeName,
              state: "Tamil Nadu",
              slug: slug,
              hotelValue: getHotelValueForSlug(slug),
              hotelCount: d.hotelCount,
            };
          });
        }

        if (items.length > 0) {
          setHotelsList(items);

          // Auto-match if initial destination is provided
          if (initialDestination || initialProperty) {
            const destLower = (initialDestination || "").toLowerCase().trim();
            const propLower = (initialProperty || "").toLowerCase().trim();
            const matched = items.find((h) => {
              return (
                (propLower &&
                  (h.name.toLowerCase().includes(propLower) ||
                    propLower.includes(h.name.toLowerCase()) ||
                    h.slug.toLowerCase() === propLower)) ||
                (destLower &&
                  (h.slug.toLowerCase() === destLower ||
                    h.place.toLowerCase() === destLower ||
                    destLower.includes(h.slug.toLowerCase()) ||
                    destLower.includes(h.place.toLowerCase())))
              );
            });
            if (matched) {
              setSelectedHotel(matched);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load properties for booking bar:", err);
      }
    }

    loadDestinations();
    return () => {
      isMounted = false;
    };
  }, [initialDestination, initialProperty]);

  // Filter hotels based on lockedDestination and search query
  const filteredHotels = useMemo(() => {
    let list = hotelsList;
    if (lockedDestination && (initialDestination || selectedHotel)) {
      const lockKey = (
        initialDestination ||
        selectedHotel?.slug ||
        selectedHotel?.place ||
        ""
      )
        .toLowerCase()
        .trim();
      const locked = list.filter((item) => {
        return (
          item.slug.toLowerCase() === lockKey ||
          item.place.toLowerCase() === lockKey ||
          lockKey.includes(item.slug.toLowerCase()) ||
          lockKey.includes(item.place.toLowerCase()) ||
          (selectedHotel && item.id === selectedHotel.id)
        );
      });
      if (locked.length > 0) {
        list = locked;
      } else if (selectedHotel) {
        list = [selectedHotel];
      }
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.place.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.hotelValue.toLowerCase().includes(q)
      );
    });
  }, [hotelsList, searchQuery, lockedDestination, initialDestination, selectedHotel]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize Flatpickr for check-in / check-out
  useEffect(() => {
    let alive = true;

    function closeFlatpickr() {
      fpInstance.current?.close();
    }

    function repositionCalendar(instance: any) {
      const box = dateBoxRef.current || dateInputRef.current;
      if (!box || !instance?.calendarContainer) return;
      const rect = box.getBoundingClientRect();
      instance.calendarContainer.style.position = "absolute";
      instance.calendarContainer.style.top = `${rect.bottom + window.scrollY + 6}px`;
      instance.calendarContainer.style.left = `${rect.left + window.scrollX}px`;
      instance.calendarContainer.style.width = `${rect.width}px`;
      instance.calendarContainer.style.minWidth = `${rect.width}px`;
      instance.calendarContainer.style.maxWidth = `${rect.width}px`;
      instance.calendarContainer.style.boxSizing = "border-box";
      instance.calendarContainer.style.bottom = "auto";
      instance.calendarContainer.style.right = "auto";
      instance.calendarContainer.classList.remove("arrowBottom");
      instance.calendarContainer.classList.add("arrowTop");
    }

    function injectStyle(href: string) {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    }

    function injectScript(src: string): Promise<void> {
      return new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          res();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => res();
        s.onerror = () => rej(new Error(`Failed: ${src}`));
        document.head.appendChild(s);
      });
    }

    const handleScrollOrResize = () => {
      if (fpInstance.current?.isOpen) {
        repositionCalendar(fpInstance.current);
      }
    };

    (async () => {
      try {
        injectStyle("https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css");
        await injectScript("https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js");
        if (!alive || !window.flatpickr || !dateInputRef.current) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        fpInstance.current = window.flatpickr(dateInputRef.current, {
          mode: "range",
          dateFormat: "d M Y",
          minDate: today,
          disableMobile: true,
          allowInput: false,
          clickOpens: true,
          closeOnSelect: false,
          position: "below left",
          positionElement: dateBoxRef.current || dateInputRef.current,
          appendTo: document.body,
          showMonths: 1,
          onReady(selectedDates: Date[], dateStr: string, instance: any) {
            if (instance._input) {
              instance._input.setAttribute("inputmode", "none");
              instance._input.setAttribute("readonly", "readonly");
            }
            repositionCalendar(instance);
          },
          onOpen(selectedDates: Date[], dateStr: string, instance: any) {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
            }
            if (instance._input) {
              instance._input.blur();
            }
            if (dateInputRef.current) {
              dateInputRef.current.blur();
            }
            repositionCalendar(instance);
            requestAnimationFrame(() => repositionCalendar(instance));
            setTimeout(() => repositionCalendar(instance), 10);
            setTimeout(() => repositionCalendar(instance), 50);
          },
          onChange(dates: Date[], dateStr: string, instance: any) {
            if (dates.length === 2) {
              const d1 = new Date(dates[0]);
              d1.setHours(0, 0, 0, 0);
              const d2 = new Date(dates[1]);
              d2.setHours(0, 0, 0, 0);
              setCheckin(d1);
              setCheckout(d2);
              setDateDisplay(`${formatDateDisplay(d1)} - ${formatDateDisplay(d2)}`);
              setDateError(null);

              // Keep calendar visible for 1 second so user sees the selected check-out date & range
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
              }
              closeTimerRef.current = setTimeout(() => {
                instance?.close();
              }, 1000);
            } else if (dates.length === 1) {
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
              }
              const d1 = new Date(dates[0]);
              d1.setHours(0, 0, 0, 0);
              setCheckin(d1);
              setCheckout(null);
              setDateDisplay(`${formatDateDisplay(d1)} - Select Check-out`);
            } else {
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
              }
              setCheckin(null);
              setCheckout(null);
              setDateDisplay("");
            }
          },
        });

        window.addEventListener("scroll", handleScrollOrResize, { passive: true });
        window.addEventListener("resize", handleScrollOrResize, { passive: true });
      } catch (e) {
        console.error("[BookingWidget]", e);
      }
    })();

    return () => {
      alive = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      fpInstance.current?.destroy();
    };
  }, []);

  // Check Availability / Booking handler
  function handleCheckAvailability() {
    let hasError = false;

    if (!selectedHotel) {
      setHotelError("Please select a property or location");
      setDropdownOpen(true);
      hasError = true;
    } else {
      setHotelError(null);
    }

    if (!checkin && !checkout) {
      setDateError("Please select check-in and check-out dates");
      fpInstance.current?.open();
      hasError = true;
    } else if (!checkin || !checkout) {
      setDateError("Please select both check-in and check-out dates");
      fpInstance.current?.open();
      hasError = true;
    } else {
      setDateError(null);
    }

    if (hasError) {
      setShakeCount((prev) => prev + 1);
      return;
    }

    const targetHotel = selectedHotel!.hotelValue || "thesparrow";
    const ci = checkin!;
    const co = checkout!;
    const actionUrl = selectedHotel!.bookingEngineUrl || `https://live.ipms247.com/booking/book-rooms-${targetHotel}`;

    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    form.action = actionUrl;

    const fields: Record<string, string> = {
      eZ_chkin: forPost(ci),
      eZ_chkout: forPost(co),
      select_hotel: targetHotel,
      roomtypeunkid: "",
      eZ_adult: "1",
      eZ_child: "0",
      eZ_Nights: "1",
      eZ_room: "1",
      calformat: "dd-mm-yy",
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="w-full max-w-none md:max-w-4xl mx-auto">
        <div className="bg-white rounded-[8px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] p-6 sm:p-7 md:p-6 text-left">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckAvailability();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_236px] items-start gap-5 sm:gap-5.5 md:gap-4 w-full min-w-0">

              {/* ── 1. Choose your stay ────────────────────────────────────────── */}
              <motion.div
                key={`hotel-field-${shakeCount}`}
                animate={hotelError ? { x: [0, -4, 4, -2, 2, 0] } : {}}
                transition={{ duration: 0.25 }}
                className="relative w-full"
                ref={dropdownRef}
              >
                <div className="flex items-center justify-between mb-2.5 md:mb-2">
                  <label className="text-[13px] sm:text-[13.5px] md:text-[13.5px] font-semibold text-gray-700 block tracking-tight font-sans">
                    Choose your stay
                  </label>
                  {hotelError && (
                    <span className="text-[10.5px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-[4px]">
                      Required
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`w-full h-[58px] sm:h-[60px] md:h-[48px] lg:h-[50px] border-[1px] ${hotelError
                    ? "border-[#0E2E4E] bg-[#0E2E4E]/[0.03] ring-1 ring-[#0E2E4E]/20"
                    : "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-gray-50/80"
                    } rounded-[8px] px-4 sm:px-[16px] py-0 flex items-center justify-between gap-2 transition-all text-left cursor-pointer`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Building2 className={`w-5 h-5 ${hotelError ? "text-[#0E2E4E]" : "text-[#0E2E4E]/70"} shrink-0 stroke-[1.6]`} />

                    <span
                      className={`text-[14.5px] sm:text-[15px] md:text-[14px] lg:text-[14.5px] truncate ${selectedHotel ? "text-gray-900 font-medium" : "text-gray-400"
                        }`}
                    >
                      {selectedHotel
                        ? `${selectedHotel.name} (${selectedHotel.place})`
                        : "Select a location or Property"}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4.5 h-4.5 ${hotelError ? "text-[#0E2E4E]" : "text-[#0E2E4E]/70"} shrink-0 stroke-[1.6] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* ── Dropdown Menu ────────────────────────────────────────────── */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      data-prevent-hero-scroll="true"
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.14, ease: "easeOut" }}
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[8px] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.22)] border border-gray-100 py-1 z-50 overflow-hidden"
                    >
                      {/* Search Bar */}
                      <div className="px-2.5 pb-1.5 pt-1 border-b border-gray-100">
                        <div className="relative flex items-center">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search place or hotel..."
                            className="w-full h-8 pl-8.5 pr-7 text-[13px] sm:text-[13.5px] bg-gray-50 border border-gray-200 rounded-[5px] outline-none focus:bg-white focus:border-[#0E2E4E] transition-colors text-gray-800 placeholder-gray-400 font-sans"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === "Enter") {
                                e.preventDefault();
                              }
                            }}
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery("");
                                searchInputRef.current?.focus();
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Header Info */}
                      <div className="px-3 py-1 flex items-center justify-between text-[10.5px] sm:text-[11px] font-bold text-gray-500 bg-gray-50/70">
                        <span>Places & Hotels</span>

                      </div>

                      {/* Scrollable Hotels / Places List - Displays 3 properties on desktop, balance in scroll */}
                      <div
                        data-prevent-hero-scroll="true"
                        className="booking-dropdown-scrollbar max-h-[136px] overflow-y-auto overscroll-contain p-1 space-y-1"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        {filteredHotels.length === 0 ? (
                          <div className="py-3 px-2 text-center text-xs text-gray-400 font-sans">
                            No hotels found matching &ldquo;{searchQuery}&rdquo;
                          </div>
                        ) : (
                          filteredHotels.map((hotel) => {
                            const isSelected = selectedHotel?.id === hotel.id;

                            return (
                              <button
                                key={hotel.id}
                                type="button"
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setHotelError(null);
                                  setDropdownOpen(false);
                                  if (typeof window !== "undefined") {
                                    window.dispatchEvent(
                                      new CustomEvent("destination-filter-change", {
                                        detail: {
                                          destinationSlug: (hotel.slug || "").toLowerCase().trim(),
                                          destinationName: hotel.place || hotel.name,
                                          propertyName: hotel.name,
                                        },
                                      })
                                    );
                                  }
                                }}
                                className={`w-full h-[40px] shrink-0 px-2 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-[5px] cursor-pointer ${isSelected ? " bg-[#D2E6BC66] text-gray-900 font-semibold" : "text-gray-700"
                                  }`}
                              >
                                <div className="flex items-start gap-2 min-w-0 pr-2">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#0E2E4E]" />
                                  </div>
                                  <div className="flex flex-col min-w-0 leading-tight">
                                    <span className="text-[13px] sm:text-[13.5px] font-semibold text-gray-900 truncate leading-tight">
                                      {hotel.name}
                                    </span>
                                    <span className="text-[11px] sm:text-[11.5px] text-gray-500 truncate leading-tight mt-0.5">
                                      {hotel.place}
                                    </span>
                                  </div>
                                </div>

                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── 2. Check In & Out ─────────────────────────────────────────── */}
              <motion.div
                key={`date-field-${shakeCount}`}
                animate={dateError ? { x: [0, -4, 4, -2, 2, 0] } : {}}
                transition={{ duration: 0.25 }}
                className="relative w-full"
              >
                <div className="flex items-center justify-between mb-2.5 md:mb-2">
                  <label className="text-[13px] sm:text-[13.5px] md:text-[13.5px] font-semibold text-gray-700 block tracking-tight font-sans">
                    Check In & Out
                  </label>
                  {dateError && (
                    <span className="text-[10.5px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-[4px]">
                      Required
                    </span>
                  )}
                </div>

                <div
                  ref={dateBoxRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fpInstance.current) {
                      if (fpInstance.current.isOpen) {
                        fpInstance.current.close();
                      } else {
                        fpInstance.current.open();
                        dateInputRef.current?.blur();
                      }
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className={`w-full h-[58px] sm:h-[60px] md:h-[48px] lg:h-[50px] border-[1px] ${dateError
                    ? "border-[#0E2E4E] bg-[#0E2E4E]/[0.03] ring-1 ring-[#0E2E4E]/20"
                    : "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-gray-50/80"
                    } rounded-[8px] px-4 sm:px-[16px] flex items-center gap-3 transition-all cursor-pointer select-none`}
                >
                  <Calendar className={`w-5 h-5 ${dateError ? "text-[#0E2E4E]" : "text-[#0E2E4E]/70"} shrink-0 stroke-[1.6] pointer-events-none`} />

                  <div className="w-full text-[14.5px] sm:text-[15px] md:text-[14px] lg:text-[14.5px] truncate font-sans pointer-events-none select-none">
                    {checkin && checkout ? (
                      <span className="text-gray-900 font-medium">
                        {formatDateDisplay(checkin)} - {formatDateDisplay(checkout)}
                      </span>
                    ) : checkin ? (
                      <>
                        <span className="text-gray-900 font-medium">
                          {formatDateDisplay(checkin)} -{" "}
                        </span>
                        <span className="text-gray-400 font-normal">
                          Select Check-out
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 font-normal">
                        Select check-in & check-out
                      </span>
                    )}
                  </div>

                  <input
                    ref={dateInputRef}
                    type="text"
                    readOnly
                    inputMode="none"
                    tabIndex={-1}
                    autoComplete="off"
                    value={dateDisplay}
                    onFocus={(e) => e.target.blur()}
                    className="sr-only pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </motion.div>

              {/* ── 3. Check Availability CTA ─────────────────────────────────── */}
              <div className="w-full md:w-auto">
                <label className="hidden lg:block text-[12.5px] md:text-[13.5px] font-semibold opacity-0 select-none mb-2 font-sans pointer-events-none">
                  &nbsp;
                </label>
                <button
                  type="submit"
                  className="
                    w-full md:w-[236px]
                    h-[58px] sm:h-[60px] md:h-[48px] lg:h-[50px]
                    bg-[#0E2E4E]
                    hover:bg-[#143d66]
                    text-white
                    text-[15px] sm:text-[15.5px] md:text-[14px] lg:text-[14.5px]
                    font-semibold
                    rounded-[8px]
                    px-4 sm:px-[32px]
                    py-2 sm:py-[12px]
                    flex items-center justify-center
                    gap-[8px]
                    whitespace-nowrap
                    shadow-md
                    transition-colors
                    duration-200
                    cursor-pointer
                  "
                >
                  Check Availability
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Custom brand styling ───────────────────────────────────────────────────
const STYLES = `
  .booking-dropdown-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f8fafc;
  }
  .booking-dropdown-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .booking-dropdown-scrollbar::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 8px;
    margin: 4px 0;
  }
  .booking-dropdown-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 8px;
  }
  .booking-dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .flatpickr-calendar {
    border-radius: 8px !important;
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.22), 0 10px 24px -5px rgba(0,0,0,0.08) !important;
    border: 1px solid rgba(0,0,0,0.08) !important;
    font-family: var(--font-inter), system-ui, sans-serif !important;
    padding: 6px 8px !important;
    box-sizing: border-box !important;
    z-index: 99999 !important;
  }
  .flatpickr-calendar:before,
  .flatpickr-calendar:after,
  .flatpickr-calendar.arrowTop:before,
  .flatpickr-calendar.arrowTop:after,
  .flatpickr-calendar.arrowBottom:before,
  .flatpickr-calendar.arrowBottom:after { 
    display: none !important; 
  }

  .flatpickr-innerContainer,
  .flatpickr-rContainer,
  .flatpickr-days,
  .dayContainer {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .dayContainer {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    justify-items: center !important;
    align-items: center !important;
  }

  .flatpickr-months {
    background: transparent !important;
    margin-bottom: 2px !important;
    width: 100% !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 30px !important;
  }
  .flatpickr-month {
    height: 100% !important;
    color: #0d1b2e !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .flatpickr-current-month {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #0d1b2e !important;
    padding: 0 !important;
    margin: 0 auto !important;
    position: static !important;
    width: auto !important;
    left: auto !important;
    right: auto !important;
    height: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    transform: none !important;
    pointer-events: auto !important;
  }
  .flatpickr-current-month .flatpickr-monthDropdown-months {
    color: #0d1b2e !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    cursor: pointer !important;
    width: auto !important;
    display: inline-block !important;
  }
  .flatpickr-current-month .flatpickr-monthDropdown-months::-ms-expand {
    display: none !important;
  }
  .flatpickr-current-month .numInputWrapper {
    width: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .flatpickr-current-month .numInputWrapper span.arrowUp,
  .flatpickr-current-month .numInputWrapper span.arrowDown,
  .flatpickr-current-month .numInputWrapper span {
    display: none !important;
  }
  .flatpickr-current-month input.cur-year {
    color: #0d1b2e !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    -webkit-appearance: none !important;
    -moz-appearance: textfield !important;
    appearance: textfield !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 4.2ch !important;
    text-align: left !important;
  }
  .flatpickr-current-month input.cur-year::-webkit-inner-spin-button,
  .flatpickr-current-month input.cur-year::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
    display: none !important;
  }

  .flatpickr-prev-month, .flatpickr-next-month {
    position: absolute !important;
    top: 4px !important;
    height: 24px !important;
    width: 24px !important;
    fill: #0d1b2e !important;
    color: #0d1b2e !important;
    padding: 2px !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 10 !important;
    cursor: pointer !important;
  }
  .flatpickr-prev-month {
    left: 8px !important;
  }
  .flatpickr-next-month {
    right: 8px !important;
  }
  .flatpickr-prev-month svg,
  .flatpickr-next-month svg {
    width: 12px !important;
    height: 12px !important;
    vertical-align: middle !important;
  }
  .flatpickr-prev-month:hover, .flatpickr-next-month:hover {
    background: #f1f5f9 !important;
  }

  .flatpickr-weekdays {
    background: transparent !important;
    margin-bottom: 2px !important;
    width: 100% !important;
    display: flex !important;
  }
  .flatpickr-weekdaycontainer {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    justify-items: center !important;
  }
  .flatpickr-weekday {
    color: #94a3b8 !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    width: 100% !important;
    text-align: center !important;
  }

  .flatpickr-day {
    font-size: 11.5px !important;
    font-weight: 500 !important;
    border-radius: 6px !important;
    color: #1e293b !important;
    height: 26px !important;
    width: 26px !important;
    max-width: 26px !important;
    line-height: 26px !important;
    margin: 0.5px 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
  }
  @media (max-width: 640px) {
    .flatpickr-day {
      height: 24px !important;
      width: 24px !important;
      max-width: 24px !important;
      line-height: 24px !important;
      font-size: 11px !important;
    }
  }
  .flatpickr-day:hover {
    background: #f1f5f9 !important;
    color: #0d1b2e !important;
  }
  .flatpickr-day.prevMonthDay {
    visibility: hidden !important;
    pointer-events: none !important;
    cursor: default !important;
  }
  .flatpickr-day.nextMonthDay {
    visibility: visible !important;
    color: #94a3b8 !important;
    opacity: 0.8 !important;
    cursor: pointer !important;
  }
  .flatpickr-day.nextMonthDay:hover {
    background: #f1f5f9 !important;
    color: #0d1b2e !important;
  }
  .flatpickr-day.flatpickr-disabled,
  .flatpickr-day.flatpickr-disabled:hover,
  .flatpickr-day.disabled,
  .flatpickr-day.disabled:hover {
    color: #94a3b8 !important;
    background: transparent !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
    opacity: 0.8 !important;
  }
  .flatpickr-day.selected,
  .flatpickr-day.startRange,
  .flatpickr-day.endRange {
    background: #0d1b2e !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    border-color: #0d1b2e !important;
  }
  .flatpickr-day.inRange {
    background: #e2e8f0 !important;
    color: #0d1b2e !important;
    box-shadow: -10px 0 0 #e2e8f0, 10px 0 0 #e2e8f0 !important;
    border-color: transparent !important;
  }
  .flatpickr-day.startRange:not(.endRange) {
    box-shadow: 10px 0 0 #e2e8f0 !important;
  }
  .flatpickr-day.endRange:not(.startRange) {
    box-shadow: -10px 0 0 #e2e8f0 !important;
  }
  .flatpickr-day.today {
    border: 1.5px solid #0d1b2e !important;
  }
`;




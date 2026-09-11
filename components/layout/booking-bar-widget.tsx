"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Calendar,
  ChevronDown,
  Check,
  Search,
  X,
  MapPin,
  Info,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface HotelPlaceItem {
  id: string;
  name: string; // e.g. "Kattil Chennai"
  place: string; // e.g. "Chennai"
  state: string; // e.g. "Tamil Nadu"
  slug: string;
  hotelValue: string;
  hotelCount?: string;
}

interface FpInstance {
  destroy: () => void;
  close: () => void;
  open: () => void;
  setDate: (d: (Date | string)[] | Date | string, triggerChange?: boolean) => void;
  set: (opt: string, val: unknown) => void;
  selectedDates: Date[];
}

declare global {
  interface Window {
    flatpickr?: (el: HTMLElement, opts: Record<string, unknown>) => FpInstance;
  }
}

// Default fallback list of places & hotels
const DEFAULT_HOTEL_PLACES: HotelPlaceItem[] = [
  {
    id: "dest-chennai",
    name: "Kattil Chennai",
    place: "Chennai",
    state: "Tamil Nadu",
    slug: "chennai",
    hotelValue: "kattilchennai",
  },
  {
    id: "dest-madurai",
    name: "Kattil Madurai",
    place: "Madurai",
    state: "Tamil Nadu",
    slug: "madurai",
    hotelValue: "kattil",
  },
  {
    id: "dest-coimbatore",
    name: "Kattil Coimbatore",
    place: "Coimbatore",
    state: "Tamil Nadu",
    slug: "coimbatore",
    hotelValue: "kattilcoimbatore",
  },
  {
    id: "dest-colachel",
    name: "Kattil Colachel",
    place: "Colachel",
    state: "Tamil Nadu",
    slug: "colachel",
    hotelValue: "kattilcolachel",
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
  if (s === "chennai") return "kattilchennai";
  if (s === "madurai") return "kattil";
  if (s === "coimbatore") return "kattilcoimbatore";
  if (s === "colachel") return "kattilcolachel";
  if (s === "kanniyakumari") return "kattilkanniyakumari";
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
        (destLower &&
          (h.slug.toLowerCase() === destLower ||
            h.place.toLowerCase() === destLower ||
            destLower.includes(h.slug.toLowerCase()) ||
            destLower.includes(h.place.toLowerCase()))) ||
        (propLower &&
          (h.name.toLowerCase().includes(propLower) || propLower.includes(h.name.toLowerCase())))
      );
    });
    if (match) return match;
    if (destLower) {
      const placeName = destLower.charAt(0).toUpperCase() + destLower.slice(1);
      return {
        id: `dest-${destLower}`,
        name: `Kattil ${placeName}`,
        place: placeName,
        state: "Tamil Nadu",
        slug: destLower,
        hotelValue: getHotelValueForSlug(destLower),
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

  const dateInputRef = useRef<HTMLInputElement>(null);
  const dateBoxRef = useRef<HTMLDivElement>(null);
  const fpInstance = useRef<FpInstance | null>(null);
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
        (destLower &&
          (h.slug.toLowerCase() === destLower ||
            h.place.toLowerCase() === destLower ||
            destLower.includes(h.slug.toLowerCase()) ||
            destLower.includes(h.place.toLowerCase()))) ||
        (propLower &&
          (h.name.toLowerCase().includes(propLower) || propLower.includes(h.name.toLowerCase())))
      );
    });

    if (match) {
      setSelectedHotel(match);
      setHotelError(null);
    } else if (destLower) {
      const placeName = destLower.charAt(0).toUpperCase() + destLower.slice(1);
      setSelectedHotel({
        id: `dest-${destLower}`,
        name: `Kattil ${placeName}`,
        place: placeName,
        state: "Tamil Nadu",
        slug: destLower,
        hotelValue: getHotelValueForSlug(destLower),
      });
      setHotelError(null);
    }
  }, [initialDestination, initialProperty, hotelsList]);

  // Dynamically load active destinations/hotels from database API
  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        const res = await fetch("/api/destinations")
          .then((r) => r.json())
          .catch(() => ({ success: false }));

        if (!isMounted) return;

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const items: HotelPlaceItem[] = res.data.map((d: any) => {
            const placeName = d.name || "Destination";
            const slug = d.slug || placeName.toLowerCase();
            const hotelVal = getHotelValueForSlug(slug);

            return {
              id: `dest-${d._id || slug}`,
              name: `Kattil ${placeName}`,
              place: placeName,
              state: "Tamil Nadu",
              slug: slug,
              hotelValue: hotelVal,
              hotelCount: d.hotelCount,
            };
          });

          setHotelsList(items);

          // Auto-match if initial destination is provided
          if (initialDestination || initialProperty) {
            const destLower = (initialDestination || "").toLowerCase().trim();
            const propLower = (initialProperty || "").toLowerCase().trim();
            const matched = items.find((h) => {
              return (
                (destLower &&
                  (h.slug.toLowerCase() === destLower ||
                    h.place.toLowerCase() === destLower ||
                    destLower.includes(h.slug.toLowerCase()) ||
                    destLower.includes(h.place.toLowerCase()))) ||
                (propLower &&
                  (h.name.toLowerCase().includes(propLower) ||
                    propLower.includes(h.name.toLowerCase())))
              );
            });
            if (matched) {
              setSelectedHotel(matched);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load destinations:", err);
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
          onChange(dates: Date[]) {
            if (dates.length === 2) {
              const d1 = new Date(dates[0]);
              d1.setHours(0, 0, 0, 0);
              const d2 = new Date(dates[1]);
              d2.setHours(0, 0, 0, 0);
              setCheckin(d1);
              setCheckout(d2);
              setDateDisplay(`${formatDateDisplay(d1)} - ${formatDateDisplay(d2)}`);
              setDateError(null);
            } else if (dates.length === 1) {
              const d1 = new Date(dates[0]);
              d1.setHours(0, 0, 0, 0);
              setCheckin(d1);
              setCheckout(null);
              setDateDisplay(`${formatDateDisplay(d1)} - ...`);
            } else {
              setCheckin(null);
              setCheckout(null);
              setDateDisplay("");
            }
          },
        });

        window.addEventListener("scroll", closeFlatpickr, { passive: true });
        window.addEventListener("resize", () => {
          if (fpInstance.current) repositionCalendar(fpInstance.current);
        });
      } catch (e) {
        console.error("[BookingWidget]", e);
      }
    })();

    return () => {
      alive = false;
      window.removeEventListener("scroll", closeFlatpickr);
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
      return;
    }

    const targetHotel = selectedHotel!.hotelValue;
    const ci = checkin!;
    const co = checkout!;

    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    form.action = `https://live.ipms247.com/booking/book-rooms-${targetHotel}`;

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
                    <span className="text-[10.5px] font-medium text-[#0E2E4E] bg-[#0E2E4E]/10 px-1.5 py-0.5 rounded-[4px]">
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
                    className={`w-4.5 h-4.5 text-gray-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Required Guidance Message */}
                <AnimatePresence>
                  {hotelError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-[11.5px] sm:text-xs text-[#0E2E4E] mt-1.5 font-medium flex items-center gap-1.5 font-sans"
                    >
                      <Info className="w-3.5 h-3.5 shrink-0 text-[#0E2E4E]" />
                      <span>{hotelError}</span>
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* ── Dropdown Menu ────────────────────────────────────────────── */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      data-prevent-hero-scroll="true"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-1.5 sm:mt-2 bg-white rounded-[8px] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.22)] border border-gray-100 py-1 z-50 overflow-hidden"
                    >
                      {/* Search Bar */}
                      <div className="px-2 pb-1 pt-0.5 border-b border-gray-100">
                        <div className="relative flex items-center">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search place or hotel..."
                            className="w-full h-7.5 pl-8 pr-7 text-[12px] sm:text-[12.5px] bg-gray-50 border border-gray-200 rounded-[5px] outline-none focus:bg-white focus:border-[#0E2E4E] transition-colors text-gray-800 placeholder-gray-400 font-sans"
                            onClick={(e) => e.stopPropagation()}
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
                      <div className="px-2.5 py-0.5 flex items-center justify-between text-[9.5px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <span>Places & Hotels</span>
                        <span className="text-[9px] text-gray-400 font-medium lowercase">
                          {filteredHotels.length} {filteredHotels.length === 1 ? "location" : "locations"}
                        </span>
                      </div>

                      {/* Scrollable Hotels / Places List - Fixed height capping to avoid growing with more properties */}
                      <div
                        data-prevent-hero-scroll="true"
                        className="booking-dropdown-scrollbar max-h-[148px] overflow-y-auto overscroll-contain px-1 py-0.5 space-y-0.5"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        {filteredHotels.length === 0 ? (
                          <div className="py-3 px-3 text-center text-xs text-gray-400 font-sans">
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
                                className={`w-full px-2 py-1 flex items-center justify-between text-left hover:bg-gray-50 transition-all rounded-[5px] cursor-pointer ${isSelected ? "bg-emerald-50 text-gray-900 font-semibold" : "text-gray-700"
                                  }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                                  <div className="w-5.5 h-5.5 rounded-[4px] bg-[#0E2E4E]/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-2.5 h-2.5 text-[#0E2E4E]" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[12px] sm:text-[12.5px] font-medium text-gray-900 truncate leading-tight">
                                      {hotel.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate leading-none mt-0.5">
                                      {hotel.place}, {hotel.state}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
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
                animate={dateError ? { x: [0, -4, 4, -2, 2, 0] } : {}}
                transition={{ duration: 0.25 }}
                className="relative w-full"
              >
                <div className="flex items-center justify-between mb-2.5 md:mb-2">
                  <label className="text-[13px] sm:text-[13.5px] md:text-[13.5px] font-semibold text-gray-700 block tracking-tight font-sans">
                    Check In & Out
                  </label>
                  {dateError && (
                    <span className="text-[10.5px] font-medium text-[#0E2E4E] bg-[#0E2E4E]/10 px-1.5 py-0.5 rounded-[4px]">
                      Required
                    </span>
                  )}
                </div>

                <div
                  ref={dateBoxRef}
                  onClick={() => {
                    fpInstance.current?.open();
                    dateInputRef.current?.blur();
                  }}
                  className={`w-full h-[58px] sm:h-[60px] md:h-[48px] lg:h-[50px] border-[1px] ${dateError
                    ? "border-[#0E2E4E] bg-[#0E2E4E]/[0.03] ring-1 ring-[#0E2E4E]/20"
                    : "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-gray-50/80"
                    } rounded-[8px] px-4 sm:px-[16px] flex items-center gap-3 transition-all cursor-pointer select-none`}
                >
                  <Calendar className={`w-5 h-5 ${dateError ? "text-[#0E2E4E]" : "text-gray-400"} shrink-0 stroke-[1.6] pointer-events-none`} />

                  <input
                    ref={dateInputRef}
                    type="text"
                    readOnly
                    inputMode="none"
                    tabIndex={-1}
                    autoComplete="off"
                    value={dateDisplay}
                    onFocus={(e) => e.target.blur()}
                    placeholder="Select check-in & check-out"
                    className="w-full bg-transparent text-[14.5px] sm:text-[15px] md:text-[14px] lg:text-[14.5px] text-gray-900 font-medium outline-none cursor-pointer placeholder:text-gray-400 font-sans truncate pointer-events-none select-none"
                  />
                </div>

                {/* Required Guidance Message */}
                <AnimatePresence>
                  {dateError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-[11.5px] sm:text-xs text-[#0E2E4E] mt-1.5 font-medium flex items-center gap-1.5 font-sans"
                    >
                      <Info className="w-3.5 h-3.5 shrink-0 text-[#0E2E4E]" />
                      <span>{dateError}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── 3. Check Availability CTA ─────────────────────────────────── */}
              <div className="w-full md:w-auto">
                <label className="hidden lg:block text-[12.5px] md:text-[13.5px] font-semibold opacity-0 select-none mb-2 font-sans pointer-events-none">
                  &nbsp;
                </label>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16 }}
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
                    transition-all
                    cursor-pointer
                  "
                >
                  Check Availability
                </motion.button>
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
  }
  .flatpickr-month {
    height: 28px !important;
    color: #0d1b2e !important;
  }

  .flatpickr-current-month {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #0d1b2e !important;
    padding-top: 0px !important;
  }
  .flatpickr-current-month .flatpickr-monthDropdown-months,
  .flatpickr-current-month input.cur-year {
    color: #0d1b2e !important;
    font-weight: 700 !important;
  }

  .flatpickr-prev-month, .flatpickr-next-month {
    fill: #0d1b2e !important;
    color: #0d1b2e !important;
    padding: 2px 4px !important;
    border-radius: 4px !important;
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
    box-shadow: -5px 0 0 #e2e8f0, 5px 0 0 #e2e8f0 !important;
  }
  .flatpickr-day.today {
    border: 1.5px solid #0d1b2e !important;
  }
  .flatpickr-day.disabled,
  .flatpickr-day.prevMonthDay,
  .flatpickr-day.nextMonthDay {
    color: #cbd5e1 !important;
  }
`;




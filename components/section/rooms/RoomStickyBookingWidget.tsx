"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  MapPin,
  Check,
} from "lucide-react";

export interface HotelOption {
  id: string;
  name: string;
  place: string;
  state?: string;
  slug: string;
  hotelValue: string;
}

const DEFAULT_HOTEL_OPTIONS: HotelOption[] = [
  {
    id: "dest-chennai",
    name: "Kattil Executive",
    place: "Chennai",
    state: "Tamil Nadu",
    slug: "chennai",
    hotelValue: "kattilchennai",
  },
  {
    id: "dest-madurai",
    name: "Kattil The Sparrow",
    place: "Madurai",
    state: "Tamil Nadu",
    slug: "madurai",
    hotelValue: "kattil",
  },
  {
    id: "dest-coimbatore",
    name: "Kattil Stay",
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
  {
    id: "dest-kanniyakumari",
    name: "Kattil The Sparrow",
    place: "Kanniyakumari",
    state: "Tamil Nadu",
    slug: "kanniyakumari",
    hotelValue: "kattil",
  },
];

function formatDateForDisplay(d: Date | null): string {
  if (!d) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function getHotelValueForSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (s === "chennai") return "kattilchennai";
  if (s === "madurai") return "kattil";
  if (s === "coimbatore") return "kattilcoimbatore";
  if (s === "colachel") return "kattilcolachel";
  if (s === "kanniyakumari" || s.includes("sparrow")) return "kattil";
  return `kattil${s}`;
}

interface RoomStickyBookingWidgetProps {
  initialDestinationName?: string;
  initialPropertyName?: string;
  initialDestinationSlug?: string;
  lockedDestination?: boolean;
}

export default function RoomStickyBookingWidget({
  initialDestinationName = "Kanniyakumari",
  initialPropertyName = "Kattil The Sparrow",
  initialDestinationSlug = "kanniyakumari",
  lockedDestination = true,
}: RoomStickyBookingWidgetProps) {
  // Resolve initial hotel based on page parameters
  const initialHotel = useMemo<HotelOption>(() => {
    const slugLower = (initialDestinationSlug || "").toLowerCase().trim();
    const nameLower = (initialDestinationName || "").toLowerCase().trim();
    const propLower = (initialPropertyName || "").toLowerCase().trim();

    const slugMatch = DEFAULT_HOTEL_OPTIONS.find(
      (h) =>
        (slugLower && (h.slug.toLowerCase() === slugLower || slugLower.includes(h.slug.toLowerCase()) || h.slug.toLowerCase().includes(slugLower))) ||
        (nameLower && (h.place.toLowerCase() === nameLower || nameLower.includes(h.place.toLowerCase()) || h.place.toLowerCase().includes(nameLower))) ||
        (propLower && (h.name.toLowerCase() === propLower || propLower.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(propLower)))
    );
    if (slugMatch) return slugMatch;
    return {
      id: `dest-${initialDestinationSlug}`,
      name: initialPropertyName,
      place: initialDestinationName,
      slug: initialDestinationSlug,
      hotelValue: getHotelValueForSlug(initialDestinationSlug),
    };
  }, [initialDestinationName, initialPropertyName, initialDestinationSlug]);

  const [selectedHotel, setSelectedHotel] = useState<HotelOption>(initialHotel);
  const [hotelsList, setHotelsList] = useState<HotelOption[]>(DEFAULT_HOTEL_OPTIONS);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dates (default tomorrow and day after tomorrow)
  const [checkin, setCheckin] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [checkout, setCheckout] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [dateError, setDateError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateInputHiddenRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<any>(null);

  // Fetch live active destinations from database API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: HotelOption[] = res.data.map((d: any) => {
            const place = d.name || "Destination";
            const slug = d.slug || place.toLowerCase();
            return {
              id: `dest-${d._id || slug}`,
              name: `Kattil ${place}`,
              place,
              state: "Tamil Nadu",
              slug,
              hotelValue: getHotelValueForSlug(slug),
            };
          });
          setHotelsList(mapped);

          // If current selectedHotel matches one from DB, sync it
          const matched = mapped.find(
            (m) =>
              (initialDestinationSlug && m.slug.toLowerCase() === initialDestinationSlug.toLowerCase()) ||
              (initialDestinationName && m.place.toLowerCase() === initialDestinationName.toLowerCase())
          );
          if (matched) {
            setSelectedHotel(matched);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [initialDestinationSlug, initialDestinationName]);

  // Sync initialHotel when props change (e.g. navigating to different destination)
  useEffect(() => {
    setSelectedHotel(initialHotel);
  }, [initialHotel]);

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

  // Initialize Flatpickr range picker
  useEffect(() => {
    let alive = true;

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
        if (!alive || !window.flatpickr || !dateInputHiddenRef.current) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        fpRef.current = window.flatpickr(dateInputHiddenRef.current, {
          mode: "range",
          dateFormat: "d-m-Y",
          minDate: today,
          defaultDate: [checkin, checkout],
          disableMobile: true,
          position: "below left",
          onChange(dates: Date[]) {
            if (dates.length === 2) {
              const d1 = new Date(dates[0]);
              d1.setHours(0, 0, 0, 0);
              const d2 = new Date(dates[1]);
              d2.setHours(0, 0, 0, 0);
              setCheckin(d1);
              setCheckout(d2);
              setDateError(null);
            } else if (dates.length === 1) {
              const d1 = new Date(dates[0]);
              d1.setHours(0, 0, 0, 0);
              setCheckin(d1);
            }
          },
        });
      } catch (e) {
        console.warn("[RoomStickyBookingWidget] Flatpickr error:", e);
      }
    })();

    return () => {
      alive = false;
      fpRef.current?.destroy();
    };
  }, []);

  const openCalendar = () => {
    fpRef.current?.open();
  };

  // Submit to IPMS247 booking engine
  const handleCheckAvailability = () => {
    if (!checkin || !checkout) {
      setDateError("Please select check-in and check-out dates");
      openCalendar();
      return;
    }

    setDateError(null);
    const targetHotel = selectedHotel.hotelValue || "kattil";

    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    form.action = `https://live.ipms247.com/booking/book-rooms-${targetHotel}`;

    const fields: Record<string, string> = {
      eZ_chkin: formatDateForDisplay(checkin),
      eZ_chkout: formatDateForDisplay(checkout),
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
  };

  return (
    <div className="sticky top-28 md:top-32 bg-white rounded-2xl p-6 md:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="space-y-4">
        {/* Hidden Flatpickr range input */}
        <input ref={dateInputHiddenRef} type="text" className="sr-only pointer-events-none" />

        {/* Location Dropdown (Clean, No Search, Instant Selection) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Location
          </label>

          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full h-11 px-3.5 pr-9 rounded-xl border border-gray-200 bg-gray-50/70 text-[13.5px] font-medium text-gray-800 flex items-center justify-between text-left transition-colors hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-[#0d1b2e] cursor-pointer"
          >
            <span className="truncate">
              {selectedHotel.place}, {selectedHotel.name}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Animated Dropdown Menu without search bar */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden p-2"
              >
                {/* List of Destinations & Hotels */}
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {(lockedDestination
                    ? hotelsList.filter(
                        (h) =>
                          h.id === selectedHotel.id ||
                          h.slug.toLowerCase() === selectedHotel.slug.toLowerCase() ||
                          h.place.toLowerCase() === selectedHotel.place.toLowerCase() ||
                          (initialDestinationSlug &&
                            h.slug.toLowerCase() === initialDestinationSlug.toLowerCase())
                      )
                    : hotelsList
                  ).length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-500">
                      {selectedHotel.place}, {selectedHotel.name}
                    </div>
                  ) : (
                    (lockedDestination
                      ? hotelsList.filter(
                          (h) =>
                            h.id === selectedHotel.id ||
                            h.slug.toLowerCase() === selectedHotel.slug.toLowerCase() ||
                            h.place.toLowerCase() === selectedHotel.place.toLowerCase() ||
                            (initialDestinationSlug &&
                              h.slug.toLowerCase() === initialDestinationSlug.toLowerCase())
                        )
                      : hotelsList
                    ).map((h) => {
                      const isSelected =
                        h.id === selectedHotel.id ||
                        h.place.toLowerCase() === selectedHotel.place.toLowerCase();

                      return (
                        <button
                          key={h.id || h.slug}
                          type="button"
                          onClick={() => {
                            setSelectedHotel(h);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#edf5e4] text-[#2d3f27] font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <MapPin
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? "text-[#526442]" : "text-gray-400"
                              }`}
                            />
                            <span className="truncate">
                              <span className="font-semibold text-gray-900">{h.place}</span>
                              <span className="text-gray-500 font-normal">, {h.name}</span>
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#526442] shrink-0 stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Check In Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Check In
          </label>
          <div
            onClick={openCalendar}
            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/70 text-[13.5px] font-medium text-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-100/70 transition-colors"
          >
            <span>{formatDateForDisplay(checkin) || "Select Date"}</span>
            <Calendar className="w-4 h-4 text-gray-700" />
          </div>
        </div>

        {/* Check Out Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Check Out
          </label>
          <div
            onClick={openCalendar}
            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/70 text-[13.5px] font-medium text-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-100/70 transition-colors"
          >
            <span>{formatDateForDisplay(checkout) || "Select Date"}</span>
            <Calendar className="w-4 h-4 text-gray-700" />
          </div>
        </div>

        {/* Error message */}
        {dateError && (
          <p className="text-[12px] text-red-500 font-medium">{dateError}</p>
        )}

        {/* Check Availability CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCheckAvailability}
            className="w-full py-3.5 rounded-xl bg-[#0d1b2e] hover:bg-[#162840] text-white font-semibold text-[14px] shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center"
          >
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}

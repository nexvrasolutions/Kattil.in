"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
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

  // Dates (empty by default)
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState<string>("");

  const [dateError, setDateError] = useState<string | null>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateBoxRef = useRef<HTMLDivElement>(null);
  const mobileDateBoxRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<any>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor footer visibility to unfix/hide mobile floating bar at the footer
  useEffect(() => {
    const footerEl = document.querySelector("footer");
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.05,
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

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
      .catch(() => { });

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

    function repositionCalendar(instance: any) {
      if (!instance?.calendarContainer) return;
      const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

      if (isMobile) {
        const mobileBox = mobileDateBoxRef.current;
        const rect = mobileBox ? mobileBox.getBoundingClientRect() : null;
        const distFromBottom = rect
          ? Math.round(window.innerHeight - rect.top + 2)
          : 138;
        instance.calendarContainer.style.position = "fixed";
        instance.calendarContainer.style.bottom = `${distFromBottom}px`;
        instance.calendarContainer.style.top = "auto";
        if (rect) {
          instance.calendarContainer.style.left = `${rect.left}px`;
          instance.calendarContainer.style.right = "auto";
          instance.calendarContainer.style.transform = "none";
          instance.calendarContainer.style.width = `${rect.width}px`;
          instance.calendarContainer.style.minWidth = `${rect.width}px`;
          instance.calendarContainer.style.maxWidth = `${rect.width}px`;
        } else {
          instance.calendarContainer.style.left = "50%";
          instance.calendarContainer.style.right = "auto";
          instance.calendarContainer.style.transform = "translateX(-50%)";
          instance.calendarContainer.style.width = "calc(100vw - 20px)";
          instance.calendarContainer.style.maxWidth = "512px";
        }
        instance.calendarContainer.style.boxSizing = "border-box";
        instance.calendarContainer.style.zIndex = "999999";
        instance.calendarContainer.classList.remove("arrowTop");
        instance.calendarContainer.classList.add("arrowBottom");
      } else {
        const box = dateBoxRef.current;
        if (!box) return;
        const rect = box.getBoundingClientRect();
        instance.calendarContainer.style.position = "absolute";
        instance.calendarContainer.style.top = `${rect.bottom + window.scrollY + 6}px`;
        instance.calendarContainer.style.left = `${rect.left + window.scrollX}px`;
        instance.calendarContainer.style.width = `${rect.width}px`;
        instance.calendarContainer.style.minWidth = `${rect.width}px`;
        instance.calendarContainer.style.maxWidth = `${rect.width}px`;
        instance.calendarContainer.style.transform = "none";
        instance.calendarContainer.style.boxSizing = "border-box";
        instance.calendarContainer.style.bottom = "auto";
        instance.calendarContainer.style.right = "auto";
        instance.calendarContainer.style.zIndex = "99999";
        instance.calendarContainer.classList.remove("arrowBottom");
        instance.calendarContainer.classList.add("arrowTop");
      }
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

        fpRef.current = window.flatpickr(dateInputRef.current, {
          mode: "range",
          dateFormat: "d M Y",
          minDate: today,
          disableMobile: true,
          allowInput: false,
          clickOpens: true,
          closeOnSelect: false,
          position: "below left",
          positionElement: dateBoxRef.current || mobileDateBoxRef.current || dateInputRef.current,
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
      } catch (e) {
        console.warn("[RoomStickyBookingWidget] Flatpickr error:", e);
      }
    })();

    const handleScrollOrResize = () => {
      if (fpRef.current?.isOpen) {
        repositionCalendar(fpRef.current);
      }
    };
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      alive = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
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
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Hidden input for Flatpickr instance (accessible on both desktop and mobile) */}
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

      {/* ── Desktop Sticky Sidebar Widget (Hidden on mobile <lg, visible on lg+) ── */}
      <div className="hidden lg:block sticky top-40 lg:top-40 bg-white rounded-[8px] p-6 md:p-7 border border-gray-100">
        <div className="space-y-4">
          {/* Location Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans">
              Location
            </label>

            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-full h-11 px-3.5 pr-9 rounded-[8px] border border-gray-200 bg-gray-50/70 text-[13.5px] font-medium text-gray-800 flex items-center justify-between text-left transition-colors hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-[#0d1b2e] cursor-pointer font-sans"
            >
              <span className="truncate">
                {selectedHotel.place}, {selectedHotel.name}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Animated Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-[8px] border border-gray-200 shadow-xl overflow-hidden p-1"
                >
                  {/* List of Destinations & Hotels */}
                  <div className="max-h-[260px] overflow-y-auto space-y-0.5">
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
                      <div className="px-2.5 py-1.5 text-xs text-gray-500">
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
                            className={`w-full px-2 py-1 rounded-[6px] text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected
                              ? "bg-[#edf5e4] text-[#2d3f27] font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <MapPin
                                className={`w-3 h-3 shrink-0 ${isSelected ? "text-[#526442]" : "text-gray-400"
                                  }`}
                              />
                              <span className="truncate text-[12px]">
                                <span className="font-semibold text-gray-900">{h.place}</span>
                                <span className="text-gray-500 font-normal">, {h.name}</span>
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#526442] shrink-0 stroke-[2.5]" />
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

          {/* Check In & Out */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans">
              Check In & Out
            </label>
            <div
              ref={dateBoxRef}
              onClick={() => {
                openCalendar();
              }}
              className={`w-full h-[44px] px-3.5 sm:px-[32px] rounded-[6px] border ${dateError
                ? "border-red-400 bg-red-50/50 ring-1 ring-red-400/20"
                : "border-gray-200 bg-gray-50/70 hover:bg-gray-100/70"
                } text-[13.5px] font-medium text-gray-800 flex items-center justify-between cursor-pointer transition-colors select-none`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none">
                <Calendar
                  className={`w-4 h-4 ${dateError ? "text-red-500" : "text-gray-500"} shrink-0`}
                />
                <span className={`w-full bg-transparent text-[13.5px] font-medium truncate font-sans ${dateDisplay ? "text-gray-900" : "text-gray-400"}`}>
                  {dateDisplay || "Select check-in & check-out"}
                </span>
              </div>
            </div>
          </div>

          {/* Error message */}
          {dateError && (
            <p className="text-[12px] text-red-500 font-medium font-sans">{dateError}</p>
          )}

          {/* Check Availability CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCheckAvailability}
              className="w-full h-[44px] px-3.5 sm:px-[32px] rounded-[6px] bg-[#0d1b2e] hover:bg-[#162840] text-white font-semibold text-[14px] shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center font-sans"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Responsive Floating Popup Card with 8px Curves (Hidden on desktop, fixed while scrolling, unfixes/hides at footer) ── */}
      <div
        className={`lg:hidden fixed bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3.5 z-40 max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-[8px] p-2.5 sm:p-3 border border-gray-200/90 shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300 ease-out ${isFooterVisible
          ? "opacity-0 translate-y-12 pointer-events-none"
          : "opacity-100 translate-y-0"
          }`}
      >
        <div className="w-full">
          {/* Top Date Selection Card matching user mockup */}
          <div
            ref={mobileDateBoxRef}
            onClick={() => {
              openCalendar();
            }}
            className={`w-full h-[58px] sm:h-[60px] px-4 sm:px-[32px] bg-white border ${dateError
              ? "border-red-400 ring-1 ring-red-400/30"
              : "border-[#d8e0ea] hover:border-gray-400"
              } rounded-[8px] flex items-center justify-between cursor-pointer transition-colors shadow-2xs select-none`}
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <Calendar
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${dateError ? "text-red-500" : "text-[#0d1b2e]"
                  } shrink-0 stroke-[1.6]`}
              />
              <div className="flex flex-col text-left justify-center min-w-0 leading-tight">
                <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#64748b] font-sans truncate">
                  Check In - Check Out
                </span>
                <span className="text-[14px] sm:text-[14.5px] font-bold text-[#0d1b2e] font-sans truncate mt-0.5">
                  {dateDisplay || "Select dates"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0d1b2e] shrink-0 stroke-[2.5]" />
          </div>

          {/* Mobile Date Error */}
          {dateError && (
            <p className="text-[11px] text-red-500 font-medium font-sans mt-1 text-center">
              {dateError}
            </p>
          )}

          {/* Bottom Check Availability Button */}
          <button
            type="button"
            onClick={handleCheckAvailability}
            className="w-full h-[58px] sm:h-[60px] mt-2.5 sm:mt-3 px-4 sm:px-[32px] rounded-[8px] bg-[#0d1b2e] hover:bg-[#162840] text-white font-semibold text-[15px] sm:text-[15.5px] shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center font-sans tracking-wide"
          >
            Check Availability
          </button>
        </div>
      </div>
    </>
  );
}

// ── Custom brand styling matching home page ────────────────────────────────
const STYLES = `
  .flatpickr-calendar {
    border-radius: 8px !important;
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.22), 0 10px 24px -5px rgba(0,0,0,0.08) !important;
    border: 1px solid rgba(0,0,0,0.08) !important;
    font-family: var(--font-public-sans), system-ui, sans-serif !important;
    padding: 6px 8px !important;
    box-sizing: border-box !important;
    z-index: 999999 !important;
  }
  .flatpickr-calendar:before,
  .flatpickr-calendar:after,
  .flatpickr-calendar.arrowTop:before,
  .flatpickr-calendar.arrowTop:after,
  .flatpickr-calendar.arrowBottom:before,
  .flatpickr-calendar.arrowBottom:after { 
    display: none !important; 
  }

  @media (max-width: 1023px) {
    .flatpickr-calendar {
      position: fixed !important;
      bottom: 138px;
      box-sizing: border-box !important;
      z-index: 999999 !important;
    }
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
  .flatpickr-prev-month {
    left: 24px !important;
  }
  .flatpickr-next-month {
    right: 24px !important;
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
  .flatpickr-day:hover,
  .flatpickr-day.prevMonthDay:hover,
  .flatpickr-day.nextMonthDay:hover {
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
    box-shadow: -25px 0 0 #e2e8f0, 25px 0 0 #e2e8f0 !important;
    border-color: transparent !important;
  }
  .flatpickr-day.startRange:not(.endRange) {
    box-shadow: 25px 0 0 #e2e8f0 !important;
  }
  .flatpickr-day.endRange:not(.startRange) {
    box-shadow: -25px 0 0 #e2e8f0 !important;
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


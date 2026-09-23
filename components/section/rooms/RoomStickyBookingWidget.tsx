"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  MapPin,
  Building2,
  Check,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils/safeFetch";

export interface HotelOption {
  id: string;
  name: string;
  place: string;
  state?: string;
  slug: string;
  hotelValue: string;
  bookingEngineUrl?: string;
}

const DEFAULT_HOTEL_OPTIONS: HotelOption[] = [
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
    id: "prop-hostel-gandhi",
    name: "Hostel Gandhi",
    place: "Chennai",
    state: "Tamil Nadu",
    slug: "hostel-gandhi",
    hotelValue: "hostelgandhi",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-hostelgandhi",
  },
  {
    id: "dest-chennai",
    name: "Kattil Chennai",
    place: "Chennai",
    state: "Tamil Nadu",
    slug: "kattil-executive-stay",
    hotelValue: "kattilchennai",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattilchennai",
  },
  {
    id: "dest-coimbatore",
    name: "Kattil Coimbatore",
    place: "Coimbatore",
    state: "Tamil Nadu",
    slug: "kattil-stay-coimbatore",
    hotelValue: "kattilcoimbatore",
    bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattilcoimbatore",
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
  if (s.includes("gandhi")) return "hostelgandhi";
  if (s.includes("sparrow")) return "thesparrow";
  if (s === "chennai") return "kattilchennai";
  if (s === "coimbatore") return "kattilcoimbatore";
  if (s === "colachel") return "kattilcolachel";
  if (s === "kaniyakumari" || s === "kanniyakumari" || s === "kanyakumari") return "thesparrow";
  return `kattil${s}`;
}

interface RoomStickyBookingWidgetProps {
  initialDestinationName?: string;
  initialPropertyName?: string;
  initialDestinationSlug?: string;
  initialHotelCode?: string;
  initialBookingEngineUrl?: string;
  lockedDestination?: boolean;
}

export default function RoomStickyBookingWidget({
  initialDestinationName = "Kaniyakumari",
  initialPropertyName = "The Sparrow",
  initialDestinationSlug = "kaniyakumari",
  initialHotelCode,
  initialBookingEngineUrl,
  lockedDestination = true,
}: RoomStickyBookingWidgetProps) {
  // Resolve initial hotel based on page parameters
  const initialHotel = useMemo<HotelOption>(() => {
    const slugLower = (initialDestinationSlug || "").toLowerCase().trim();
    const nameLower = (initialDestinationName || "").toLowerCase().trim();
    const propLower = (initialPropertyName || "").toLowerCase().trim();

    let extractedCode = "";
    if (initialBookingEngineUrl) {
      const match = initialBookingEngineUrl.match(/book-rooms-([^/?#]+)/);
      if (match) extractedCode = match[1];
    }

    const hotelValue =
      initialHotelCode ||
      extractedCode ||
      getHotelValueForSlug(propLower || slugLower);

    return {
      id: initialHotelCode ? `prop-${initialHotelCode}` : `dest-${initialDestinationSlug}`,
      name: initialPropertyName || `Kattil ${initialDestinationName}`,
      place: initialDestinationName,
      slug: initialDestinationSlug,
      hotelValue,
      bookingEngineUrl: initialBookingEngineUrl,
    };
  }, [initialDestinationName, initialPropertyName, initialDestinationSlug, initialHotelCode, initialBookingEngineUrl]);

  const [selectedHotel, setSelectedHotel] = useState<HotelOption>(initialHotel);
  const [hotelsList, setHotelsList] = useState<HotelOption[]>(DEFAULT_HOTEL_OPTIONS);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dates (empty by default)
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState<string>("");

  const [dateError, setDateError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
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

  // Fetch live active properties & destinations from database API
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      safeFetchJson<{ success: boolean; data: any[] | { count: number; properties: any[] } }>("/api/properties"),
      safeFetchJson<{ success: boolean; data: any[] }>("/api/destinations"),
    ])
      .then(([propsRes, destsRes]) => {
        if (!isMounted) return;

        let mapped: HotelOption[] = [];

        const rawProps = Array.isArray(propsRes?.data)
          ? propsRes.data
          : (propsRes?.data as any)?.properties || (propsRes as any)?.properties || [];

        if (Array.isArray(rawProps) && rawProps.length > 0) {
          mapped = rawProps.map((p: any) => {
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

        if (mapped.length === 0 && destsRes?.success && Array.isArray(destsRes.data) && destsRes.data.length > 0) {
          mapped = destsRes.data.map((d: any) => {
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
        }

        if (mapped.length > 0) {
          setHotelsList(mapped);

          // If current selectedHotel matches one from DB, sync it ONLY if not explicitly bound to a property
          if (!initialHotelCode && !initialPropertyName && !initialBookingEngineUrl) {
            const matched = mapped.find(
              (m) =>
                (initialDestinationSlug && m.slug.toLowerCase() === initialDestinationSlug.toLowerCase()) ||
                (initialDestinationName && m.place.toLowerCase() === initialDestinationName.toLowerCase())
            );
            if (matched) {
              setSelectedHotel(matched);
            }
          } else {
            // Ensure hotelsList includes the property option
            setSelectedHotel(initialHotel);
          }
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [initialDestinationName, initialDestinationSlug, initialHotel, initialHotelCode, initialPropertyName, initialBookingEngineUrl]);

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
          ? Math.max(10, Math.round(window.innerHeight - rect.top + 8))
          : 140;

        instance.calendarContainer.style.setProperty("position", "fixed", "important");
        instance.calendarContainer.style.setProperty("bottom", `${distFromBottom}px`, "important");
        instance.calendarContainer.style.setProperty("top", "auto", "important");

        if (rect && rect.width > 0) {
          instance.calendarContainer.style.setProperty("left", `${rect.left}px`, "important");
          instance.calendarContainer.style.setProperty("right", "auto", "important");
          instance.calendarContainer.style.setProperty("transform", "none", "important");
          instance.calendarContainer.style.setProperty("width", `${rect.width}px`, "important");
          instance.calendarContainer.style.setProperty("min-width", `${Math.min(rect.width, 300)}px`, "important");
          instance.calendarContainer.style.setProperty("max-width", `${rect.width}px`, "important");
        } else {
          instance.calendarContainer.style.setProperty("left", "10px", "important");
          instance.calendarContainer.style.setProperty("right", "10px", "important");
          instance.calendarContainer.style.setProperty("margin", "0 auto", "important");
          instance.calendarContainer.style.setProperty("width", "calc(100vw - 20px)", "important");
          instance.calendarContainer.style.setProperty("max-width", "512px", "important");
          instance.calendarContainer.style.setProperty("transform", "none", "important");
        }
        instance.calendarContainer.style.setProperty("box-sizing", "border-box", "important");
        instance.calendarContainer.style.setProperty("z-index", "999999", "important");
        instance.calendarContainer.classList.remove("arrowTop");
        instance.calendarContainer.classList.add("arrowBottom");
      } else {
        const box = dateBoxRef.current;
        if (!box) return;
        const rect = box.getBoundingClientRect();
        instance.calendarContainer.style.setProperty("position", "absolute", "important");
        instance.calendarContainer.style.setProperty("top", `${rect.bottom + window.scrollY + 6}px`, "important");
        instance.calendarContainer.style.setProperty("left", `${rect.left + window.scrollX}px`, "important");
        instance.calendarContainer.style.setProperty("width", `${rect.width}px`, "important");
        instance.calendarContainer.style.setProperty("min-width", `${rect.width}px`, "important");
        instance.calendarContainer.style.setProperty("max-width", `${rect.width}px`, "important");
        instance.calendarContainer.style.setProperty("transform", "none", "important");
        instance.calendarContainer.style.setProperty("box-sizing", "border-box", "important");
        instance.calendarContainer.style.setProperty("bottom", "auto", "important");
        instance.calendarContainer.style.setProperty("right", "auto", "important");
        instance.calendarContainer.style.setProperty("z-index", "99999", "important");
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

              // Keep calendar visible for 500ms so user sees the selected check-out date & range
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
              }
              closeTimerRef.current = setTimeout(() => {
                instance?.close();
              }, 500);
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

    // The calendar is appended to <body> while the date field is sticky (desktop) or
    // a fixed floating card (mobile); repositioning on scroll lags behind and detaches
    // once the widget unsticks. Close the calendar immediately on scroll input
    // (wheel / touch drag) instead. Listeners use capture so React stopPropagation
    // can't block them.
    const closeCalendar = () => {
      if (!fpRef.current?.isOpen) return;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      fpRef.current.close();
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    // Ignore finger jitter while tapping a date; a real drag closes the calendar.
    const handleTouchMove = (e: TouchEvent) => {
      if (!fpRef.current?.isOpen || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) closeCalendar();
    };
    const listenerOptions: AddEventListenerOptions = { passive: true, capture: true };

    window.addEventListener("wheel", closeCalendar, listenerOptions);
    window.addEventListener("touchstart", handleTouchStart, listenerOptions);
    window.addEventListener("touchmove", handleTouchMove, listenerOptions);
    // Fallback for keyboard / scrollbar page scrolling (non-capture: ignores inner scrollers)
    window.addEventListener("scroll", closeCalendar, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      alive = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      window.removeEventListener("wheel", closeCalendar, listenerOptions);
      window.removeEventListener("touchstart", handleTouchStart, listenerOptions);
      window.removeEventListener("touchmove", handleTouchMove, listenerOptions);
      window.removeEventListener("scroll", closeCalendar);
      window.removeEventListener("resize", handleScrollOrResize);
      fpRef.current?.destroy();
    };
  }, []);

  const toggleCalendar = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!fpRef.current) return;
    if (fpRef.current.isOpen) {
      fpRef.current.close();
    } else {
      fpRef.current.open();
    }
  };

  const openCalendar = () => {
    if (fpRef.current && !fpRef.current.isOpen) {
      fpRef.current.open();
    }
  };

  // Submit to IPMS247 booking engine
  const handleCheckAvailability = () => {
    if (!checkin || !checkout) {
      setDateError("Please select check-in and check-out dates");
      setShakeCount((prev) => prev + 1);
      openCalendar();
      return;
    }

    setDateError(null);
    let targetHotel =
      selectedHotel.hotelValue ||
      initialHotelCode ||
      "";

    let actionUrl =
      selectedHotel.bookingEngineUrl ||
      initialBookingEngineUrl ||
      "";

    if (!targetHotel && actionUrl) {
      const match = actionUrl.match(/book-rooms-([^/?#]+)/);
      if (match) targetHotel = match[1];
    }
    if (!targetHotel) {
      targetHotel = getHotelValueForSlug(selectedHotel.slug || initialDestinationSlug || "thesparrow");
    }
    if (!actionUrl) {
      actionUrl = `https://live.ipms247.com/booking/book-rooms-${targetHotel}`;
    }

    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    form.action = actionUrl;

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
          {/* Property Display */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans">
              Choose your stay
            </label>

            <div className="w-full h-11 px-3.5 rounded-[8px] border border-gray-200 bg-gray-50/70 text-[13.5px] font-medium text-gray-800 flex items-center text-left font-sans select-none">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Building2 className="w-4.5 h-4.5 text-[#0d1b2e]/70 shrink-0 stroke-[1.6]" />
                <span className="text-[13.5px] font-medium text-gray-900 truncate font-sans">
                  {selectedHotel.name}{selectedHotel.place ? ` (${selectedHotel.place})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Check In & Out */}
          <motion.div
            key={`date-box-${shakeCount}`}
            animate={dateError ? { x: [0, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.25 }}
            className="relative w-full"
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 font-sans">
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
              onClick={toggleCalendar}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-full h-11 px-3.5 rounded-[8px] border ${dateError
                ? "border-[#0d1b2e] bg-[#0d1b2e]/[0.03] ring-1 ring-[#0d1b2e]/20"
                : "border-gray-200 bg-gray-50/70 hover:bg-gray-100/70"
                } text-[13.5px] font-medium text-gray-800 flex items-center justify-between cursor-pointer transition-colors select-none`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none">
                <Calendar
                  className={`w-4.5 h-4.5 ${dateError ? "text-[#0d1b2e]" : "text-[#0d1b2e]/70"} shrink-0 stroke-[1.6]`}
                />
                <div className="w-full bg-transparent text-[13.5px] font-medium truncate font-sans">
                  {checkin && checkout ? (
                    <span className="text-gray-900">{formatDateDisplay(checkin)} - {formatDateDisplay(checkout)}</span>
                  ) : checkin ? (
                    <>
                      <span className="text-gray-900">{formatDateDisplay(checkin)} - </span>
                      <span className="text-gray-400 font-normal">Select Check-out</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-normal">Select check-in & check-out</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Check Availability CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCheckAvailability}
              className="w-full h-11 px-4 rounded-[8px] bg-[#0d1b2e] hover:bg-[#162840] text-white font-semibold text-[14px] shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center font-sans"
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
          <motion.div
            key={`mobile-date-box-${shakeCount}`}
            animate={dateError ? { x: [0, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.25 }}
            ref={mobileDateBoxRef}
            onClick={toggleCalendar}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
            className={`w-full h-[58px] sm:h-[60px] px-4 sm:px-[32px] bg-white border ${dateError
              ? "border-[#0d1b2e] ring-1 ring-[#0d1b2e]/20"
              : "border-[#d8e0ea] hover:border-gray-400"
              } rounded-[8px] flex items-center justify-between cursor-pointer transition-colors shadow-2xs select-none`}
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pointer-events-none">
              <Calendar
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${dateError ? "text-[#0d1b2e]" : "text-[#0d1b2e]"} shrink-0 stroke-[1.6]`}
              />
              <div className="flex flex-col text-left justify-center min-w-0 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#64748b] font-sans truncate">
                    Check In - Check Out
                  </span>
                  {dateError && (
                    <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-[4px]">
                      Required
                    </span>
                  )}
                </div>
                <div className="text-[14px] sm:text-[14.5px] font-bold font-sans truncate mt-0.5">
                  {checkin && checkout ? (
                    <span className="text-[#0d1b2e]">{formatDateDisplay(checkin)} - {formatDateDisplay(checkout)}</span>
                  ) : checkin ? (
                    <>
                      <span className="text-[#0d1b2e]">{formatDateDisplay(checkin)} - </span>
                      <span className="text-gray-400 font-normal">Select Check-out</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-normal">Select dates</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0d1b2e] shrink-0 stroke-[2.5] pointer-events-none" />
          </motion.div>

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
    background: #ffffff !important;
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
      top: auto !important;
      bottom: 140px !important;
      left: 10px !important;
      right: 10px !important;
      margin: 0 auto !important;
      max-width: 512px !important;
      width: calc(100vw - 20px) !important;
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
`;


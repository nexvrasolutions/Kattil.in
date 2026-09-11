"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaTelegram, FaPhone } from "react-icons/fa";
import { SiGoogle } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { FaXTwitter } from "react-icons/fa6";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SidebarLocation { label: string; url: string }
export interface SidebarIconData {
  label:     string;
  tooltip:   string;
  iconName:  string;
  iconUrl:   string;
  url:       string;
  bgColor:   string;
  iconColor: string;
  type:      "link" | "multi";
  pulse:     boolean;
  order:     number;
  visible:   boolean;
  locations: SidebarLocation[];
}

// ── Built-in icon map ─────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  whatsapp:   FaWhatsapp,
  instagram:  FaInstagram,
  facebook:   FaFacebook,
  linkedin:   FaLinkedin,
  youtube:    FaYoutube,
  telegram:   FaTelegram,
  phone:      FaPhone,
  mail:       MdEmail,
  googlemaps: SiGoogle,
  twitter:    FaXTwitter,
};

function IconRenderer({ iconName, iconUrl, iconColor }: { iconName: string; iconUrl: string; iconColor: string }) {
  if (iconUrl) {
    return <img src={iconUrl} alt={iconName} className="h-5 w-5 object-contain" style={{ filter: iconColor === "#ffffff" ? "brightness(0) invert(1)" : "none" }} />;
  }
  const Icon = ICON_MAP[iconName];
  if (Icon) return <Icon size={20} color={iconColor} />;
  // Fallback: first two chars
  return <span className="text-[10px] font-black" style={{ color: iconColor }}>{iconName.slice(0, 2).toUpperCase()}</span>;
}

export default function SocialSidebar({ icons }: { icons?: SidebarIconData[] }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [inHero, setInHero] = useState<boolean>(isHome);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setInHero((prev) => (prev ? false : prev));
      return;
    }

    const checkScroll = () => {
      const inHeroSection = window.scrollY < 80;
      setInHero((prev) => (prev !== inHeroSection ? inHeroSection : prev));
      if (inHeroSection) {
        setOpenMenu((prev) => (prev ? null : prev));
      }
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [isHome]);

  const visibleIcons = (icons ?? [])
    .filter((ic) => ic.visible)
    .sort((a, b) => a.order - b.order);

  if (visibleIcons.length === 0) return null;

  const isVisible = !isHome || !inHero;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed right-5 bottom-0 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3"
        >
          {visibleIcons.map((social, i) => (
            <motion.div
              key={`${social.label}-${i}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: i * 0.05 }}
              className="relative flex items-center justify-end"
              onHoverStart={() => setHovered(social.label)}
              onHoverEnd={() => setHovered(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {hovered === social.label && openMenu !== social.label && (
                  <motion.span
                    initial={{ opacity: 0, x: 10, scale: 0.88 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.88 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-14 bg-white text-primary font-sans text-[11px] font-semibold
                      tracking-wide px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none"
                  >
                    {social.tooltip || social.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Multi sub-menu */}
              <AnimatePresence>
                {social.type === "multi" && openMenu === social.label && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-14 flex flex-col gap-1.5"
                  >
                    {social.locations.map((loc) => (
                      <a key={loc.label} href={loc.url} target="_blank" rel="noopener noreferrer"
                        onClick={() => setOpenMenu(null)}
                        className="bg-white text-primary font-sans text-[11px] font-semibold tracking-wide
                          px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap
                          hover:bg-primary hover:text-white transition-colors duration-200 text-center">
                        {loc.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon button */}
              {social.type === "link" ? (
                <motion.a href={social.url} aria-label={social.label} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.14, x: -4 }} whileTap={{ scale: 0.93 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  style={{ background: social.bgColor }}>
                  <IconRenderer iconName={social.iconName} iconUrl={social.iconUrl} iconColor={social.iconColor} />
                </motion.a>
              ) : (
                <motion.button aria-label={social.label}
                  onClick={() => setOpenMenu((prev) => (prev === social.label ? null : social.label))}
                  whileHover={{ scale: 1.14, x: -4 }} whileTap={{ scale: 0.93 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  style={{ background: social.bgColor }}>
                  {social.pulse && <span className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: social.bgColor }} />}
                  <IconRenderer iconName={social.iconName} iconUrl={social.iconUrl} iconColor={social.iconColor} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

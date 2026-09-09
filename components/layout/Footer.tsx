"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const columnVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};
const topVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

// ── Types passed from layout ──────────────────────────────────────────────────
export interface FooterLink { label: string; href: string; newTab: boolean; order: number }
export interface FooterSection { section: string; order: number; links: FooterLink[] }
export interface FooterSocial { label: string; url: string; iconName: string; iconImageUrl: string; bgColor: string; visible: boolean }
export interface FooterLocation { city: string; address: string; phone?: string; email?: string }
export interface FooterProps {
  logo: string;
  headline: string;
  description: string;
  copyright: string;
  footerLinks: FooterSection[];
  socialLinks: FooterSocial[];
  locations?: FooterLocation[];
}

// ── Social icon text fallback ─────────────────────────────────────────────────
function SocialIconFallback({ name }: { name: string }) {
  const map: Record<string, string> = {
    instagram: "IG", facebook: "FB", twitter: "X", linkedin: "LI",
    youtube: "YT", whatsapp: "WA", telegram: "TG", googlemaps: "G",
  };
  return <span className="text-[12px] font-bold text-white tracking-tight">{map[name?.toLowerCase()] ?? (name ? name.slice(0, 2).toUpperCase() : "IG")}</span>;
}

// ── Location block — matches Head Office structure ───────────────────────────
function LocationBlock({ location }: { location: FooterLocation }) {
  return (
    <address className="not-italic space-y-6">
      <p className="text-[14px] sm:text-[15px] text-[#E6E2D4CC]/80 leading-relaxed max-w-[260px]">
        {location.address}
      </p>
      {location.phone && (
        <div>
          <h5 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-white mb-2">
            PHONE
          </h5>
          <a
            href={`tel:${location.phone.replace(/\s/g, "")}`}
            className="block text-[14px] sm:text-[15px] text-[#E6E2D4CC]/80 hover:text-white transition-colors duration-200"
          >
            {location.phone}
          </a>
        </div>
      )}
      {location.email && (
        <div>
          <h5 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-white mb-2">
            MAIL
          </h5>
          <a
            href={`mailto:${location.email}`}
            className="block text-[14px] sm:text-[15px] text-[#E6E2D4CC]/80 hover:text-white transition-colors duration-200 break-all"
          >
            {location.email}
          </a>
        </div>
      )}
    </address>
  );
}

export default function Footer({
  logo, headline, description, copyright, footerLinks, socialLinks, locations,
}: FooterProps) {
  const ref = useRef<HTMLElement>(null);
  useInView(ref, { once: true, margin: "-80px" });

  const visibleSocial = socialLinks.filter((s) => s.visible);
  const sortedSections = [...footerLinks].sort((a, b) => a.order - b.order);
  const visibleLocations = locations?.filter((l) => l.address) ?? [];

  return (
    <footer ref={ref} className="relative overflow-hidden bg-primary text-white font-sans px-3 md:px-5">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/assets/overlay.png')", backgroundPosition: "center", backgroundSize: "cover", opacity: 0.8 }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1920px] px-5 md:px-8 lg:px-15 py-14 sm:py-16 lg:py-20">

        {/* Header — logo + headline */}
        <motion.div variants={topVariants} initial="hidden" animate="visible" className="flex flex-col items-center text-center mb-12">
          {logo && (
            <img src={logo} alt="Kattil" className="h-20 sm:h-24 lg:h-28 object-contain mb-5" />
          )}
          {headline && (
            <p
              className="font-sans font-normal text-[18px] sm:text-[24px] md:text-[28px] lg:text-[34px] leading-tight lg:leading-[40px] tracking-normal text-center max-w-[1080px] mx-auto"
              style={{
                color: "rgba(230, 226, 212, 0.8082)",
              }}
            >
              {headline}
            </p>
          )}
          {description && (
            <p className="mt-3 text-sm text-white/60 max-w-2xl leading-relaxed font-sans">{description}</p>
          )}
        </motion.div>

        <div className="border-t border-white/15 mb-10" />

        {/* Columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8 sm:gap-10 md:gap-12 xl:gap-[90px] gap-y-10"
        >
          {/* Navigation + Legal (and any other CMS sections) */}
          {sortedSections.map((section, idx) => (
            <motion.div key={`${section.section}-${idx}`} variants={columnVariants}>
              <h4 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-white mb-4">
                {section.section}
              </h4>
              <ul className="space-y-3">
                {[...section.links].sort((a, b) => a.order - b.order).map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.newTab ? "_blank" : undefined}
                      rel={link.newTab ? "noopener noreferrer" : undefined}
                      className="group inline-block text-[14px] sm:text-[15px] text-[#E6E2D4CC]/80 hover:text-white transition-colors duration-200"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute left-0 -bottom-px h-px w-0 bg-white/50 transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Head Office / Locations */}
          {visibleLocations.length > 0 ? (
            visibleLocations.slice(0, 1).map((loc) => (
              <motion.div key={loc.city || "head-office"} variants={columnVariants}>
                <h4 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-white mb-4">
                  HEAD OFFICE
                </h4>
                <LocationBlock location={loc} />
              </motion.div>
            ))
          ) : (
            <motion.div variants={columnVariants}>
              <h4 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-white mb-4">
                HEAD OFFICE
              </h4>
              <LocationBlock
                location={{
                  city: "Madurai",
                  address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017, India",
                  phone: "+91 7358127921",
                  email: "sadhu_burlington@live.com",
                }}
              />
            </motion.div>
          )}

          {/* Social links */}
          <motion.div variants={columnVariants}>
            <h4 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-white mb-4">
              SOCIAL LINKS
            </h4>
            <div className="flex flex-wrap gap-3">
              {(visibleSocial.length > 0 ? visibleSocial : [
                {
                  label: "Instagram",
                  url: "https://www.instagram.com/kattilthehome",
                  iconName: "instagram",
                  iconImageUrl: "",
                  bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)",
                  visible: true,
                }
              ]).map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-md transition-transform"
                  style={{ background: social.bgColor || "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)" }}
                >
                  {social.iconImageUrl
                    ? <img src={social.iconImageUrl} alt={social.label} className="h-5 w-5 object-contain" />
                    : <SocialIconFallback name={social.iconName || "instagram"} />
                  }
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-7 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/35">
            {copyright || `© ${new Date().getFullYear()} Kattil. All Rights Reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

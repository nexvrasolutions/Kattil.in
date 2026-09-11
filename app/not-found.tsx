"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Home } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Deterministic pseudo-random sequence for SSR consistency ─────────────────
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

const STATIC_STARS = Array.from({ length: 65 }, (_, i) => ({
  id: i,
  left: (pseudoRandom(i + 1) * 100).toFixed(2),
  top: (pseudoRandom(i + 100) * 100).toFixed(2),
  size: Number((0.7 + pseudoRandom(i + 200) * 2).toFixed(2)),
  delay: Number((pseudoRandom(i + 300) * 5).toFixed(2)),
  duration: Number((2.5 + pseudoRandom(i + 400) * 3).toFixed(2)),
  peak: Number((0.25 + pseudoRandom(i + 500) * 0.65).toFixed(2)),
}));

const STATIC_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: Number((15 + pseudoRandom(i + 600) * 70).toFixed(2)),
  delay: Number((pseudoRandom(i + 700) * 7).toFixed(2)),
  size: Number((1.5 + pseudoRandom(i + 800) * 2.5).toFixed(2)),
  duration: Number((6 + pseudoRandom(i + 900) * 5).toFixed(2)),
  driftX: Number(((pseudoRandom(i + 1000) - 0.5) * 50).toFixed(2)),
}));

// ─── Star field ───────────────────────────────────────────────────────────────
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STATIC_STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px` }}
          animate={{ opacity: [0.05, s.peak, 0.05] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Floating dust particles ──────────────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STATIC_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-secondary/30"
          style={{ left: `${p.left}%`, bottom: "-8px", width: `${p.size}px`, height: `${p.size}px` }}
          animate={{ y: [0, -420], x: [0, p.driftX], opacity: [0, 0.65, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.35, 1],
          }}
        />
      ))}
    </div>
  );
}

// ─── Expanding pulse rings ────────────────────────────────────────────────────
function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[240, 320, 400].map((size, i) => (
        <motion.div
          key={i}
          className="absolute border border-secondary/12 rounded-full"
          style={{ width: size, height: size }}
          animate={{ scale: [1, 1.18], opacity: [0.55, 0] }}
          transition={{ duration: 3.2, delay: i * 1.07, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Hotel Door ───────────────────────────────────────────────────────────────
function HotelDoor() {
  return (
    <svg width="196" height="284" viewBox="0 0 196 284" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Depth shadow behind door */}
      <rect x="12" y="12" width="178" height="268" rx="5" fill="#020911" opacity="0.7" />

      {/* Outer frame */}
      <rect x="5" y="5" width="178" height="268" rx="5" fill="#0b1e35" stroke="#7B6230" strokeWidth="2.2" />

      {/* Inner molding */}
      <rect x="13" y="13" width="162" height="252" rx="3.5" fill="#081629" stroke="#52401e" strokeWidth="1.4" />

      {/* Door surface */}
      <rect x="20" y="20" width="148" height="238" rx="2.5" fill="#06121f" />

      {/* Vertical sheen */}
      <rect x="20" y="20" width="3.5" height="238" rx="1.5" fill="white" opacity="0.018" />

      {/* Top-left panel */}
      <rect x="27" y="27" width="59" height="80" rx="2.5" fill="#050f1c" />
      <rect x="28.5" y="28.5" width="56" height="77" rx="2" fill="none" stroke="#172d47" strokeWidth="0.9" />
      <rect x="29" y="29" width="54" height="3.5" rx="1" fill="#1c3455" opacity="0.35" />

      {/* Top-right panel */}
      <rect x="102" y="27" width="59" height="80" rx="2.5" fill="#050f1c" />
      <rect x="103.5" y="28.5" width="56" height="77" rx="2" fill="none" stroke="#172d47" strokeWidth="0.9" />
      <rect x="104" y="29" width="54" height="3.5" rx="1" fill="#1c3455" opacity="0.35" />

      {/* Horizontal dividers */}
      <line x1="20" y1="114" x2="168" y2="114" stroke="#0f2338" strokeWidth="1.2" />
      <line x1="20" y1="163" x2="168" y2="163" strokeWidth="1.2" stroke="#0f2338" />

      {/* Mid-left panel */}
      <rect x="27" y="120" width="59" height="36" rx="2.5" fill="#050f1c" />
      <rect x="28.5" y="121.5" width="56" height="33" rx="2" fill="none" stroke="#172d47" strokeWidth="0.9" />

      {/* Mid-right panel */}
      <rect x="102" y="120" width="59" height="36" rx="2.5" fill="#050f1c" />
      <rect x="103.5" y="121.5" width="56" height="33" rx="2" fill="none" stroke="#172d47" strokeWidth="0.9" />

      {/* Bottom large panel */}
      <rect x="27" y="169" width="134" height="74" rx="2.5" fill="#050f1c" />
      <rect x="28.5" y="170.5" width="131" height="71" rx="2" fill="none" stroke="#172d47" strokeWidth="0.9" />
      <rect x="29" y="171" width="129" height="3.5" rx="1" fill="#1c3455" opacity="0.35" />

      {/* Room number plate */}
      <rect x="65" y="129" width="58" height="23" rx="3.5" fill="#7a5c14" />
      <rect x="67" y="131" width="54" height="19" rx="2.5" fill="#C9972A" />
      <text
        x="94"
        y="145"
        textAnchor="middle"
        fill="#2a1500"
        fontFamily="Georgia, serif"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="2"
      >
        404
      </text>

      {/* Knob plate */}
      <rect x="143" y="152" width="14" height="28" rx="7" fill="#7a5c14" />
      {/* Knob outer */}
      <circle cx="150" cy="168" r="7.5" fill="#C9972A" />
      {/* Knob inner */}
      <circle cx="150" cy="168" r="5" fill="#8B6914" />
      {/* Knob highlight */}
      <ellipse cx="147.5" cy="165.5" rx="2.2" ry="1.6" fill="#E8CC6A" opacity="0.65" />

      {/* Keyhole */}
      <circle cx="150" cy="181" r="2.4" fill="#020911" />
      <path d="M148.8 183 L148.8 188 L151.2 188 L151.2 183 Z" fill="#020911" />

      {/* Top arch ornament */}
      <path d="M55 13 Q98 3 141 13" stroke="#7B6230" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* Threshold bar */}
      <rect x="13" y="271" width="162" height="5" rx="1.5" fill="#030b15" opacity="0.8" />
    </svg>
  );
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────
export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[82vh] bg-primary overflow-hidden px-5 py-14">

      {/* Ambient layers */}
      <StarField />
      <Particles />

      {/* Central radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 46%, rgba(156,175,136,0.09) 0%, transparent 68%)",
        }}
      />

      <PulseRings />

      {/* Ghost "404" backdrop */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-serif font-bold text-white"
          style={{
            fontSize: "clamp(150px, 32vw, 260px)",
            opacity: 0.028,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          404
        </span>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
      >
        <Link href="/" aria-label="Back to Kattil Home">
          <img
            src="/assets/logo.png"
            alt="Kattil"
            className="h-10 md:h-12 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>
      </motion.div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">

        {/* Floating door + sign */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.86 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: EASE }}
          className="relative mb-10"
        >
          {/* Door float loop */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <HotelDoor />

            {/* Do Not Disturb tag */}
            <motion.div
              animate={{ rotate: [-8, 6, -8] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute"
              style={{ top: "61%", left: "66%", transformOrigin: "top center" }}
            >
              {/* String */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-px h-3.5 bg-secondary/45" />
              {/* Tag */}
              <div className="bg-secondary rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/50">
                <p className="font-sans text-[7px] font-bold uppercase tracking-[0.14em] leading-snug text-center text-primary">
                  Do Not<br />Disturb
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floor shadow syncs with float */}
          <motion.div
            animate={{ scaleX: [1, 0.78, 1], opacity: [0.28, 0.1, 0.28] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-36 h-3 rounded-full bg-black blur-md"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.65, ease: "easeOut" }}
          className="font-sans text-[10px] font-semibold uppercase tracking-[0.34em] text-secondary mb-3"
        >
          Room Not Found
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.78, ease: EASE }}
          className="font-serif text-[1.9rem] md:text-[2.35rem] font-light text-white leading-snug tracking-tight mb-3"
        >
          You&apos;ve knocked on<br />the wrong door.
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.95, ease: "easeOut" }}
          className="font-sans text-[13px] text-white/35 leading-relaxed mb-9"
        >
          This page has checked out.<br />
          Let us guide you back to comfort.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 1.1, ease: EASE }}
        >
          <Link
            href="/"
            className="group relative overflow-hidden inline-flex items-center gap-2.5 font-sans
              text-[13px] font-medium tracking-wide border border-secondary/35 rounded-md
              px-7 py-3.5 hover:border-secondary transition-all duration-400 ease-out"
          >
            <span className="absolute inset-0 bg-secondary scale-x-0 origin-left transition-transform duration-400 ease-out group-hover:scale-x-100" />
            <Home
              size={14}
              className="relative z-10 text-secondary transition-colors duration-400 group-hover:text-primary shrink-0"
            />
            <span className="relative z-10 text-secondary transition-colors duration-400 group-hover:text-primary">
              Back to Home
            </span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

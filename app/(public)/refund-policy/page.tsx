"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function AnimatedWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: delay + i * 0.055, ease: "easeOut" }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const tiers = [
  {
    window: "30+ Days Before Arrival",
    refund: "100%",
    label: "Full Refund",
    description:
      "Cancel 30 or more days before your scheduled arrival and receive a complete refund of all amounts paid, including any deposits. No questions asked.",
    color: "#4CAF50",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
  },
  {
    window: "7–29 Days Before Arrival",
    refund: "50%",
    label: "Partial Refund",
    description:
      "Cancellations within this window will receive a 50% refund of the total booking value. The remaining 50% is retained to offset operational commitments already made.",
    color: "#F59E0B",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    window: "Less Than 7 Days",
    refund: "0%",
    label: "Non-Refundable",
    description:
      "Cancellations within 7 days of arrival or no-shows are non-refundable. We strongly recommend travel insurance for peace of mind in unforeseen circumstances.",
    color: "#EF4444",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
];

const additionalPolicies = [
  {
    title: "How Refunds Are Processed",
    content:
      "Approved refunds are returned to the original payment method within 7–14 business days, depending on your bank or card issuer. You will receive a confirmation email once the refund has been initiated.",
  },
  {
    title: "Non-Refundable Add-Ons",
    content:
      "Certain upgrades, experience packages, and third-party services (such as airport transfers, private dining, and spa treatments booked as packages) may be non-refundable. These will be clearly marked during the booking process.",
  },
  {
    title: "Force Majeure",
    content:
      "In the event of circumstances beyond our reasonable control — including natural disasters, government-mandated travel restrictions, or public health emergencies — Kattil will offer a full credit valid for 12 months in lieu of a monetary refund.",
  },
  {
    title: "Modifications vs Cancellations",
    content:
      "If you modify your reservation to a shorter stay, the difference will be refunded at the applicable cancellation tier based on the date of modification. Extending a stay is treated as a new booking.",
  },
  {
    title: "Early Departure",
    content:
      "Guests who check out before their reserved departure date will be charged the full booking amount unless prior arrangements have been agreed to in writing by the hotel management.",
  },
];

function TierCard({ tier, index }: { tier: (typeof tiers)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.12 }}
      className={`relative flex flex-col rounded-2xl border ${tier.border} ${tier.bg} p-7 md:p-9 overflow-hidden`}
    >
      {/* Big refund % watermark */}
      <span
        className="absolute -right-4 -bottom-6 font-sans font-light leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(5rem, 12vw, 9rem)", color: tier.color, opacity: 0.06 }}
      >
        {tier.refund}
      </span>

      {/* Badge */}
      <span className={`inline-flex self-start font-sans text-[10px] font-bold uppercase
        tracking-[0.2em] px-3 py-1.5 rounded-full mb-5 ${tier.badge}`}>
        {tier.label}
      </span>

      {/* Refund percentage */}
      <div className="mb-3 flex items-end gap-1.5">
        <span
          className="font-sans font-semibold leading-none tracking-tight"
          style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", color: tier.color }}
        >
          {tier.refund}
        </span>
        <span className="font-sans text-[13px] font-medium text-primary/40 mb-2 ml-1 uppercase tracking-wider">
          refund
        </span>
      </div>

      {/* Window label */}
      <h3 className="font-sans text-lg md:text-xl font-semibold text-primary mb-4 leading-snug tracking-tight">
        {tier.window}
      </h3>

      {/* Divider */}
      <div className="h-px bg-primary/8 mb-4" />

      {/* Description */}
      <p className="font-sans text-[15px] text-primary/60 leading-relaxed relative z-10">
        {tier.description}
      </p>
    </motion.div>
  );
}

function PolicyRow({ policy, index }: { policy: (typeof additionalPolicies)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-8 py-7 border-b border-primary/10 last:border-b-0"
    >
      {/* Index marker */}
      <div className="shrink-0 flex items-center gap-3 sm:flex-col sm:items-center sm:pt-1">
        <span
          className="w-7 h-7 rounded-full bg-secondary/20 border border-secondary/30
            flex items-center justify-center font-sans text-[11px] font-bold text-secondary"
        >
          {index + 1}
        </span>
        <div className="hidden sm:block w-px flex-1 bg-secondary/20 mt-2 min-h-8" />
      </div>

      {/* Text */}
      <div>
        <h4 className="font-sans text-base md:text-lg font-semibold text-primary mb-4 tracking-tight">
          {policy.title}
        </h4>
        <p className="font-sans text-[15px] text-primary/60 leading-relaxed max-w-2xl">
          {policy.content}
        </p>
      </div>
    </motion.div>
  );
}

export default function RefundPolicyPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });
  const tableRef = useRef<HTMLDivElement>(null);
  const tableInView = useInView(tableRef, { once: true, margin: "-60px" });

  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-8 sm:pb-9 md:pb-10 lg:pb-12">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20 w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="font-sans text-[14px] uppercase text-white/70 mb-5"
          >
            Legal
          </motion.p>

          <h1 className="text-white text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-[1.1] tracking-tight mb-10 max-w-3xl">
            <span className="font-sans">
              <AnimatedWords text="Refund" delay={0.2} />
            </span>{" "}
            <span className="font-serif italic font-normal">
              <AnimatedWords text="Policy." delay={0.28} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
            className="font-sans text-base text-white/70 leading-relaxed max-w-xl"
          >
            We understand that plans change. Our refund policy is designed to be fair
            and transparent — protecting both your investment and our ability to serve all guests.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="font-sans text-[12px] text-white/45 uppercase tracking-widest mt-8"
          >
            Last updated: May 2026
          </motion.p>
        </div>
      </section>

      {/* ── Cancellation Tiers ────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-tertiary py-14 md:py-20 lg:py-28 rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20">

          {/* Section header */}
          <div ref={headerRef}>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={headerInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ originX: 0 }}
              className="h-px bg-primary/15 mb-10"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="mb-12"
            >
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.28em] text-primary/40 mb-4">
                Cancellation Windows
              </p>
              <h2 className="text-[#0d1b2e] text-[28px] sm:text-[34px] md:text-[40px] font-sans font-normal leading-[1.18] tracking-tight max-w-xl">
                How far in advance does it{" "}
                <span className="font-serif italic font-normal text-[#0d1b2e]">
                  matter?
                </span>
              </h2>
            </motion.div>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 md:mb-20">
            {tiers.map((tier, i) => (
              <TierCard key={tier.window} tier={tier} index={i} />
            ))}
          </div>

          {/* Quick reference table */}
          <div ref={tableRef}>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={tableInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
              className="rounded-2xl overflow-hidden border border-primary/10 mb-16 md:mb-20"
            >
              {/* Table header */}
              <div className="grid grid-cols-3 bg-primary px-6 py-4">
                {["Notice Period", "Refund Amount", "Processing Time"].map((h) => (
                  <span
                    key={h}
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white/60"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {[
                ["30+ days", "Full (100%)", "7–10 business days"],
                ["7–29 days", "Partial (50%)", "7–10 business days"],
                ["< 7 days", "None (0%)", "—"],
                ["No-show", "None (0%)", "—"],
              ].map(([period, amount, time], ri) => (
                <motion.div
                  key={period}
                  initial={{ opacity: 0, x: -16 }}
                  animate={tableInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.1 + ri * 0.07 }}
                  className="grid grid-cols-3 px-6 py-5 border-t border-primary/8
                    hover:bg-primary/3 transition-colors duration-200"
                >
                  <span className="font-sans text-[14px] text-primary font-medium">{period}</span>
                  <span className="font-sans text-[14px] text-primary/70">{amount}</span>
                  <span className="font-sans text-[14px] text-primary/50">{time}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Additional policies */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.28em] text-primary/40 mb-4">
              Additional Details
            </p>
            <h2 className="text-[#0d1b2e] text-[28px] sm:text-[34px] md:text-[40px] font-sans font-normal leading-[1.18] tracking-tight max-w-xl mb-10">
              What else should you{" "}
              <span className="font-serif italic font-normal text-[#0d1b2e]">
                know?
              </span>
            </h2>
          </motion.div>

          <div className="bg-white rounded-2xl px-7 md:px-10 shadow-sm">
            {additionalPolicies.map((policy, i) => (
              <PolicyRow key={policy.title} policy={policy} index={i} />
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-12 p-7 md:p-9 rounded-2xl border border-primary/10 bg-primary/3
              flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <h3 className="font-sans text-xl md:text-2xl font-semibold text-primary mb-1.5">
                Need to request a{" "}
                <span className="font-serif italic font-normal">refund?</span>
              </h3>
              <p className="font-sans text-[14px] text-primary/55 leading-relaxed">
                Email us at{" "}
                <a
                  href="mailto:reservations@kattil.com"
                  className="font-medium text-primary/80 underline underline-offset-2
                    hover:text-secondary transition-colors duration-200"
                >
                  reservations@kattil.com
                </a>{" "}
                with your booking reference and reason for cancellation.
              </p>
            </div>
            <motion.a
              href="tel:+917448749779"
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="relative overflow-hidden shrink-0 px-8 py-4 rounded-xl bg-primary cursor-pointer
                font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-white"
            >
              <motion.span
                variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute inset-0 bg-secondary"
              />
              <span className="relative z-10">Call Us Now</span>
            </motion.a>
          </motion.div>
        </div>
      </section>
    </>
  );
}

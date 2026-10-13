"use client";

import { useRef, type ReactNode } from "react";
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

const WA_NUMBER_DISPLAY = "+91 91509 38497";
const WA_LINK = "https://wa.me/919150938497";

const policies: { title: string; content: ReactNode }[] = [
  {
    title: "Full Refund",
    content:
      "Cancellations made up to 48 hours before the check-in date qualify for a full refund, minus processing fees.",
  },
  {
    title: "Partial Refund",
    content:
      "Cancellations made within 24–48 hours before check-in incur a 50% charge of the booking amount.",
  },
  {
    title: "No Refund",
    content:
      "Cancellations within 24 hours of check-in or no-shows are non-refundable.",
  },
  {
    title: "Early Departures",
    content:
      "Guests departing earlier than scheduled will not be refunded for the remaining nights.",
  },
  {
    title: "Special Promotions",
    content:
      "Bookings under special promotional or discounted rates are non-refundable unless stated in the promotion terms.",
  },
  {
    title: "Changes to Reservation Dates",
    content: (
      <>
        Date changes are subject to availability and may incur additional charges or rate
        adjustments based on room availability.
      </>
    ),
  },
  {
    title: "Non-Refundable Rates",
    content:
      "Some rates or packages may be non-refundable regardless of the cancellation date. These will be indicated at the time of booking.",
  },
  {
    title: "Group Bookings",
    content:
      "Refund policies for group bookings may vary. Please refer to your group contract for specific terms or contact the team for details.",
  },
  {
    title: "Force Majeure",
    content:
      "In the event of unforeseen circumstances, such as natural disasters or government restrictions, Hostel Gandhi reserves the right to offer alternative solutions instead of refunds, subject to policy adjustments.",
  },
  {
    title: "Processing Time",
    content:
      "Refunds may take up to 7–10 business days to process, depending on the payment method and financial institution.",
  },
];

function PolicyRow({ policy, index }: { policy: (typeof policies)[0]; index: number }) {
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
  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[280px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-12 sm:pb-14 md:pb-16">
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

      {/* ── Policies ────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-tertiary py-14 md:py-20 lg:py-28 rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20">

          {/* Policies */}
          <div className="bg-white rounded-2xl px-7 md:px-10 shadow-sm">
            {policies.map((policy, i) => (
              <PolicyRow key={policy.title} policy={policy} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

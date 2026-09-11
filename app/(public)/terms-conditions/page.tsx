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

const terms = [
  {
    number: "01",
    title: "Reservation & Booking",
    points: [
      "All reservations must be made through our official website, authorised booking partners, or directly via phone.",
      "A valid credit or debit card is required to confirm any reservation. A pre-authorisation hold may be placed at check-in.",
      "Kattil reserves the right to cancel reservations made in error, fraudulently, or in violation of these terms.",
    ],
  },
  {
    number: "02",
    title: "Check-in & Check-out",
    points: [
      "Standard check-in time is 2:00 PM and check-out is 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges.",
      "A valid government-issued photo ID is required at check-in for all guests.",
      "Guests must be 18 years or older to check in without an accompanying adult.",
    ],
  },
  {
    number: "03",
    title: "Payment Policy",
    points: [
      "Full payment or a deposit (as specified during booking) is required at the time of reservation.",
      "We accept all major credit cards, debit cards, and select digital payment methods.",
      "All rates are quoted in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.",
    ],
  },
  {
    number: "04",
    title: "Cancellation Policy",
    points: [
      "Cancellations made 30 or more days before arrival receive a full refund.",
      "Cancellations within 7–29 days of arrival incur a 50% charge of the total booking value.",
      "Cancellations within 7 days of arrival or no-shows are non-refundable.",
    ],
  },
  {
    number: "05",
    title: "Guest Conduct",
    points: [
      "Guests are expected to conduct themselves in a manner respectful of other guests, staff, and the property.",
      "Smoking is permitted only in designated outdoor areas. A deep-cleaning fee applies for violations.",
      "Parties, loud gatherings, or any activity disturbing the quiet of the property are strictly prohibited.",
    ],
  },
  {
    number: "06",
    title: "Property Damage",
    points: [
      "Guests are responsible for any damage caused to property, fixtures, or furnishings during their stay.",
      "Kattil reserves the right to charge the card on file for any damages discovered after departure.",
      "Theft of hotel property is a criminal offence and will be reported to the appropriate authorities.",
    ],
  },
  {
    number: "07",
    title: "Liability",
    points: [
      "Kattil is not responsible for loss of personal belongings. We recommend the use of in-room safes.",
      "Our liability for any claim arising from your stay shall not exceed the total amount paid for the reservation.",
      "We are not liable for indirect, incidental, or consequential damages of any kind.",
    ],
  },
];

function TermCard({ term, index }: { term: (typeof terms)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.07 }}
      className="group relative bg-white rounded-2xl p-7 md:p-9 shadow-sm
        hover:shadow-md transition-shadow duration-400"
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-secondary
        scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

      <div className="flex flex-col md:flex-row gap-5 md:gap-8">
        {/* Number */}
        <span className="font-sans text-4xl md:text-5xl leading-none font-light text-primary/15 shrink-0
          transition-colors duration-400 group-hover:text-secondary/50">
          {term.number}
        </span>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-lg md:text-xl font-semibold text-primary tracking-tight">
            {term.title}
          </h3>
          <ul className="flex flex-col gap-3">
            {term.points.map((point, pi) => (
              <li key={pi} className="flex items-start gap-3">
                <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-sans text-[15px] text-primary/65 leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function TermsConditionsPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-secondary pt-28 md:pt-36 lg:pt-44 pb-16 md:pb-20">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20">
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
              <AnimatedWords text="Terms of" delay={0.2} />
            </span>{" "}
            <span className="font-serif italic font-normal">
              <AnimatedWords text="Stay." delay={0.32} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="font-sans text-base text-white/70 leading-relaxed max-w-xl"
          >
            By booking with Kattil, you agree to the following terms and conditions.
            Please read them carefully before completing your reservation.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="font-sans text-[12px] text-white/45 uppercase tracking-widest mt-8"
          >
            Effective: January 2025
          </motion.p>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <section className="bg-tertiary py-14 md:py-20 lg:py-28">
        <div className="mx-auto max-w-480 px-5 md:px-8 lg:px-20">

          {/* Intro */}
          <div ref={headerRef}>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={headerInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ originX: 0 }}
              className="h-px bg-primary/15 mb-10"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="font-sans text-base text-primary/60 leading-relaxed max-w-3xl mb-12"
            >
              These terms govern your relationship with Kattil Hotel. They are designed
              to ensure a safe, enjoyable experience for all guests while protecting the
              integrity of our property and team.
            </motion.p>
          </div>

          {/* Term cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {terms.map((term, i) => (
              <TermCard key={term.number} term={term} index={i} />
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10"
          >
            <p className="font-sans text-[14px] text-primary/55 leading-relaxed">
              <strong className="font-semibold text-primary/75">Note:</strong> Kattil
              reserves the right to amend these terms at any time. Changes will be effective
              upon posting to our website. Continued use of our services constitutes
              acceptance of the revised terms. For questions, contact{" "}
              <a
                href="mailto:legal@kattil.com"
                className="text-primary underline underline-offset-2 hover:text-secondary transition-colors duration-200"
              >
                legal@kattil.com
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

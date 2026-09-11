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

const sections = [
  {
    number: "01",
    title: "Information We Collect",
    content:
      "We collect information you provide directly — such as your name, email address, phone number, and payment details during booking. We also collect usage data when you interact with our website, including IP address, browser type, and pages visited, to improve your experience.",
  },
  {
    number: "02",
    title: "How We Use Your Information",
    content:
      "Your information is used to process reservations, personalise your stay, communicate important updates, and improve our services. We may also use it to send you promotional offers — you can opt out at any time. We do not sell or rent your personal data to third parties.",
  },
  {
    number: "03",
    title: "Data Security",
    content:
      "We employ industry-standard encryption and security protocols to protect your data. All payment transactions are processed through PCI-DSS compliant gateways. Access to personal information is restricted to authorised personnel only.",
  },
  {
    number: "04",
    title: "Cookies & Tracking",
    content:
      "Our website uses cookies to remember your preferences and improve site performance. You can control cookie settings through your browser at any time. Some features may be limited if cookies are disabled. We use analytics tools to understand how visitors engage with our content.",
  },
  {
    number: "05",
    title: "Third-Party Services",
    content:
      "We partner with trusted third-party providers for payments, booking platforms, and analytics. These partners are contractually bound to handle your data responsibly. We recommend reviewing their privacy policies as they operate independently.",
  },
  {
    number: "06",
    title: "Your Rights",
    content:
      "You have the right to access, update, or delete your personal data at any time. You may request a copy of the information we hold about you. To exercise these rights, contact us at the address below. We will respond within 30 days.",
  },
  {
    number: "07",
    title: "Contact Us",
    content:
      "If you have questions about this Privacy Policy or how we handle your data, please reach out to us at privacy@kattil.com or write to us at Kattil Hotel, Anna Nagar, Kanyakumari, Tamil Nadu 629702. We take all privacy concerns seriously.",
  },
];

function SectionCard({ section, index }: { section: (typeof sections)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.07 }}
      className="group relative flex flex-col md:flex-row gap-6 md:gap-10 py-8 md:py-10
        border-b border-primary/10 last:border-b-0"
    >
      {/* Number accent */}
      <div className="shrink-0 flex items-start">
        <span
          className="font-sans text-[3.8rem] md:text-[4.5rem] leading-none font-light text-primary/10
            select-none transition-colors duration-400 group-hover:text-primary/20"
        >
          {section.number}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 pt-1">
        <h3 className="font-sans text-lg md:text-xl font-semibold text-primary leading-snug tracking-tight">
          {section.title}
        </h3>
        <div
          className="h-px w-12 bg-secondary transition-all duration-500 group-hover:w-20"
        />
        <p className="font-sans text-base text-primary/65 leading-relaxed max-w-2xl">
          {section.content}
        </p>
      </div>
    </motion.div>
  );
}

export default function PrivacyPolicyPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

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
            className="font-sans text-[14px] font-semibold uppercase  text-white/70 mb-5"
          >
            Legal
          </motion.p>

          <h1 className="text-white text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-[1.1] tracking-tight mb-10 max-w-3xl">
            <span className="font-sans ">
              <AnimatedWords text="Your Privacy," delay={0.2} />
            </span>{" "}
            <span className="font-serif italic font-normal">
              <AnimatedWords text="Our Promise." delay={0.35} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="font-sans text-base text-white/70 leading-relaxed max-w-xl"
          >
            We are committed to protecting your personal data with full transparency.
            This policy explains how Kattil collects, uses, and safeguards your information.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="font-sans text-[11px] text-white/45 uppercase tracking-widest mt-8"
          >
            Last updated: May 2026
          </motion.p>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-tertiary py-14 md:py-20 lg:py-28 rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
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
              At Kattil, we respect the trust you place in us when sharing your personal
              information. This Privacy Policy outlines our practices and your rights in
              clear, human language — no legal jargon, no ambiguity.
            </motion.p>
          </div>

          {/* Sections */}
          <div>
            {sections.map((section, i) => (
              <SectionCard key={section.number} section={section} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

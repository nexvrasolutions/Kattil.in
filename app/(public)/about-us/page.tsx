import { cache } from "react";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import AboutModel from "@/lib/models/About";
import AboutContent from "./_content";

// ── Shared cached fetch — deduplicates the DB call between generateMetadata and page ──
const getAbout = cache(async (): Promise<AboutData | null> => {
  try {
    await connectDB();
    const about = await AboutModel.findOne()
      .select("heading subheading description images seo")
      .lean<AboutData>();
    return about;
  } catch {
    return null;
  }
});

export interface AboutData {
  heading: string;
  subheading?: string;
  description: string;
  images: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
}

// ── Dynamic SEO from CMS ──────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  const seo = about?.seo;

  const title = seo?.title?.trim() || "About Us";
  const description =
    seo?.description?.trim() ||
    "Learn about Kattil — a premium heritage-inspired hostel and co-living space in Chennai and Madurai, designed for travellers, digital nomads, and professionals.";
  const ogImage = seo?.ogImage || `${SITE_URL}/assets/about-us-2.webp`;

  return {
    title,
    description,
    keywords: seo?.keywords?.split(",").map((k) => k.trim()).filter(Boolean),
    alternates: { canonical: `${SITE_URL}/about-us` },
    openGraph: {
      title: seo?.title?.trim() || "About Kattil — The Homely Hotel",
      description,
      url: `${SITE_URL}/about-us`,
      images: [{ url: ogImage }],
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AboutPage() {
  const about = await getAbout();

  const plainAbout = about
    ? JSON.parse(JSON.stringify(about))
    : null;

  return <AboutContent about={plainAbout} />;
}
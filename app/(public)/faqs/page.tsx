import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import FaqModel from "@/lib/models/Faq";
import FAQsContent from "./_content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about staying at Kattil — reservations, amenities, dining, check-in policies, and more.",
  alternates: { canonical: `${SITE_URL}/faqs` },
  openGraph: {
    title: "FAQs | Kattil — The Homely Hotel",
    description: "Everything you need to know before, during, and after your stay at Kattil.",
    url: `${SITE_URL}/faqs`,
  },
};

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: "Reservations" | "Amenities" | "Dining" | "Policies";
  displayOrder: number;
}

async function getFaqs(): Promise<FaqItem[]> {
  try {
    await connectDB();
    const rawFaqs = await FaqModel.find({ status: "active" })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select("question answer category displayOrder")
      .lean();

    return (rawFaqs || []).map((f: any) => ({
      _id: String(f._id),
      question: String(f.question ?? ""),
      answer: String(f.answer ?? ""),
      category: f.category,
      displayOrder: Number(f.displayOrder ?? 0),
    }));
  } catch {
    return [];
  }
}

export default async function FAQsPage() {
  const faqs = await getFaqs();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 8).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQsContent faqs={faqs} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import { getHotelValueForSlug } from "@/lib/db/rooms";
import Property from "@/lib/models/Property";
import OffersView, { type OfferProperty } from "@/components/section/offers/OffersView";

export const metadata: Metadata = {
  title: "Offers | Kattil — Exclusive Stays, Thoughtful Offers",
  description:
    "Special stays at Kattil properties — weekend rates in Chennai and coastal stays with breakfast and local experiences in Kaniyakumari.",
  alternates: {
    canonical: `${SITE_URL}/offers`,
  },
  openGraph: {
    title: "Kattil Offers — Exclusive Stays. Thoughtful Offers.",
    description: "Offers made for individual Kattil locations.",
    url: `${SITE_URL}/offers`,
  },
};

// Same precedence as the property page's "Book Now" CTA: the property's
// configured booking engine URL, then its hotel code, then the slug mapping.
function resolveBookingUrl(p: { bookingEngineUrl?: string; hotelCode?: string }, citySlug: string): string {
  const url = p.bookingEngineUrl?.trim();
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) return url;
  const code = p.hotelCode?.trim() || getHotelValueForSlug(citySlug);
  return `https://live.ipms247.com/booking/book-rooms-${code}`;
}

async function getOfferProperties(): Promise<OfferProperty[]> {
  try {
    await connectDB();
    const properties = await Property.find({ status: { $ne: "inactive" } })
      .select("name slug city tagline images hotelCode bookingEngineUrl")
      .sort({ order: 1, createdAt: -1 })
      .populate("city", "name slug")
      .lean();

    return properties.map((p) => {
      const city = p.city as unknown as { name?: string; slug?: string } | null;
      const cityName = city?.name || "";
      const citySlug = city?.slug || cityName.toLowerCase();
      return {
        slug: p.slug,
        name: p.name,
        city: cityName,
        tagline: p.tagline || "",
        image: p.images?.[0] || "",
        bookingUrl: resolveBookingUrl(p, citySlug),
      };
    });
  } catch {
    return [];
  }
}

// Offers page is temporarily disabled (returns 404). Set to true to restore.
const OFFERS_PAGE_ENABLED = false;

export default async function OffersPage() {
  if (!OFFERS_PAGE_ENABLED) notFound();
  const properties = await getOfferProperties();
  return <OffersView properties={properties} />;
}

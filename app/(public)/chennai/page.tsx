import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getDestinationStaysData } from "@/lib/db/destinations";
import DestinationStaysView from "@/components/section/destination/DestinationStaysView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Kattil — The Homely Hotel, Chennai",
  url: `${SITE_URL}/chennai`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description:
    "Kattil Chennai offers comfortable hotel rooms and homestays in Teynampet, Chennai.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Plot 12, Cenotaph Road, Teynampet",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600018",
    addressCountry: "IN",
  },
};

export const metadata: Metadata = {
  title: "Hotel & Stays in Chennai | Kattil — Homely Stay in Teynampet",
  description:
    "Discover handpicked stays and comfortable rooms in Chennai at Kattil. Private rooms and homestays with Free WiFi, AC, and warm hospitality.",
  keywords: [
    "hotel in Chennai",
    "homely hotel Chennai",
    "stay in Chennai",
    "luxury hotel Teynampet",
    "co-living Chennai",
    "Kattil Chennai",
    "homestay Chennai",
  ],
  alternates: {
    canonical: `${SITE_URL}/chennai`,
  },
  openGraph: {
    title: "Kattil Chennai — Handpicked Stays & Rooms",
    description: "Comfortable rooms and homestays in Chennai. Book your stay at Kattil today.",
    url: `${SITE_URL}/chennai`,
    images: [{ url: "/assets/gallery.png", width: 1200, height: 630, alt: "Kattil Chennai Hotel" }],
  },
};

export default async function ChennaiPage() {
  const data = await getDestinationStaysData("chennai", "Chennai");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <DestinationStaysView
        cityName={data.cityName}
        citySlug={data.citySlug}
        properties={data.properties}
      />
    </>
  );
}

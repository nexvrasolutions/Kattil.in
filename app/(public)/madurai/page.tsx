import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getDestinationStaysData } from "@/lib/db/destinations";
import DestinationStaysView from "@/components/section/destination/DestinationStaysView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Kattil — The Homely Hotel, Madurai",
  url: `${SITE_URL}/madurai`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description:
    "Kattil Madurai offers comfortable hotel rooms and homestays near the Temple City's most iconic landmarks.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "J17 Poondi, No.6/29, Anna Nagar",
    addressLocality: "Madurai",
    addressRegion: "Tamil Nadu",
    postalCode: "625701",
    addressCountry: "IN",
  },
};

export const metadata: Metadata = {
  title: "Hotel & Stays in Madurai | Kattil — Homely Stay Near Meenakshi Temple",
  description:
    "Discover handpicked stays and comfortable rooms in Madurai at Kattil. Private rooms and homestays with Free WiFi, AC, and warm hospitality.",
  keywords: [
    "hotel in Madurai",
    "homely hotel Madurai",
    "stay in Madurai",
    "hotel near Meenakshi Temple",
    "budget hotel Madurai",
    "Kattil Madurai",
    "homestay Madurai",
  ],
  alternates: {
    canonical: `${SITE_URL}/madurai`,
  },
  openGraph: {
    title: "Kattil Madurai — Handpicked Stays & Rooms",
    description: "Comfortable rooms and homestays in Madurai. Book your stay at Kattil today.",
    url: `${SITE_URL}/madurai`,
    images: [{ url: "/assets/gallery.png", width: 1200, height: 630, alt: "Kattil Madurai Hotel" }],
  },
};

export default async function MaduraiPage() {
  const data = await getDestinationStaysData("madurai", "Madurai");

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

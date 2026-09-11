import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getDestinationStaysData } from "@/lib/db/destinations";
import DestinationStaysView from "@/components/section/destination/DestinationStaysView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Kattil — The Homely Hotel, Coimbatore",
  url: `${SITE_URL}/coimbatore`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description:
    "Kattil Coimbatore offers premium stays and hotel rooms near Race Course, Coimbatore.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "124, Race Course Road, Gopalapuram",
    addressLocality: "Coimbatore",
    addressRegion: "Tamil Nadu",
    postalCode: "641018",
    addressCountry: "IN",
  },
};

export const metadata: Metadata = {
  title: "Hotel & Stays in Coimbatore | Kattil — Homely Stay in Race Course",
  description:
    "Discover handpicked stays and comfortable rooms in Coimbatore at Kattil. Private rooms and homestays with Free WiFi, AC, and warm hospitality.",
  keywords: [
    "hotel in Coimbatore",
    "homely hotel Coimbatore",
    "stay in Coimbatore",
    "luxury hotel Race Course Coimbatore",
    "co-living Coimbatore",
    "Kattil Coimbatore",
    "homestay Coimbatore",
  ],
  alternates: {
    canonical: `${SITE_URL}/coimbatore`,
  },
  openGraph: {
    title: "Kattil Coimbatore — Handpicked Stays & Rooms",
    description: "Comfortable rooms and homestays in Coimbatore. Book your stay at Kattil today.",
    url: `${SITE_URL}/coimbatore`,
    images: [{ url: "/assets/gallery.png", width: 1200, height: 630, alt: "Kattil Coimbatore Hotel" }],
  },
};

export default async function CoimbatorePage() {
  const data = await getDestinationStaysData("coimbatore", "Coimbatore");

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

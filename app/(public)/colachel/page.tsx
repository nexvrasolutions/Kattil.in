import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getDestinationStaysData } from "@/lib/db/destinations";
import DestinationStaysView from "@/components/section/destination/DestinationStaysView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Kattil — The Homely Hotel, Colachel",
  url: `${SITE_URL}/colachel`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description:
    "Kattil Colachel offers serene beachside hotel rooms and stays along the scenic coastline of Colachel, Tamil Nadu.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Beach Road, Colachel",
    addressLocality: "Colachel",
    addressRegion: "Tamil Nadu",
    postalCode: "629251",
    addressCountry: "IN",
  },
};

export const metadata: Metadata = {
  title: "Hotel & Stays in Colachel | Kattil — Homely Stay Near Beach",
  description:
    "Discover handpicked stays and comfortable rooms in Colachel at Kattil. Private rooms and homestays with Free WiFi, AC, and warm hospitality.",
  keywords: [
    "hotel in Colachel",
    "homely hotel Colachel",
    "stay in Colachel",
    "beach stay Colachel",
    "Kattil Colachel",
    "homestay Colachel",
  ],
  alternates: {
    canonical: `${SITE_URL}/colachel`,
  },
  openGraph: {
    title: "Kattil Colachel — Handpicked Stays & Rooms",
    description: "Comfortable rooms and homestays in Colachel. Book your stay at Kattil today.",
    url: `${SITE_URL}/colachel`,
    images: [{ url: "/assets/gallery.png", width: 1200, height: 630, alt: "Kattil Colachel Hotel" }],
  },
};

export default async function ColachelPage() {
  const data = await getDestinationStaysData("colachel", "Colachel");

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

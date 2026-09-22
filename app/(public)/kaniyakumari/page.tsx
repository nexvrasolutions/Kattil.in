import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/seo";
import { getDestinationStaysData } from "@/lib/db/destinations";
import DestinationStaysView from "@/components/section/destination/DestinationStaysView";
import DestinationStaysSkeleton from "@/components/section/destination/DestinationStaysSkeleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Kattil — The Homely Hotel, Kaniyakumari",
  url: `${SITE_URL}/kaniyakumari`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description:
    "Kattil Kaniyakumari offers comfortable stays and hostel rooms near Sunset Point and the seashore in Kaniyakumari.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Main Road, Near Sunset Point",
    addressLocality: "Kaniyakumari",
    addressRegion: "Tamil Nadu",
    postalCode: "629702",
    addressCountry: "IN",
  },
};

export const metadata: Metadata = {
  title: "Hotel & Stays in Kaniyakumari | Kattil — The Sparrow Near Sunset Point",
  description:
    "Discover handpicked stays and comfortable rooms in Kaniyakumari at Kattil's The Sparrow. Private rooms, dorms, Free WiFi, AC, and serene ocean views.",
  keywords: [
    "hotel in Kaniyakumari",
    "hotel in Kanyakumari",
    "homely hotel Kaniyakumari",
    "stay in Kaniyakumari",
    "The Sparrow Kaniyakumari",
    "hostel in Kaniyakumari",
    "Kattil Kaniyakumari",
  ],
  alternates: {
    canonical: `${SITE_URL}/kaniyakumari`,
  },
  openGraph: {
    title: "Kattil Kaniyakumari — Handpicked Stays & Rooms",
    description: "Comfortable rooms and stays in Kaniyakumari near the ocean. Book your stay at Kattil today.",
    url: `${SITE_URL}/kaniyakumari`,
    images: [{ url: "/images/destinations/kanyakumari.png", width: 1200, height: 630, alt: "Kattil Kaniyakumari Hotel" }],
  },
};

async function KaniyakumariStays() {
  const data = await getDestinationStaysData("kaniyakumari", "Kaniyakumari");

  return (
    <DestinationStaysView
      cityName={data.cityName}
      citySlug={data.citySlug}
      properties={data.properties}
    />
  );
}

export default function KaniyakumariPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Suspense fallback={<DestinationStaysSkeleton cityName="Kaniyakumari" />}>
        <KaniyakumariStays />
      </Suspense>
    </>
  );
}

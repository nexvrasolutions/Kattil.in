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
  name: "Kattil — The Homely Hotel, Kanyakumari",
  url: `${SITE_URL}/kanyakumari`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description:
    "Kattil Kanyakumari offers comfortable stays and hostel rooms near Sunset Point and the seashore in Kanyakumari.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Main Road, Near Sunset Point",
    addressLocality: "Kanyakumari",
    addressRegion: "Tamil Nadu",
    postalCode: "629702",
    addressCountry: "IN",
  },
};

export const metadata: Metadata = {
  title: "Hotel & Stays in Kanyakumari | Kattil — The Sparrow Near Sunset Point",
  description:
    "Discover handpicked stays and comfortable rooms in Kanyakumari at Kattil's The Sparrow. Private rooms, dorms, Free WiFi, AC, and serene ocean views.",
  keywords: [
    "hotel in Kanyakumari",
    "homely hotel Kanyakumari",
    "stay in Kanyakumari",
    "The Sparrow Kanyakumari",
    "hostel in Kanyakumari",
    "Kattil Kanyakumari",
  ],
  alternates: {
    canonical: `${SITE_URL}/kanyakumari`,
  },
  openGraph: {
    title: "Kattil Kanyakumari — Handpicked Stays & Rooms",
    description: "Comfortable rooms and stays in Kanyakumari near the ocean. Book your stay at Kattil today.",
    url: `${SITE_URL}/kanyakumari`,
    images: [{ url: "/images/destinations/kanyakumari.png", width: 1200, height: 630, alt: "Kattil Kanyakumari Hotel" }],
  },
};

async function KanyakumariStays() {
  const data = await getDestinationStaysData("kaniyakumari", "Kanyakumari");

  return (
    <DestinationStaysView
      cityName={data.cityName}
      citySlug={data.citySlug}
      properties={data.properties}
    />
  );
}

export default function KanyakumariPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Suspense fallback={<DestinationStaysSkeleton cityName="Kanyakumari" />}>
        <KanyakumariStays />
      </Suspense>
    </>
  );
}

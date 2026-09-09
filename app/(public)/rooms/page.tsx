import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getRoomsPageData } from "@/lib/db/rooms";
import RoomsListingView from "@/components/section/rooms/RoomsListingView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Rooms & Suites | Kattil — The Homely Hotel",
  description:
    "Explore premium rooms and suites at Kattil. Thoughtfully designed spaces with modern amenities, warm hospitality, and a vibrant community experience.",
  alternates: { canonical: `${SITE_URL}/rooms` },
  openGraph: {
    title: "Rooms & Suites | Kattil — The Homely Hotel",
    description: "View all available rooms and handpicked stays at Kattil.",
    url: `${SITE_URL}/rooms`,
  },
};

interface PageProps {
  searchParams?: Promise<{
    destination?: string;
    city?: string;
    property?: string;
    hotel?: string;
    room?: string;
  }>;
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const destinationQuery =
    resolvedParams.destination ||
    resolvedParams.city ||
    resolvedParams.hotel ||
    undefined;
  const propertyQuery = resolvedParams.property || undefined;

  const data = await getRoomsPageData(destinationQuery, propertyQuery);

  return (
    <RoomsListingView
      destinationSlug={data.destinationSlug}
      destinationName={data.destinationName}
      propertyName={data.propertyName}
      hotelValue={data.hotelValue}
      rooms={data.rooms}
      allCities={data.allCities}
    />
  );
}

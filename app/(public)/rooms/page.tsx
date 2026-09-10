import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getPropertyDetailsData } from "@/lib/db/rooms";
import PropertyDetailsView from "@/components/section/rooms/PropertyDetailsView";

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
  }>;
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const querySlug =
    resolvedParams.property ||
    resolvedParams.hotel ||
    resolvedParams.destination ||
    resolvedParams.city ||
    "kattil-the-sparrow";

  const data = await getPropertyDetailsData(querySlug);

  return <PropertyDetailsView data={data} />;
}

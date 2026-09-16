import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyDetailsData } from "@/lib/db/rooms";
import PropertyDetailsView from "@/components/section/rooms/PropertyDetailsView";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPropertyDetailsData(slug);

  return {
    title: `${data.name} in ${data.destinationName} | Rooms & Stays — Kattil`,
    description: `Book your stay at ${data.name}, ${data.destinationName}. Comfortable rooms, premium amenities, Free WiFi, and authentic hospitality.`,
    alternates: {
      canonical: `${SITE_URL}/rooms/${slug}`,
    },
    openGraph: {
      title: `${data.name} | Kattil Stays`,
      description: data.description,
      url: `${SITE_URL}/rooms/${slug}`,
    },
  };
}

export default async function PropertyRoomDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPropertyDetailsData(slug);

  if (!data.entityFound) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rooms", item: `${SITE_URL}/rooms` },
      {
        "@type": "ListItem",
        position: 3,
        name: data.name,
        item: `${SITE_URL}/rooms/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PropertyDetailsView data={data} />
    </>
  );
}

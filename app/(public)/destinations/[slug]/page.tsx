import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDestinationStaysData } from "@/lib/db/destinations";
import DestinationStaysView from "@/components/section/destination/DestinationStaysView";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const data = await getDestinationStaysData(slug, formattedName);

  return {
    title: `Stays & Properties in ${data.cityName} | Kattil — The Homely Hotel`,
    description: `Discover comfortable rooms, homestays, and suites in ${data.cityName} at Kattil. Handpicked stays with warm hospitality and modern amenities.`,
    alternates: {
      canonical: `${SITE_URL}/destinations/${data.citySlug}`,
    },
    openGraph: {
      title: `Properties in ${data.cityName} | Kattil`,
      description: `Explore handpicked stays in ${data.cityName}.`,
      url: `${SITE_URL}/destinations/${data.citySlug}`,
    },
  };
}

export default async function DynamicDestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const data = await getDestinationStaysData(slug, formattedName);

  if (!data.citySlugFound) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE_URL}/destinations` },
      {
        "@type": "ListItem",
        position: 3,
        name: data.cityName,
        item: `${SITE_URL}/destinations/${data.citySlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DestinationStaysView
        cityName={data.cityName}
        citySlug={data.citySlug}
        properties={data.properties}
      />
    </>
  );
}

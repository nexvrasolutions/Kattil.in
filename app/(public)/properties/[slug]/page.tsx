import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyDetailsData } from "@/lib/db/rooms";
import PropertyDetailsView from "@/components/section/rooms/PropertyDetailsView";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ city?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const sParams = searchParams ? await searchParams : {};
    // Same args as the page component's call below, so React's cache() dedupes them
    // into a single invocation instead of running the query chain twice per request.
    const data = await getPropertyDetailsData(slug, "Kanniyakumari", sParams?.city);

    return {
      title: `${data.name} in ${data.destinationName} | Property Details — Kattil`,
      description: `Explore ${data.name} in ${data.destinationName}. Premium amenities, comfortable rooms, and authentic hospitality by Kattil.`,
      alternates: {
        canonical: `${SITE_URL}/properties/${slug}`,
      },
      openGraph: {
        title: `${data.name} | Kattil Stays`,
        description: data.description,
        url: `${SITE_URL}/properties/${slug}`,
      },
    };
  } catch {
    return {
      title: "Property Details — Kattil",
    };
  }
}

const RESERVED_DESTINATION_SLUGS = new Set(["chennai", "madurai", "coimbatore", "colachel"]);

export default async function PropertyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const data = await getPropertyDetailsData(slug, "Kanniyakumari", sParams?.city);

  if (!data.entityFound) {
    notFound();
  }

  const destSlug = (data.destinationSlug || "").toLowerCase().trim();
  const destinationHref = destSlug
    ? RESERVED_DESTINATION_SLUGS.has(destSlug)
      ? `/${destSlug}`
      : `/destinations/${destSlug}`
    : "/destinations";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE_URL}/destinations` },
      ...(data.destinationName
        ? [{ "@type": "ListItem", position: 3, name: data.destinationName, item: `${SITE_URL}${destinationHref}` }]
        : []),
      {
        "@type": "ListItem",
        position: data.destinationName ? 4 : 3,
        name: data.name,
        item: `${SITE_URL}/properties/${slug}`,
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


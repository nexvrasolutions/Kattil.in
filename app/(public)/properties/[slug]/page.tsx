import type { Metadata } from "next";
import { getPropertyDetailsData } from "@/lib/db/rooms";
import PropertyDetailsView from "@/components/section/rooms/PropertyDetailsView";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ city?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPropertyDetailsData(slug);

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
}

export default async function PropertyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const data = await getPropertyDetailsData(slug, "Kanniyakumari", sParams?.city);

  return <PropertyDetailsView data={data} />;
}

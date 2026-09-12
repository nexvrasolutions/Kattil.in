import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import CityModel from "@/lib/models/City";
import GalleryModel from "@/lib/models/Gallery";
import GalleryCategoryModel from "@/lib/models/GalleryCategory";
import GalleryContent, {
  type PublicGalleryItem,
  type PublicGalleryCategory,
  STATIC_ITEMS,
  STATIC_CATEGORIES,
} from "./_content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Photo Gallery | Kattil — The Homely Hotel",
  description:
    "Browse photos of our rooms, common areas, rooftop lounges, dining spaces, and surroundings at Kattil.",
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: {
    title: "Photo Gallery | Kattil — The Homely Hotel",
    description: "Explore Kattil's spaces through our gallery.",
    url: `${SITE_URL}/gallery`,
  },
};

async function getGalleryData(): Promise<{
  items: PublicGalleryItem[];
  categories: PublicGalleryCategory[];
}> {
  try {
    await connectDB();
    const [rawItems, rawCats] = await Promise.all([
      GalleryModel.find({})
        .sort({ order: 1, createdAt: -1 })
        .populate({ path: "city", model: CityModel, select: "name slug" })
        .lean<
          Array<{
            _id: unknown;
            src: string;
            alt: string;
            caption?: string;
            category: string;
            city?: { _id: unknown; name: string; slug: string } | null;
            featured?: boolean;
            order?: number;
            width?: number;
            height?: number;
          }>
        >(),
      GalleryCategoryModel.find({}).sort({ order: 1, name: 1 }).lean<
        Array<{
          _id: unknown;
          name: string;
          slug: string;
          order: number;
        }>
      >(),
    ]);

    const categories: PublicGalleryCategory[] =
      rawCats && rawCats.length > 0
        ? rawCats.map((c) => ({ slug: String(c.slug || c.name).toLowerCase(), name: c.name }))
        : STATIC_CATEGORIES;

    if (!rawItems || rawItems.length === 0) {
      return { items: STATIC_ITEMS, categories };
    }

    const items: PublicGalleryItem[] = rawItems.map((item) => ({
      id: String(item._id),
      src: item.src,
      alt: item.alt || "Kattil Hotel Gallery Space",
      caption: item.caption,
      category: String(item.category || "rooms").toLowerCase(),
      citySlug: item.city?.slug ? String(item.city.slug).toLowerCase() : undefined,
      cityName: item.city?.name ? String(item.city.name) : undefined,
      featured: Boolean(item.featured),
      width: item.width,
      height: item.height,
    }));

    return { items, categories };
  } catch (err) {
    console.error("Error fetching gallery data:", err);
    return {
      items: STATIC_ITEMS,
      categories: STATIC_CATEGORIES,
    };
  }
}

interface PageProps {
  searchParams?: Promise<{ city?: string; category?: string }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const sParams = searchParams ? await searchParams : {};
  const { items, categories } = await getGalleryData();
  return (
    <GalleryContent
      items={items}
      categories={categories}
      initialCity={sParams?.city}
      initialCategory={sParams?.category}
    />
  );
}

import type { Metadata } from "next";
import { SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";
import HeroNavbar from "@/components/layout/hero-navbar";
import DestinationsSection, {
  DestinationItem,
} from "@/components/section/home/destinations-section";
import ComfortSection from "@/components/section/home/comfort-section";
import OffersSection from "@/components/section/home/offers-section";
import TestimonialsSection from "@/components/section/home/testimonials-section";
import { connectDB } from "@/lib/db/mongodb";
import Home from "@/lib/models/Home";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";

export const metadata: Metadata = {
  title: {
    absolute: "Kattil — The Homely Hotel | Chennai & Madurai",
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
};

async function getHomeContent() {
  try {
    await connectDB();
    let home = await Home.findOne().lean();
    if (!home) home = await Home.create({});
    return home as Awaited<ReturnType<typeof Home.findOne>>;
  } catch {
    return null;
  }
}

async function getHomeDestinations(): Promise<DestinationItem[]> {
  try {
    await connectDB();

    const cities = await City.find({ active: { $ne: false } })
      .sort({ order: 1, name: 1 })
      .lean();

    if (!cities || cities.length === 0) return [];

    // None of these three depend on each other's results, so run them concurrently.
    const [propertyCounts, allPropertyCounts, activeProps] = await Promise.all([
      Property.aggregate([
        { $match: { status: { $ne: "inactive" } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
      ]),
      Property.aggregate([{ $group: { _id: "$city", count: { $sum: 1 } } }]),
      Property.find({ status: { $ne: "inactive" } }).select("_id").lean(),
    ]);

    const propertyCountMap = new Map<string, number>();
    for (const p of propertyCounts) {
      if (p._id) propertyCountMap.set(String(p._id), p.count);
    }

    const allPropertyCountMap = new Map<string, number>();
    for (const p of allPropertyCounts) {
      if (p._id) allPropertyCountMap.set(String(p._id), p.count);
    }

    const activePropIds = activeProps.map((p) => p._id);

    const roomCounts = await Room.aggregate([
      {
        $match: {
          status: { $ne: "inactive" },
          $or: [
            { property: { $in: activePropIds } },
            { property: { $exists: false } },
            { property: null },
          ],
        },
      },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const roomCountMap = new Map<string, number>();
    for (const r of roomCounts) {
      if (r._id) roomCountMap.set(String(r._id), r.count);
    }

    const priorityOrder: Record<string, number> = {
      chennai: 1,
      kaniyakumari: 2,
      kanniyakumari: 2,
      kanyakumari: 2,
      coimbatore: 3,
      madurai: 4,
      colachel: 5,
    };

    const activeList = cities
      .map((c) => {
        const idStr = String(c._id);
        const hasProps = (allPropertyCountMap.get(idStr) ?? 0) > 0;
        const count = hasProps
          ? propertyCountMap.get(idStr) ?? 0
          : roomCountMap.get(idStr) ?? 0;

        const isKanya =
          c.slug === "kaniyakumari" ||
          c.slug === "kanyakumari" ||
          c.slug === "kanniyakumari" ||
          /kany|kaniy/i.test(c.name);

        let destinationLink = isKanya
          ? "/kaniyakumari"
          : c.link?.trim() ||
            (c.slug === "chennai"
              ? "/chennai"
              : c.slug === "coimbatore"
                ? "/coimbatore"
                : c.slug === "madurai"
                  ? "/madurai"
                  : c.slug === "colachel"
                    ? "/colachel"
                    : `/destinations/${c.slug}`);

        let destinationImage = c.image?.trim() || c.banner?.trim();
        if (
          !destinationImage ||
          (c.slug === "chennai" && destinationImage.includes("kanyakumari"))
        ) {
          if (c.slug === "chennai")
            destinationImage = "/images/destinations/chennai.png";
          else if (isKanya)
            destinationImage = "/images/destinations/kanyakumari.png";
          else if (c.slug === "coimbatore")
            destinationImage = "/images/destinations/coimbatore.png";
          else if (c.slug === "madurai")
            destinationImage = "/images/destinations/madurai.png";
          else if (c.slug === "colachel")
            destinationImage = "/images/destinations/kanyakumari.png";
          else destinationImage = "/images/destinations/chennai.png";
        }

        const displayName =
          c.name ||
          (c.slug === "chennai"
            ? "Chennai"
            : c.slug === "madurai"
              ? "Madurai"
              : c.slug === "coimbatore"
                ? "Coimbatore"
                : isKanya
                  ? "Kaniyakumari"
                  : c.slug === "colachel"
                    ? "Colachel"
                    : c.slug);

        return {
          id: idStr,
          name: displayName,
          pillLabel: displayName,
          image: destinationImage,
          href: destinationLink,
          slug: c.slug,
          count,
        };
      })
      .filter((d) => d.count > 0)
      .sort((a, b) => {
        const pA = priorityOrder[a.slug ?? ""] ?? 99;
        const pB = priorityOrder[b.slug ?? ""] ?? 99;
        return pA - pB;
      });

    if (activeList.length === 0) return [];

    const baseItems: DestinationItem[] = activeList.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.name,
      pillLabel: item.pillLabel,
      image: item.image,
      href: item.href,
    }));

    return [
      ...baseItems,
      {
        id: "view-all",
        name: "View all our Destination",
        pillLabel: "",
        image: "/images/destinations/destination-card-bg.png",
        href: "/destinations",
        isViewAll: true,
      },
    ];
  } catch {
    return [];
  }
}

export default async function Home_Page() {
  const [home, initialDestinations] = await Promise.all([
    getHomeContent(),
    getHomeDestinations(),
  ]);

  return (
    <div className="bg-[#FFFCF2]">
      <HeroNavbar
        heroEyebrow={home?.hero?.eyebrow ?? "The Homely Reset"}
        heroLine1={home?.hero?.headlineLine1 ?? "Find your perfect"}
        heroLine2={home?.hero?.headlineLine2 ?? "experience"}
      />
      <DestinationsSection initialDestinations={initialDestinations} />
      <ComfortSection />
      <OffersSection />
      <TestimonialsSection />
    </div>
  );
}

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import AllDestinationsView, {
  DestinationItemData,
} from "@/components/section/destination/AllDestinationsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Destinations to Discover | Kattil — Handpicked Stays & Properties",
  description:
    "Explore handpicked destinations and comfortable hotel stays across Tamil Nadu with Kattil. Find your perfect stay in Chennai, Madurai and more.",
  keywords: [
    "Kattil destinations",
    "hotels in Tamil Nadu",
    "stays in Chennai",
    "hotels in Madurai",
  ],
  alternates: {
    canonical: `${SITE_URL}/destinations`,
  },
  openGraph: {
    title: "Destinations to Discover | Kattil — Handpicked Stays",
    description:
      "Explore handpicked destinations and comfortable hotel stays across Tamil Nadu with Kattil.",
    url: `${SITE_URL}/destinations`,
  },
};

export default async function DestinationsPage() {
  let destinations: DestinationItemData[] = [];

  try {
    await connectDB();

    const cityFilter = {
      active: { $ne: false },
    };

    const cities = await City.find(cityFilter).sort({ order: 1, name: 1 }).lean();

    // Count active properties per city
    const propertyCounts = await Property.aggregate([
      { $match: { status: { $ne: "inactive" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const propertyCountMap = new Map<string, number>();
    for (const p of propertyCounts) {
      if (p._id) propertyCountMap.set(String(p._id), p.count);
    }

    const allPropertyCounts = await Property.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const allPropertyCountMap = new Map<string, number>();
    for (const p of allPropertyCounts) {
      if (p._id) allPropertyCountMap.set(String(p._id), p.count);
    }

    const activeProps = await Property.find({ status: { $ne: "inactive" } }).select("_id").lean();
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

    if (cities && cities.length > 0) {
      destinations = cities
        .map((c) => {
          const idStr = String(c._id);
          const hasProps = (allPropertyCountMap.get(idStr) ?? 0) > 0;
          let count = 0;
          if (hasProps) {
            count = propertyCountMap.get(idStr) ?? 0;
          } else {
            count = roomCountMap.get(idStr) ?? 0;
          }

          let destinationLink = c.link?.trim();
          if (!destinationLink) {
            if (c.slug === "chennai") destinationLink = "/chennai";
            else if (c.slug === "coimbatore") destinationLink = "/coimbatore";
            else if (c.slug === "madurai") destinationLink = "/madurai";
            else if (c.slug === "colachel") destinationLink = "/colachel";
            else destinationLink = `/destinations/${c.slug}`;
          }

          let destinationImage = c.image?.trim() || c.banner?.trim();
          if (!destinationImage || (c.slug === "chennai" && destinationImage.includes("kanyakumari"))) {
            if (c.slug === "chennai")
              destinationImage = "/images/destinations/chennai.png";
            else if (c.slug === "coimbatore")
              destinationImage = "/images/destinations/coimbatore.png";
            else if (c.slug === "madurai")
              destinationImage = "/images/destinations/madurai.png";
            else if (c.slug === "colachel")
              destinationImage = "/images/destinations/kanyakumari.png";
            else destinationImage = "/images/destinations/chennai.png";
          }

          const customHotelCount = c.hotelCount?.trim();
          const hotelCount =
            customHotelCount || (count > 0 ? `${count} ${count === 1 ? "hotel" : "hotels"}` : "");

          return {
            _id: idStr,
            name: c.name,
            slug: c.slug,
            image: destinationImage,
            hotelCount,
            link: destinationLink,
            order: c.order ?? 0,
            count,
          };
        })
        .filter((d) => {
          if (d.hotelCount && d.hotelCount.toLowerCase().includes("coming soon")) {
            return false;
          }
          return d.count > 0;
        });
    }
  } catch (err) {
    console.error("Error fetching destinations for page:", err);
  }

  return <AllDestinationsView destinations={destinations} />;
}

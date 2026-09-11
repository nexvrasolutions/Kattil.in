import mongoose from "mongoose";
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
    "Explore handpicked destinations and comfortable hotel stays across Tamil Nadu with Kattil. Find your perfect stay in Chennai, Coimbatore, Madurai, Kanniyakumari and more.",
  keywords: [
    "Kattil destinations",
    "hotels in Tamil Nadu",
    "stays in Chennai",
    "hotels in Coimbatore",
    "hotels in Madurai",
    "hotels in Kanyakumari",
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

    const activeProperties = await Property.find({ status: "active" }).select("city").lean();
    const activeCityIdSet = new Set<string>();
    for (const p of activeProperties) {
      if (p.city) activeCityIdSet.add(String(p.city));
    }

    const totalPropertiesCount = await Property.countDocuments();
    if (totalPropertiesCount === 0) {
      const activeRooms = await Room.find({ status: "active" }).select("city").lean();
      for (const r of activeRooms) {
        if (r.city) activeCityIdSet.add(String(r.city));
      }
    }

    if (activeCityIdSet.size > 0) {
      const cityFilter = {
        active: { $ne: false },
        _id: { $in: Array.from(activeCityIdSet).map((id) => new mongoose.Types.ObjectId(id)) },
      };

      const cities = await City.find(cityFilter).sort({ order: 1, name: 1 }).lean();

      if (cities && cities.length > 0) {
        destinations = cities.map((c) => {
          let destinationLink = c.link?.trim();
          if (!destinationLink) {
            if (c.slug === "chennai") destinationLink = "/chennai";
            else if (c.slug === "coimbatore") destinationLink = "/coimbatore";
            else if (c.slug === "madurai") destinationLink = "/madurai";
            else destinationLink = `/destinations/${c.slug}`;
          }

          let destinationImage = c.image?.trim() || c.banner?.trim();
          if (!destinationImage) {
            if (c.slug === "coimbatore")
              destinationImage = "/images/destinations/coimbatore.png";
            else if (c.slug === "madurai")
              destinationImage = "/images/destinations/madurai.png";
            else destinationImage = "/images/destinations/kanyakumari.png";
          }

          return {
            _id: String(c._id),
            name: c.name,
            slug: c.slug,
            image: destinationImage,
            hotelCount: c.hotelCount?.trim() || "1 hotels",
            link: destinationLink,
            order: c.order ?? 0,
          };
        });
      }
    }
  } catch (err) {
    console.error("Error fetching destinations for page:", err);
  }

  return <AllDestinationsView destinations={destinations} />;
}

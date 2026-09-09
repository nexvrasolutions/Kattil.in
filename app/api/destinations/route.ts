import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Room from "@/lib/models/Room";
import { apiSuccess } from "@/lib/utils/api";

export const DEFAULT_DESTINATIONS = [
  {
    _id: "default-chennai",
    name: "Chennai",
    slug: "chennai",
    image: "/images/destinations/kanyakumari.png",
    hotelCount: "2 hotels",
    link: "/chennai",
    order: 1,
  },
  {
    _id: "default-kanniyakumari",
    name: "Kanniyakumari",
    slug: "kanniyakumari",
    image: "/images/destinations/kanyakumari.png",
    hotelCount: "1 hotels",
    link: "/destinations/kanniyakumari",
    order: 2,
  },
  {
    _id: "default-coimbatore",
    name: "Coimbatore",
    slug: "coimbatore",
    image: "/images/destinations/coimbatore.png",
    hotelCount: "2 hotels",
    link: "/coimbatore",
    order: 3,
  },
  {
    _id: "default-madurai",
    name: "Madurai",
    slug: "madurai",
    image: "/images/destinations/madurai.png",
    hotelCount: "2 hotels",
    link: "/madurai",
    order: 4,
  },
];

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const cities = await City.find({ active: true }).sort({ order: 1, name: 1 }).lean();

    if (!cities || cities.length === 0) {
      return apiSuccess(DEFAULT_DESTINATIONS);
    }

    // Fetch room counts to auto-calculate hotelCount if not set
    const roomCounts = await Room.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const roomCountMap = new Map<string, number>();
    for (const r of roomCounts) {
      if (r._id) roomCountMap.set(String(r._id), r.count);
    }

    const destinations = cities.map((c) => {
      const idStr = String(c._id);
      const roomCount = roomCountMap.get(idStr) ?? 1;

      // Smart link resolution
      let destinationLink = c.link?.trim();
      if (!destinationLink) {
        if (c.slug === "chennai") destinationLink = "/chennai";
        else if (c.slug === "coimbatore") destinationLink = "/coimbatore";
        else if (c.slug === "madurai") destinationLink = "/madurai";
        else destinationLink = `/destinations/${c.slug}`;
      }

      // Smart thumbnail image resolution
      let destinationImage = c.image?.trim() || c.banner?.trim();
      if (!destinationImage) {
        if (c.slug === "coimbatore") destinationImage = "/images/destinations/coimbatore.png";
        else if (c.slug === "madurai") destinationImage = "/images/destinations/madurai.png";
        else destinationImage = "/images/destinations/kanyakumari.png";
      }

      // Hotel count subtitle
      const hotelCount =
        c.hotelCount?.trim() ||
        `${roomCount} hotel${roomCount === 1 ? "" : "s"}`;

      return {
        _id: idStr,
        name: c.name,
        slug: c.slug,
        image: destinationImage,
        hotelCount,
        link: destinationLink,
        order: c.order ?? 0,
      };
    });

    return apiSuccess(destinations);
  } catch (error) {
    console.error("[GET /api/destinations]", error);
    // Return graceful fallback in case of DB connection error during initial setup
    return apiSuccess(DEFAULT_DESTINATIONS);
  }
}

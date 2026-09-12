import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { apiSuccess } from "@/lib/utils/api";

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const cityFilter = {
      active: { $ne: false },
    };

    const cities = await City.find(cityFilter).sort({ order: 1, name: 1 }).lean();

    if (!cities || cities.length === 0) {
      return apiSuccess([]);
    }

    // Count active properties per city
    const propertyCounts = await Property.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const propertyCountMap = new Map<string, number>();
    for (const p of propertyCounts) {
      if (p._id) propertyCountMap.set(String(p._id), p.count);
    }

    // Count active rooms per city (fallback)
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
      const propCount = propertyCountMap.get(idStr);
      const roomCount = roomCountMap.get(idStr) ?? (c.hotelCount ? parseInt(c.hotelCount, 10) || 1 : 1);
      const count = propCount !== undefined && propCount > 0 ? propCount : roomCount;

      // Smart link resolution
      let destinationLink = c.link?.trim();
      if (!destinationLink) {
        if (c.slug === "chennai") destinationLink = "/chennai";
        else if (c.slug === "coimbatore") destinationLink = "/coimbatore";
        else if (c.slug === "madurai") destinationLink = "/madurai";
        else if (c.slug === "colachel") destinationLink = "/colachel";
        else destinationLink = `/destinations/${c.slug}`;
      }

      // Smart thumbnail image resolution
      let destinationImage = c.image?.trim() || c.banner?.trim();
      if (!destinationImage) {
        if (c.slug === "coimbatore") destinationImage = "/images/destinations/coimbatore.png";
        else if (c.slug === "madurai") destinationImage = "/images/destinations/madurai.png";
        else if (c.slug === "colachel") destinationImage = "/images/destinations/kanyakumari.png";
        else destinationImage = "/images/destinations/kanyakumari.png";
      }

      // Hotel count subtitle
      const hotelCount =
        c.hotelCount?.trim() ||
        `${count} ${count === 1 ? "hotel" : "hotels"}`;

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
    return apiSuccess([]);
  }
}

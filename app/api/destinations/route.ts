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
      { $match: { status: { $ne: "inactive" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const propertyCountMap = new Map<string, number>();
    for (const p of propertyCounts) {
      if (p._id) propertyCountMap.set(String(p._id), p.count);
    }

    // Count all properties per city in DB (to distinguish 0 active vs no records)
    const allPropertyCounts = await Property.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const allPropertyCountMap = new Map<string, number>();
    for (const p of allPropertyCounts) {
      if (p._id) allPropertyCountMap.set(String(p._id), p.count);
    }

    // Get active property IDs
    const activeProps = await Property.find({ status: { $ne: "inactive" } }).select("_id").lean();
    const activePropIds = activeProps.map((p) => p._id);

    // Count active rooms per city (fallback)
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

    const destinations = cities.map((c) => {
      const idStr = String(c._id);
      const hasProps = (allPropertyCountMap.get(idStr) ?? 0) > 0;
      let count = 0;
      if (hasProps) {
        count = propertyCountMap.get(idStr) ?? 0;
      } else {
        count = roomCountMap.get(idStr) ?? 0;
      }

      // Smart link resolution
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

      // Smart thumbnail image resolution
      let destinationImage = c.image?.trim() || c.banner?.trim();
      if (!destinationImage || (c.slug === "chennai" && destinationImage.includes("kanyakumari"))) {
        if (c.slug === "chennai") destinationImage = "/images/destinations/chennai.png";
        else if (isKanya) destinationImage = "/images/destinations/kanyakumari.png";
        else if (c.slug === "coimbatore") destinationImage = "/images/destinations/coimbatore.png";
        else if (c.slug === "madurai") destinationImage = "/images/destinations/madurai.png";
        else if (c.slug === "colachel") destinationImage = "/images/destinations/kanyakumari.png";
        else destinationImage = "/images/destinations/chennai.png";
      }

      // Hotel count subtitle
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
    }).filter((d) => {
      // Exclude inactive destinations and "Coming Soon"
      if (d.hotelCount && d.hotelCount.toLowerCase().includes("coming soon")) {
        return false;
      }
      return d.count > 0;
    });

    return apiSuccess(destinations);
  } catch (error) {
    console.error("[GET /api/destinations]", error);
    return apiSuccess([]);
  }
}

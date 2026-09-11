import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { apiSuccess } from "@/lib/utils/api";

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    // 1. Find all active properties to determine which destinations are active
    const activeProperties = await Property.find({ status: "active" }).select("city").lean();
    const activeCityIdSet = new Set<string>();
    for (const p of activeProperties) {
      if (p.city) activeCityIdSet.add(String(p.city));
    }

    // Fallback: If no Property records exist yet in the database, check legacy active rooms
    const totalPropertiesCount = await Property.countDocuments();
    if (totalPropertiesCount === 0) {
      const activeRooms = await Room.find({ status: "active" }).select("city").lean();
      for (const r of activeRooms) {
        if (r.city) activeCityIdSet.add(String(r.city));
      }
    }

    if (activeCityIdSet.size === 0) {
      return apiSuccess([]);
    }

    const cityFilter = {
      active: { $ne: false },
      _id: { $in: Array.from(activeCityIdSet).map((id) => new mongoose.Types.ObjectId(id)) },
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
      const roomCount = roomCountMap.get(idStr) ?? 1;
      const count = propCount !== undefined && propCount > 0 ? propCount : roomCount;

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

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Room from "@/lib/models/Room";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const cityParam = searchParams.get("city")?.toLowerCase().trim();
    const propertyParam = searchParams.get("property")?.toLowerCase().trim() || searchParams.get("propertyId")?.trim();

    if (propertyParam) {
      let propDoc: any = null;
      if (propertyParam.match(/^[0-9a-fA-F]{24}$/)) {
        propDoc = await Property.findById(propertyParam).lean();
      }
      if (!propDoc) {
        propDoc = await Property.findOne({ slug: propertyParam }).lean();
      }

      const query: Record<string, unknown> = { status: { $ne: "inactive" } };
      if (propDoc) {
        query.property = propDoc._id;
      }

      const rooms = await Room.find(query)
        .sort({ order: 1, createdAt: -1 })
        .populate("property", "name slug badge")
        .populate("city", "name slug")
        .lean();

      return apiSuccess({
        property: propDoc ? { _id: propDoc._id, name: propDoc.name, slug: propDoc.slug } : null,
        count: rooms.length,
        rooms,
      });
    }

    const cities = await City.find({ active: true }).sort({ order: 1 }).lean();
    const rooms = await Room.find({ status: { $ne: "inactive" } })
      .sort({ order: 1, createdAt: -1 })
      .populate("property", "name slug badge")
      .populate("city", "name slug")
      .lean();

    // If a specific city was requested, filter directly
    if (cityParam) {
      const filtered = rooms.filter((r) => {
        const c = r.city as unknown as { _id?: string; name?: string; slug?: string } | null;
        if (!c) return false;
        return (
          c.slug?.toLowerCase() === cityParam ||
          c.name?.toLowerCase() === cityParam ||
          String(c._id) === cityParam
        );
      });

      return apiSuccess({
        city: cityParam,
        count: filtered.length,
        rooms: filtered,
      });
    }

    return apiSuccess({ cities, rooms });
  } catch (error) {
    console.error("[GET /api/rooms]", error);
    return apiError("Internal server error", 500);
  }
}

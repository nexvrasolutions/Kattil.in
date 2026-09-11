import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Property from "@/lib/models/Property";
import City from "@/lib/models/City";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const cityParam = searchParams.get("city")?.toLowerCase().trim();

    const properties = await Property.find({ status: { $ne: "inactive" } })
      .sort({ order: 1, createdAt: -1 })
      .populate("city", "name slug")
      .lean();

    if (cityParam) {
      const filtered = properties.filter((p) => {
        const c = p.city as unknown as { _id?: string; name?: string; slug?: string } | null;
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
        properties: filtered,
      });
    }

    return apiSuccess({ count: properties.length, properties });
  } catch (error) {
    console.error("[GET /api/properties]", error);
    return apiError("Internal server error", 500);
  }
}

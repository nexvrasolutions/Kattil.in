import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { apiSuccess, apiError, handleApiError, slugify, getPaginationParams } from "@/lib/utils/api";
import { propertySchema } from "@/lib/validations";
import { clearDestinationsCache } from "@/lib/db/destinations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const search = searchParams.get("search") ?? "";
    const city = searchParams.get("city") ?? "";
    const status = searchParams.get("status") ?? "";
    const featured = searchParams.get("featured") ?? "";

    const filter: Record<string, unknown> = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (city) filter.city = city;
    if (status) filter.status = status;
    if (featured === "true") filter.featured = true;
    if (featured === "false") filter.featured = false;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("city", "name slug"),
      Property.countDocuments(filter),
    ]);

    // Count rooms for each property
    const propertyIds = properties.map((p) => p._id);
    const roomCounts = await Room.aggregate([
      { $match: { property: { $in: propertyIds } } },
      { $group: { _id: "$property", count: { $sum: 1 } } },
    ]);
    const roomCountMap = Object.fromEntries(roomCounts.map((r) => [String(r._id), r.count]));

    const enriched = properties.map((p) => ({
      ...p.toObject(),
      roomCount: roomCountMap[String(p._id)] || 0,
    }));

    return apiSuccess({
      properties: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/properties]", error);
    return apiError("Failed to fetch properties", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return apiError(msg, 400);
    }

    const { cityId, ...rest } = parsed.data;
    const createData = Object.fromEntries(
      Object.entries({ ...rest, city: cityId }).filter(([, v]) => v !== undefined)
    );

    let slug = rest.slug ? slugify(rest.slug) : slugify(rest.name);
    const existing = await Property.findOne({ slug, city: cityId });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const property = await Property.create({ ...createData, slug });
    const populated = await property.populate("city", "name slug");

    clearDestinationsCache();
    try {
      revalidatePath("/chennai");
      revalidatePath("/madurai");
      revalidatePath("/coimbatore");
      revalidatePath("/destinations");
      revalidatePath(`/properties/${slug}`);
      revalidatePath("/");
    } catch {}

    return apiSuccess(populated, 201);
  } catch (error) {
    console.error("[POST /api/admin/properties]", error);
    return handleApiError(error);
  }
}

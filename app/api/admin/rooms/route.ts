import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Room from "@/lib/models/Room";
import { apiSuccess, apiError, handleApiError, slugify, getPaginationParams } from "@/lib/utils/api";
import { roomSchema } from "@/lib/validations";
import { clearDestinationsCache } from "@/lib/db/destinations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const search   = searchParams.get("search")   ?? "";
    const city     = searchParams.get("city")     ?? "";
    const category = searchParams.get("category") ?? "";
    const status   = searchParams.get("status")   ?? "";
    const featured = searchParams.get("featured") ?? "";

    const filter: Record<string, unknown> = {};
    if (search)            filter.name     = { $regex: search, $options: "i" };
    if (city)              filter.city     = city;
    if (category)          filter.category = category;
    if (status)            filter.status   = status;
    if (featured === "true")  filter.featured = true;
    if (featured === "false") filter.featured = false;

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("city", "name slug"),
      Room.countDocuments(filter),
    ]);

    return apiSuccess({ rooms, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/admin/rooms]", error);
    return apiError("Failed to fetch rooms", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const parsed = roomSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return apiError(msg, 400);
    }

    // ── Map Zod's "cityId" → Mongoose's "city" ────────────────────────────────
    const { cityId, ...rest } = parsed.data;

    // Strip undefined values — let Mongoose model defaults handle missing fields
    const createData = Object.fromEntries(
      Object.entries({ ...rest, city: cityId }).filter(([, v]) => v !== undefined)
    );

    let slug = slugify(rest.name);
    const existing = await Room.findOne({ slug, city: cityId });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const room = await Room.create({ ...createData, slug });
    const populated = await room.populate("city", "name slug");

    // Invalidate destination caches and revalidate public routes
    clearDestinationsCache();
    try {
      revalidatePath("/chennai");
      revalidatePath("/madurai");
      revalidatePath("/coimbatore");
      revalidatePath("/destinations");
      revalidatePath("/rooms");
      revalidatePath("/");
    } catch {}

    return apiSuccess(populated, 201);
  } catch (error) {
    console.error("[POST /api/admin/rooms]", error);
    return handleApiError(error);
  }
}

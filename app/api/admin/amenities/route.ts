import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Amenity from "@/lib/models/Amenity";
import { apiSuccess, apiError, handleApiError } from "@/lib/utils/api";
import { amenitySchema } from "@/lib/validations";
import { exactNameRegex } from "@/lib/amenities";
import { getAmenityUsage } from "@/lib/db/amenities";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const visible = searchParams.get("visible") ?? "";
    const limit   = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));
    const withUsage = searchParams.get("usage") === "true";

    const filter: Record<string, unknown> = {};
    if (visible === "true")  filter.visible = true;
    if (visible === "false") filter.visible = false;

    const [amenities, usage] = await Promise.all([
      Amenity.find(filter).sort({ order: 1, name: 1 }).limit(limit).lean(),
      withUsage ? getAmenityUsage() : Promise.resolve(null),
    ]);

    if (!usage) return apiSuccess({ amenities });
    return apiSuccess({
      amenities: amenities.map((a) => ({ ...a, usage: usage[a.name] ?? { rooms: 0, properties: 0 } })),
    });
  } catch (error) {
    console.error("[GET /api/admin/amenities]", error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = amenitySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const duplicate = await Amenity.exists({ name: exactNameRegex(parsed.data.name) });
    if (duplicate) return apiError(`An amenity named "${parsed.data.name}" already exists.`, 409);

    const count = await Amenity.countDocuments();
    const amenity = await Amenity.create({ ...parsed.data, order: parsed.data.order ?? count });
    return apiSuccess(amenity, 201);
  } catch (error) {
    console.error("[POST /api/admin/amenities]", error);
    return handleApiError(error);
  }
}

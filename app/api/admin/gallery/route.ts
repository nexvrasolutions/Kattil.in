import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Gallery from "@/lib/models/Gallery";
import { clearPropertyCache } from "@/lib/db/rooms";
import { apiSuccess, apiError, handleApiError, getPaginationParams } from "@/lib/utils/api";
import { gallerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const category = searchParams.get("category") ?? "";
    const city = searchParams.get("city") ?? "";
    const featured = searchParams.get("featured") ?? "";

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (featured === "true") filter.featured = true;

    const [items, total] = await Promise.all([
      Gallery.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("city", "name"),
      Gallery.countDocuments(filter),
    ]);

    return apiSuccess({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/admin/gallery]", error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const count = await Gallery.countDocuments();
    const item = await Gallery.create({ ...parsed.data, order: count });

    clearPropertyCache();
    revalidatePath("/gallery");
    revalidatePath("/properties", "layout");
    revalidatePath("/", "layout");

    return apiSuccess(item, 201);
  } catch (error) {
    console.error("[POST /api/admin/gallery]", error);
    return handleApiError(error);
  }
}


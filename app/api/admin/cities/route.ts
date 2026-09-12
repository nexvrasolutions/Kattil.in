import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import { clearDestinationsCache } from "@/lib/db/destinations";
import { apiSuccess, apiError, handleApiError, slugify, getPaginationParams } from "@/lib/utils/api";
import { citySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") ?? "";

    const filter: Record<string, unknown> = {};
    if (search) filter.name = { $regex: search, $options: "i" };

    const [cities, total] = await Promise.all([
      City.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit),
      City.countDocuments(filter),
    ]);

    return apiSuccess({ cities, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/admin/cities]", error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = citySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const slug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(parsed.data.name);
    const existing = await City.findOne({ slug });
    if (existing) return apiError("A city/destination with this slug already exists", 409);

    const city = await City.create({ ...parsed.data, slug });

    // Invalidate caches & revalidate website pages
    clearDestinationsCache(slug);
    clearDestinationsCache();
    try {
      revalidatePath("/");
      revalidatePath("/destinations");
      revalidatePath("/rooms");
      revalidatePath("/gallery");
      revalidatePath("/contact");
      revalidatePath(`/${slug}`);
      revalidatePath(`/destinations/${slug}`);
    } catch (e) {
      console.warn("[POST /api/admin/cities] Revalidation warning:", e);
    }

    return apiSuccess(city, 201);
  } catch (error) {
    console.error("[POST /api/admin/cities]", error);
    return handleApiError(error);
  }
}

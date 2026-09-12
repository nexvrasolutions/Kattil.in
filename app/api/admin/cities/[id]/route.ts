import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Room from "@/lib/models/Room";
import Property from "@/lib/models/Property";
import Gallery from "@/lib/models/Gallery";
import { clearDestinationsCache } from "@/lib/db/destinations";
import { apiSuccess, apiError, handleApiError, slugify } from "@/lib/utils/api";
import { updateCitySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const city = await City.findById(id);
    if (!city) return apiError("City not found", 404);
    return apiSuccess(city);
  } catch (error) {
    console.error("[GET /api/admin/cities/[id]]", error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCitySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.slug?.trim()) {
      updateData.slug = slugify(parsed.data.slug);
    } else if (parsed.data.name) {
      updateData.slug = slugify(parsed.data.name);
    }

    const city = await City.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!city) return apiError("City not found", 404);

    // Invalidate caches & revalidate website pages
    clearDestinationsCache(city.slug);
    clearDestinationsCache();
    try {
      revalidatePath("/");
      revalidatePath("/destinations");
      revalidatePath("/rooms");
      revalidatePath("/gallery");
      revalidatePath("/contact");
      revalidatePath(`/${city.slug}`);
      revalidatePath(`/destinations/${city.slug}`);
    } catch (e) {
      console.warn("[PUT /api/admin/cities/[id]] Revalidation warning:", e);
    }

    return apiSuccess(city);
  } catch (error) {
    console.error("[PUT /api/admin/cities/[id]]", error);
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const city = await City.findById(id);
    if (!city) return apiError("City not found", 404);

    const oldSlug = city.slug;

    // Unlink any rooms referencing this destination
    await Room.updateMany({ city: id }, { $unset: { city: 1 } });

    // Unlink any properties referencing this destination
    await Property.updateMany({ city: id }, { $unset: { city: 1 } });

    // Unlink any gallery items referencing this destination
    await Gallery.updateMany({ city: id }, { $unset: { city: 1 } });

    // Delete the destination record
    await City.findByIdAndDelete(id);

    // Invalidate destination in-memory caches
    clearDestinationsCache(oldSlug);
    clearDestinationsCache();

    // Revalidate frontend pages so changes reflect instantly
    try {
      revalidatePath("/");
      revalidatePath("/destinations");
      revalidatePath("/rooms");
      revalidatePath("/gallery");
      revalidatePath("/contact");
      revalidatePath(`/${oldSlug}`);
      revalidatePath(`/destinations/${oldSlug}`);
    } catch (e) {
      console.warn("[DELETE /api/admin/cities/[id]] Revalidation warning:", e);
    }

    return apiSuccess({ deleted: true, id, slug: oldSlug });
  } catch (error) {
    console.error("[DELETE /api/admin/cities/[id]]", error);
    return handleApiError(error);
  }
}

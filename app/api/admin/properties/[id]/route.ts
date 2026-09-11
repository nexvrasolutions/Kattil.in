import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { apiSuccess, apiError, handleApiError, slugify } from "@/lib/utils/api";
import { deleteUploadedFiles } from "@/lib/utils/fileCleanup";
import { updatePropertySchema } from "@/lib/validations";
import { clearDestinationsCache } from "@/lib/db/destinations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const property = await Property.findById(id).populate("city", "name slug");
    if (!property) return apiError("Property not found", 404);

    const rooms = await Room.find({ property: id }).sort({ order: 1, createdAt: -1 }).lean();

    return apiSuccess({ ...property.toObject(), rooms });
  } catch (error) {
    console.error("[GET /api/admin/properties/[id]]", error);
    return apiError("Failed to fetch property", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const parsed = updatePropertySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return apiError(msg, 400);
    }

    const { cityId, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    );
    if (cityId) updateData.city = cityId;

    if (rest.name || rest.slug) {
      const newSlug = rest.slug ? slugify(rest.slug) : slugify(rest.name!);
      updateData.slug = newSlug;

      let effectiveCity: string;
      if (cityId) {
        effectiveCity = cityId;
      } else {
        const current = (await Property.findById(id).select("city").lean()) as { city: string } | null;
        if (!current) return apiError("Property not found", 404);
        effectiveCity = String(current.city);
      }

      const conflict = await Property.findOne({ slug: newSlug, city: effectiveCity, _id: { $ne: id } });
      if (conflict) {
        updateData.slug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("city", "name slug");

    if (!property) return apiError("Property not found", 404);

    clearDestinationsCache();
    try {
      revalidatePath("/chennai");
      revalidatePath("/madurai");
      revalidatePath("/coimbatore");
      revalidatePath("/destinations");
      revalidatePath(`/properties/${property.slug}`);
      revalidatePath("/");
    } catch {}

    return apiSuccess(property);
  } catch (error) {
    console.error("[PUT /api/admin/properties/[id]]", error);
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const property = await Property.findByIdAndDelete(id);
    if (!property) return apiError("Property not found", 404);

    await deleteUploadedFiles(property.images ?? []);

    // Also unassign or remove rooms for this property
    await Room.updateMany({ property: id }, { $unset: { property: "" } });

    clearDestinationsCache();
    try {
      revalidatePath("/chennai");
      revalidatePath("/madurai");
      revalidatePath("/coimbatore");
      revalidatePath("/destinations");
      revalidatePath("/");
    } catch {}

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/admin/properties/[id]]", error);
    return apiError("Failed to delete property", 500);
  }
}

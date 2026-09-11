import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Room from "@/lib/models/Room";
import Property from "@/lib/models/Property";
import { apiSuccess, apiError, handleApiError, slugify } from "@/lib/utils/api";
import { deleteUploadedFiles } from "@/lib/utils/fileCleanup";
import { updateRoomSchema } from "@/lib/validations";
import { clearDestinationsCache } from "@/lib/db/destinations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const room = await Room.findById(id)
      .populate("property", "name slug badge city")
      .populate("city", "name slug");
    if (!room) return apiError("Room not found", 404);
    return apiSuccess(room);
  } catch (error) {
    console.error("[GET /api/admin/rooms/[id]]", error);
    return apiError("Failed to fetch room", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const parsed = updateRoomSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return apiError(msg, 400);
    }

    const { propertyId, cityId, price, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    );

    if (propertyId !== undefined) {
      updateData.property = propertyId || null;
      if (propertyId) {
        const prop = await Property.findById(propertyId).select("city").lean();
        if (prop?.city) updateData.city = prop.city;
      }
    }
    if (cityId !== undefined && !propertyId) {
      updateData.city = cityId || null;
    }

    if (price !== undefined) {
      updateData.pricing = [{ label: "Base Price", value: typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : String(price) }];
    }

    if (rest.name) {
      const newSlug = slugify(rest.name);
      updateData.slug = newSlug;

      const current = await Room.findById(id).select("property city").lean();
      const effProperty = propertyId !== undefined ? propertyId : current?.property;
      const effCity = cityId !== undefined ? cityId : current?.city;

      const conflictQuery: Record<string, unknown> = { slug: newSlug, _id: { $ne: id } };
      if (effProperty) conflictQuery.property = effProperty;
      else if (effCity) conflictQuery.city = effCity;

      const conflict = await Room.findOne(conflictQuery);
      if (conflict) {
        updateData.slug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const room = await Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("property", "name slug badge")
      .populate("city", "name slug");

    if (!room) return apiError("Room not found", 404);

    clearDestinationsCache();
    try {
      revalidatePath("/chennai");
      revalidatePath("/madurai");
      revalidatePath("/coimbatore");
      revalidatePath("/destinations");
      revalidatePath("/rooms");
      revalidatePath("/");
    } catch {}

    return apiSuccess(room);
  } catch (error) {
    console.error("[PUT /api/admin/rooms/[id]]", error);
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const room = await Room.findByIdAndDelete(id);
    if (!room) return apiError("Room not found", 404);
    await deleteUploadedFiles(room.images ?? []);

    clearDestinationsCache();
    try {
      revalidatePath("/chennai");
      revalidatePath("/madurai");
      revalidatePath("/coimbatore");
      revalidatePath("/destinations");
      revalidatePath("/rooms");
      revalidatePath("/");
    } catch {}

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/admin/rooms/[id]]", error);
    return apiError("Failed to delete room", 500);
  }
}

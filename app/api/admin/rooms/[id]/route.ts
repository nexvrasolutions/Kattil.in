import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Room from "@/lib/models/Room";
import { apiSuccess, apiError, handleApiError, slugify } from "@/lib/utils/api";
import { deleteUploadedFiles } from "@/lib/utils/fileCleanup";
import { updateRoomSchema } from "@/lib/validations";
import { clearDestinationsCache } from "@/lib/db/destinations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const room = await Room.findById(id).populate("city", "name slug");
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

    // ── Map Zod's "cityId" → Mongoose's "city" and strip undefined values ────
    const { cityId, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    );
    if (cityId) updateData.city = cityId;

    // When name changes, check for slug conflict within the same property
    if (rest.name) {
      const newSlug = slugify(rest.name);
      updateData.slug = newSlug;

      // Resolve effective city: use the new cityId if provided, else read the current room's city
      let effectiveCity: string;
      if (cityId) {
        effectiveCity = cityId;
      } else {
        const current = await Room.findById(id).select("city").lean() as { city: string } | null;
        if (!current) return apiError("Room not found", 404);
        effectiveCity = String(current.city);
      }

      const conflict = await Room.findOne({ slug: newSlug, city: effectiveCity, _id: { $ne: id } });
      if (conflict) {
        updateData.slug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const room = await Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("city", "name slug");

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

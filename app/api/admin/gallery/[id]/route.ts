import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import Gallery from "@/lib/models/Gallery";
import { clearPropertyCache } from "@/lib/db/rooms";
import { apiSuccess, apiError, handleApiError } from "@/lib/utils/api";
import { deleteUploadedFile } from "@/lib/utils/fileCleanup";
import { updateGallerySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Gallery.findById(id).populate("city", "name");
    if (!item) return apiError("Gallery item not found", 404);
    return apiSuccess(item);
  } catch (error) {
    console.error("[GET /api/admin/gallery/[id]]", error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateGallerySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const oldItem = await Gallery.findById(id);
    if (!oldItem) return apiError("Gallery item not found", 404);

    const item = await Gallery.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });

    // Delete old file when image is replaced
    if (parsed.data.src && parsed.data.src !== oldItem.src) {
      await deleteUploadedFile(oldItem.src);
    }

    clearPropertyCache();
    revalidatePath("/gallery");
    revalidatePath("/properties", "layout");
    revalidatePath("/", "layout");

    return apiSuccess(item);
  } catch (error) {
    console.error("[PUT /api/admin/gallery/[id]]", error);
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Gallery.findByIdAndDelete(id);
    if (!item) return apiError("Gallery item not found", 404);
    await deleteUploadedFile(item.src);

    clearPropertyCache();
    revalidatePath("/gallery");
    revalidatePath("/properties", "layout");
    revalidatePath("/", "layout");

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/admin/gallery/[id]]", error);
    return handleApiError(error);
  }
}


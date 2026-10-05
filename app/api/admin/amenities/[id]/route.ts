import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Amenity from "@/lib/models/Amenity";
import { apiSuccess, apiError, handleApiError } from "@/lib/utils/api";
import { updateAmenitySchema } from "@/lib/validations";
import { exactNameRegex } from "@/lib/amenities";
import { renameAmenityReferences, removeAmenityReferences } from "@/lib/db/amenities";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const amenity = await Amenity.findById(id);
    if (!amenity) return apiError("Amenity not found", 404);
    return apiSuccess(amenity);
  } catch (error) {
    console.error("[GET /api/admin/amenities/[id]]", error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAmenitySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const existing = await Amenity.findById(id);
    if (!existing) return apiError("Amenity not found", 404);

    const newName = parsed.data.name;
    if (newName !== undefined && newName !== existing.name) {
      const duplicate = await Amenity.exists({ _id: { $ne: id }, name: exactNameRegex(newName) });
      if (duplicate) return apiError(`An amenity named "${newName}" already exists.`, 409);
    }

    const oldName = existing.name;
    const amenity = await Amenity.findByIdAndUpdate(id, parsed.data, { returnDocument: "after", runValidators: true });
    if (!amenity) return apiError("Amenity not found", 404);

    // Rooms / properties store amenity names, so carry the rename over to them.
    if (amenity.name !== oldName) await renameAmenityReferences(oldName, amenity.name);

    return apiSuccess(amenity);
  } catch (error) {
    console.error("[PUT /api/admin/amenities/[id]]", error);
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const amenity = await Amenity.findByIdAndDelete(id);
    if (!amenity) return apiError("Amenity not found", 404);

    const removedFrom = await removeAmenityReferences(amenity.name);
    return apiSuccess({ deleted: true, removedFrom });
  } catch (error) {
    console.error("[DELETE /api/admin/amenities/[id]]", error);
    return handleApiError(error);
  }
}

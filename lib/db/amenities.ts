import Amenity from "@/lib/models/Amenity";
import Room from "@/lib/models/Room";
import Property from "@/lib/models/Property";
import { LEGACY_AMENITY_NAMES, guessAmenityIcon } from "@/lib/amenities";

export type AmenityUsage = { rooms: number; properties: number };

// Counts how many rooms / properties reference each amenity name.
export async function getAmenityUsage(): Promise<Record<string, AmenityUsage>> {
  const pipeline = [
    { $unwind: "$amenities" },
    { $group: { _id: "$amenities", count: { $sum: 1 } } },
  ];
  const [rooms, properties] = await Promise.all([
    Room.aggregate<{ _id: string; count: number }>(pipeline),
    Property.aggregate<{ _id: string; count: number }>(pipeline),
  ]);

  const usage: Record<string, AmenityUsage> = {};
  for (const r of rooms) usage[r._id] = { rooms: r.count, properties: 0 };
  for (const p of properties) usage[p._id] = { rooms: usage[p._id]?.rooms ?? 0, properties: p.count };
  return usage;
}

// Keeps room / property references in sync when an amenity is renamed.
export async function renameAmenityReferences(oldName: string, newName: string) {
  if (oldName === newName) return;
  for (const Model of [Room, Property] as const) {
    // Docs that already list the new name just drop the old one (no duplicates).
    await (Model as typeof Room).updateMany(
      { amenities: { $all: [oldName, newName] } },
      { $pull: { amenities: oldName } }
    );
    await (Model as typeof Room).updateMany(
      { amenities: oldName },
      { $set: { "amenities.$[el]": newName } },
      { arrayFilters: [{ el: oldName }] }
    );
  }
}

// Removes a deleted amenity from every room / property that referenced it,
// so no listing keeps showing an amenity that no longer exists.
export async function removeAmenityReferences(name: string): Promise<AmenityUsage> {
  const [rooms, properties] = await Promise.all([
    Room.updateMany({ amenities: name }, { $pull: { amenities: name } }),
    Property.updateMany({ amenities: name }, { $pull: { amenities: name } }),
  ]);
  return { rooms: rooms.modifiedCount, properties: properties.modifiedCount };
}

// Non-destructive catalog sync: adds every legacy (previously hardcoded)
// amenity name and every name already stored on rooms / properties to the
// Amenity collection if it is not there yet. Never deletes or edits entries.
export async function syncAmenityCatalog(): Promise<string[]> {
  const [roomNames, propertyNames, existing] = await Promise.all([
    Room.distinct("amenities"),
    Property.distinct("amenities"),
    Amenity.find({}, { name: 1 }).lean(),
  ]);

  const known = new Set(existing.map((a) => a.name.trim().toLowerCase()));
  const toCreate: string[] = [];
  for (const raw of [...LEGACY_AMENITY_NAMES, ...roomNames, ...propertyNames] as string[]) {
    const name = typeof raw === "string" ? raw.trim() : "";
    if (!name || known.has(name.toLowerCase())) continue;
    known.add(name.toLowerCase());
    toCreate.push(name);
  }

  if (toCreate.length > 0) {
    const start = existing.length;
    await Amenity.insertMany(
      toCreate.map((name, i) => ({ name, icon: guessAmenityIcon(name), visible: true, order: start + i }))
    );
  }
  return toCreate;
}

import Amenity from "../lib/models/Amenity";
import { syncAmenityCatalog } from "../lib/db/amenities";

export async function seedAmenities() {
  // Amenities are managed from the Admin Panel, so seeding only adds what's
  // missing — it never deletes or overwrites admin-created amenities.
  const amenities = [
    { name: "Bunk Bed",         icon: "BedDouble",       visible: true, order: 0 },
    { name: "Locker",           icon: "LockKeyhole",     visible: true, order: 1 },
    { name: "High Speed Wi-Fi", icon: "Wifi",            visible: true, order: 2 },
    { name: "Paid Breakfast",   icon: "Coffee",          visible: true, order: 3 },
    { name: "Free Parking",     icon: "SquareParking",   visible: true, order: 4 },
    { name: "Laundry Service",  icon: "WashingMachine",  visible: true, order: 5 },
    { name: "Pet Friendly",     icon: "PawPrint",        visible: true, order: 6 },
    { name: "Kitchen",          icon: "ChefHat",         visible: true, order: 7 },
    { name: "Airport Shuttle",  icon: "Plane",           visible: true, order: 8 },
  ];

  let created = 0;
  for (const amenity of amenities) {
    const res = await Amenity.updateOne({ name: amenity.name }, { $setOnInsert: amenity }, { upsert: true });
    created += res.upsertedCount;
  }

  // Make sure every amenity already used by rooms / properties (and the ones
  // the admin forms used to hardcode) exists in the catalog.
  const synced = await syncAmenityCatalog();
  console.log(`Amenities: ${created + synced.length} created (existing kept)`);
}

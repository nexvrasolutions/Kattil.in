// Shared amenity helpers. Rooms and Properties reference amenities by name
// (`amenities: string[]`), and the Amenity collection is the catalog those
// names are picked from in the Admin Panel.

export const DEFAULT_AMENITY_ICON = "Sparkles";

// Amenity names that used to be hardcoded in the Room / Property admin forms.
// Kept only so the migration/seed can make sure they exist in the catalog —
// the forms themselves now load amenities from the database.
export const LEGACY_AMENITY_NAMES = [
  "Free Wifi",
  "Restaurant",
  "Air Conditioning",
  "Private Bathroom",
  "Lockers",
  "Study Desk",
  "Room Service",
  "Swimming Pool",
  "Balcony",
  "Smart TV",
  "Individual Pod Cooling",
  "Ceiling Fan",
  "Wellness Spa",
  "24/7 Butler",
  "Free Parking",
  "Meeting Lounge",
  "Locker",
  "Gym",
  "Breakfast Included",
];

// Best-effort icon for an amenity name, used when creating catalog entries
// for names that were never given one. Admins can change it afterwards.
const ICON_RULES: Array<[RegExp, string]> = [
  [/wi-?fi|internet/i, "Wifi"],
  [/air ?con|\bac\b|cooling/i, "Wind"],
  [/fan/i, "Fan"],
  [/bath|shower/i, "Bath"],
  [/locker|lock/i, "LockKeyhole"],
  [/desk|study/i, "LampDesk"],
  [/room service/i, "ConciergeBell"],
  [/butler|reception|concierge/i, "BellRing"],
  [/pool|sea|beach/i, "Waves"],
  [/balcony|terrace|sun/i, "Sun"],
  [/garden|park\b|nature/i, "Trees"],
  [/city/i, "Building2"],
  [/tv|television/i, "Tv"],
  [/spa|wellness/i, "Sparkles"],
  [/parking/i, "SquareParking"],
  [/lounge|sofa/i, "Sofa"],
  [/gym|fitness/i, "Dumbbell"],
  [/breakfast|coffee|cafe/i, "Coffee"],
  [/restaurant|dining|food/i, "UtensilsCrossed"],
  [/kitchen/i, "ChefHat"],
  [/laundry|washing/i, "WashingMachine"],
  [/pet/i, "PawPrint"],
  [/airport|shuttle/i, "Plane"],
  [/bed|occupancy/i, "BedDouble"],
];

export function guessAmenityIcon(name: string): string {
  return ICON_RULES.find(([re]) => re.test(name))?.[1] ?? DEFAULT_AMENITY_ICON;
}

// Case-insensitive exact-match helper for Mongo queries on amenity names.
export function exactNameRegex(name: string): RegExp {
  return new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

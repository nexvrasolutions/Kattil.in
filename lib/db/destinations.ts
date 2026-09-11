import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { PropertyStay } from "@/components/section/destination/DestinationStaysView";
import { locationRooms } from "@/lib/data";

export interface DestinationStaysData {
  cityId?: string;
  cityName: string;
  citySlug: string;
  cityDescription?: string;
  banner?: string;
  properties: PropertyStay[];
}

// In-memory cache with 60-second TTL to avoid repeated slow DB connections
const staysCache = new Map<string, { data: DestinationStaysData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearDestinationsCache(slug?: string) {
  if (slug) {
    staysCache.delete(slug.toLowerCase().trim());
  } else {
    staysCache.clear();
  }
}

function getFallbackProperties(citySlug: string): PropertyStay[] {
  const staticRooms = (locationRooms as Record<string, any[]>)[citySlug.toLowerCase()];
  if (staticRooms && staticRooms.length > 0) {
    return staticRooms.map((r, idx) => ({
      _id: `prop-${citySlug}-${idx}`,
      name: r.name,
      slug: r.slug,
      badge: r.feature || (idx === 0 ? "Private room" : idx === 1 ? "Luxury Suite" : "Private room"),
      images: r.image ? [r.image, "/assets/gallery.png"] : ["/assets/ac-double-room.webp"],
      amenities: ["Free Wifi", "Restaurant", "Study Desk", "AC"],
      link: `/properties/${r.slug}`,
      description: r.description,
      occupancy: `${r.capacity || 2} Guests`,
    }));
  }
  return [];
}

export async function getDestinationStaysData(
  slug: string,
  fallbackName: string
): Promise<DestinationStaysData> {
  const cleanSlug = slug.toLowerCase().trim();
  const cacheKey = cleanSlug;

  const cached = staysCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    await connectDB();

    // 1. Direct query city by slug or regex
    const city = await City.findOne({
      $or: [
        { slug: cleanSlug },
        { name: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
        { label: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
      ],
    }).lean();

    let propertiesList: any[] = [];

    if (city) {
      // 2. Query Properties for this city
      propertiesList = await Property.find({
        city: city._id,
        status: { $ne: "inactive" },
      })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    }

    let properties: PropertyStay[] = [];

    if (propertiesList.length > 0) {
      properties = JSON.parse(JSON.stringify(propertiesList)).map((p: any) => ({
        _id: String(p._id),
        name: p.name,
        slug: p.slug,
        badge: p.badge?.trim() || "Private room",
        category: p.category,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/assets/ac-double-room.webp"],
        amenities: Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities : ["Free Wifi", "Restaurant"],
        link: `/properties/${p.slug}`,
        description: p.description,
      }));
    } else {
      // Fallback: If no Property records exist, check legacy Room records
      let legacyRooms: any[] = [];
      if (city) {
        legacyRooms = await Room.find({
          $or: [{ city: city._id }, { city: String(city._id) }],
          status: { $ne: "inactive" },
        })
          .sort({ order: 1, createdAt: -1 })
          .lean();
      }

      if (legacyRooms.length > 0) {
        properties = JSON.parse(JSON.stringify(legacyRooms)).map((r: any, idx: number) => ({
          _id: String(r._id),
          name: r.name,
          slug: r.slug,
          badge: r.badge?.trim() || (idx % 2 === 0 ? "Private room" : "Home stay"),
          category: r.category,
          images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
          amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant"],
          link: r.link?.trim() || `/properties/${r.slug || r._id}`,
          description: r.description,
          occupancy: r.occupancy,
        }));
      } else {
        properties = getFallbackProperties(cleanSlug);
      }
    }

    const result: DestinationStaysData = {
      cityId: city ? String(city._id) : undefined,
      cityName: city?.name || fallbackName,
      citySlug: city?.slug || cleanSlug,
      cityDescription: city?.description,
      banner: city?.banner,
      properties,
    };

    staysCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error(`[getDestinationStaysData] Failed for slug "${slug}":`, error);
    return {
      cityName: fallbackName,
      citySlug: cleanSlug,
      properties: getFallbackProperties(cleanSlug),
    };
  }
}

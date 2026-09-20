import { cache } from "react";
import { connectDB } from "@/lib/db/mongodb";
import Room from "@/lib/models/Room";
import Property from "@/lib/models/Property";
import City from "@/lib/models/City";
import Gallery from "@/lib/models/Gallery";
import { PropertyDetailsData, PropertyRoomOption } from "@/components/section/rooms/PropertyDetailsView";
import { locationRooms } from "@/lib/data";

interface CityConfig {
  destinationName: string;
  destinationSlug: string;
  defaultPropertyName: string;
  address: string;
  phone: string;
  email: string;
  mapSrc: string;
}

const CITY_CONFIGS: Record<string, CityConfig> = {
  chennai: {
    destinationName: "Chennai",
    destinationSlug: "chennai",
    defaultPropertyName: "Kattil Chennai",
    address: "274, 1st Main Road, Secretariat Colony, Chennai, Thoraipakkam, Tamil Nadu 600097",
    phone: "+91 63851 97921",
    email: "sadhu_burlington@live.com",
    mapSrc: "https://maps.google.com/maps?q=274%2C+1st+Main+Road%2C+Secretariat+Colony%2C+Thoraipakkam%2C+Chennai%2C+Tamil+Nadu+600097&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  kaniyakumari: {
    destinationName: "Kaniyakumari",
    destinationSlug: "kaniyakumari",
    defaultPropertyName: "The Sparrow",
    address: "Main Road, Near Sunset Point, Kaniyakumari, Tamil Nadu 629702",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc: "https://maps.google.com/maps?q=Kaniyakumari%2C+Tamil+Nadu+629702&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  kanniyakumari: {
    destinationName: "Kaniyakumari",
    destinationSlug: "kaniyakumari",
    defaultPropertyName: "The Sparrow",
    address: "Main Road, Near Sunset Point, Kaniyakumari, Tamil Nadu 629702",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc: "https://maps.google.com/maps?q=Kaniyakumari%2C+Tamil+Nadu+629702&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  coimbatore: {
    destinationName: "Coimbatore",
    destinationSlug: "coimbatore",
    defaultPropertyName: "Kattil Coimbatore",
    address: "124, Race Course Road, Gopalapuram, Coimbatore, Tamil Nadu 641018",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc: "https://maps.google.com/maps?q=Race+Course+Road%2C+Coimbatore%2C+Tamil+Nadu+641018&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  colachel: {
    destinationName: "Colachel",
    destinationSlug: "colachel",
    defaultPropertyName: "Kattil Colachel",
    address: "Beach Road, Colachel, Tamil Nadu 629251",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc: "https://maps.google.com/maps?q=Colachel%2C+Tamil+Nadu+629251&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  madurai: {
    destinationName: "Madurai",
    destinationSlug: "madurai",
    defaultPropertyName: "Kattil Stay Madurai",
    address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017",
    phone: "+91 73581 27921",
    email: "sadhu_burlington@live.com",
    mapSrc: "https://maps.google.com/maps?q=2nd+St%2C+Park+Town%2C+Bama+Nagar%2C+Madurai%2C+Tamil+Nadu+625017&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
};

export function detectCitySlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (
    s === "chennai" ||
    s.includes("chennai") ||
    s.includes("marina-horizon") ||
    s.includes("urban-sanctuary") ||
    s.includes("coastal-heritage") ||
    s.includes("garden-villa") ||
    s.includes("gandhi") ||
    s.includes("executive")
  ) {
    return "chennai";
  }
  if (s === "coimbatore" || s.includes("coimbatore") || s.includes("-cbe")) {
    return "coimbatore";
  }
  if (s === "colachel" || s.includes("colachel")) {
    return "colachel";
  }
  if (
    s === "kanniyakumari" ||
    s === "kaniyakumari" ||
    s === "kanyakumari" ||
    s.includes("kanniyakumari") ||
    s.includes("kaniyakumari") ||
    s.includes("kanyakumari") ||
    s.includes("sparrow")
  ) {
    return "kaniyakumari";
  }
  if (s === "madurai" || s.includes("madurai")) {
    return "madurai";
  }
  return "kaniyakumari";
}

function getFallbackRoomOptions(citySlug: string): PropertyRoomOption[] {
  const staticRooms = (locationRooms as Record<string, any[]>)[citySlug];
  if (staticRooms && staticRooms.length > 0) {
    return staticRooms.map((r, idx) => ({
      _id: `room-${citySlug}-${idx}`,
      name: r.name,
      badge: r.feature || (idx === 0 ? "Private room" : idx === 1 ? "Luxury Suite" : "Private room"),
      description: r.description || "Spacious room with modern amenities and extra comfort",
      images: r.image ? [r.image, "/assets/gallery.png"] : ["/assets/ac-double-room.webp"],
      amenities: ["Free Wifi", "Restaurant", "Study Desk", "AC"],
      bookingLink: r.external_url || `https://live.ipms247.com/booking/book-rooms-${citySlug === "madurai" || citySlug === "kanniyakumari" ? "kattil" : `kattil${citySlug}`}`,
      price: r.price ? `₹${r.price.toLocaleString("en-IN")}` : undefined,
    }));
  }

  return [
    {
      _id: "default-room-1",
      name: "AC Double Room",
      badge: "Private room",
      description: "Spacious Double occupancy room with extra comfort",
      images: ["/assets/ac-double-room.webp", "/assets/gallery.png"],
      amenities: ["Free Wifi", "Restaurant", "Study Desk", "Double Occupancy"],
      bookingLink: "https://live.ipms247.com/booking/book-rooms-kattil",
    },
    {
      _id: "default-room-2",
      name: "6 Bed Mixed Dormitory",
      badge: "Dormitory",
      description: "Spacious dormitory with individual pods and extra comfort",
      images: ["/assets/six-bed-dormitory.webp", "/assets/gallery.png"],
      amenities: ["Free Wifi", "Restaurant", "Study Desk", "Double Occupancy"],
      bookingLink: "https://live.ipms247.com/booking/book-rooms-kattil",
    },
  ];
}

// In-memory cache with 60-second TTL
const propertyDetailsCache = new Map<string, { data: PropertyDetailsData; timestamp: number }>();
const roomsPageCache = new Map<string, { data: RoomsPageData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearPropertyCache(slug?: string) {
  if (slug) {
    const cleanSlug = slug.toLowerCase().trim();
    for (const key of propertyDetailsCache.keys()) {
      if (key === cleanSlug || key.startsWith(`${cleanSlug}-`)) {
        propertyDetailsCache.delete(key);
      }
    }
    for (const key of roomsPageCache.keys()) {
      if (key === cleanSlug || key.startsWith(`${cleanSlug}-`)) {
        roomsPageCache.delete(key);
      }
    }
  } else {
    propertyDetailsCache.clear();
    roomsPageCache.clear();
  }
}

// Wrapped in React's cache() so that generateMetadata and the page component — which
// both call this with the same arguments for a given request — share a single
// invocation instead of running the whole query chain twice per navigation.
export const getPropertyDetailsData = cache(async function getPropertyDetailsData(
  slug: string,
  fallbackDestination: string = "Kanniyakumari",
  cityHint?: string
): Promise<PropertyDetailsData> {
  const cleanSlug = slug.toLowerCase().trim();
  const cacheKey = `${cleanSlug}-${cityHint || ""}`;

  const cached = propertyDetailsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const detectedCitySlug = cityHint ? cityHint.toLowerCase().trim() : detectCitySlug(cleanSlug);
  const cityConfig = CITY_CONFIGS[detectedCitySlug] || CITY_CONFIGS.kanniyakumari;

  try {
    await connectDB();

    // These two counts are unrelated to the slug being resolved below (they only check
    // whether the DB has been bootstrapped with any data at all), so kick them off now
    // and let them run in the background while the sequential property/room/city lookup
    // below happens. They're awaited later at the point they're actually used.
    // .exec() is called once here to get a real Promise — a Mongoose Query can only be
    // executed (via .then()/.catch()/.exec()) once, so it must not also be awaited later.
    const propertyCountPromise = Property.countDocuments().exec();
    const roomCountPromise = Room.countDocuments().exec();

    // Tracks whether a real Property or Room document was directly matched for this
    // slug (steps 1-3 below), as opposed to the step 4 fuzzy city-level fallback that
    // substitutes an unrelated property. Used to distinguish "genuinely doesn't exist"
    // from "exists but has zero active listings" for the /properties/[slug] and
    // /rooms/[slug] pages, without affecting the /rooms listing page's city-based lookups.
    let matchedEntity = false;

    // 1. Try finding a Property first by slug, name regex, or _id
    let property: any = null;

    if (cleanSlug.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(cleanSlug).populate("city").lean();
    }
    if (!property) {
      const hyphenSlug = cleanSlug.replace(/_/g, "-");
      const spaceSlug = cleanSlug.replace(/[_-]/g, " ");
      property = await Property.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: hyphenSlug },
          { slug: `kattil-${hyphenSlug}` },
          { slug: hyphenSlug.replace(/^kattil-/, "") },
          { name: { $regex: new RegExp(`^${spaceSlug}$`, "i") } },
          { name: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
          { name: { $regex: new RegExp(`^kattil ${spaceSlug}$`, "i") } },
          { name: { $regex: new RegExp(`^${spaceSlug}`, "i") } },
        ],
      })
        .populate("city")
        .lean();
    }
    if (property) matchedEntity = true;

    // If property exists and is inactive, return property with 0 rooms (do not fallback to dummy rooms)
    if (property && property.status === "inactive") {
      const city = property.city || null;
      const destinationName = city?.name || cityConfig.destinationName || fallbackDestination;
      const destinationSlug = city?.slug || cityConfig.destinationSlug || detectedCitySlug;

      const inactiveResult: PropertyDetailsData = {
        _id: String(property._id),
        name: property.name,
        slug: cleanSlug,
        destinationName,
        destinationSlug,
        tagline: property.tagline,
        description: property.description || "This property is currently unavailable.",
        heroImages: Array.isArray(property.images) && property.images.length > 0 ? property.images : [],
        galleryImages: [],
        address: property.address || city?.address || cityConfig.address,
        mapLink: property.mapSrc || city?.mapSrc || cityConfig.mapSrc,
        phone: property.phone || city?.phone || cityConfig.phone,
        email: property.email || city?.email || cityConfig.email,
        whatsapp: property.whatsapp,
        directions: property.directions,
        rooms: [],
        entityFound: true,
      };

      propertyDetailsCache.set(cacheKey, { data: inactiveResult, timestamp: Date.now() });
      return inactiveResult;
    }

    let city: any = property?.city || null;

    // 2. If active property found, fetch all active rooms belonging to this property
    let roomsList: any[] = [];
    if (property) {
      roomsList = await Room.find({
        property: property._id,
        status: { $ne: "inactive" },
      })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    }

    // 3. If no property found, fallback to searching for a Room directly or City
    if (!property) {
      let primaryRoom: any = null;
      if (cleanSlug.match(/^[0-9a-fA-F]{24}$/)) {
        primaryRoom = await Room.findById(cleanSlug).populate("city").populate("property").lean();
      }
      if (!primaryRoom) {
        primaryRoom = await Room.findOne({
          $or: [
            { slug: cleanSlug },
            { slug: cleanSlug.replace(/-/g, " ") },
            { name: { $regex: new RegExp(`^${cleanSlug.replace(/-/g, " ")}$`, "i") } },
            { name: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
          ],
        })
          .populate("city")
          .populate("property")
          .lean();
      }
      if (primaryRoom) matchedEntity = true;

      // If room or its parent property is inactive, do not show active rooms
      if (primaryRoom?.status === "inactive" || (primaryRoom?.property && (primaryRoom.property as any)?.status === "inactive")) {
        primaryRoom = null;
      }

      if (primaryRoom?.property) {
        property = primaryRoom.property;
        city = primaryRoom.city || property.city;
        matchedEntity = true;
        roomsList = await Room.find({
          property: property._id,
          status: { $ne: "inactive" },
        })
          .sort({ order: 1, createdAt: -1 })
          .lean();
      } else if (primaryRoom?.city) {
        city = primaryRoom.city;
        matchedEntity = true;
        // Only rooms from active properties in this city
        const activePropsInCity = (await Property.find({ city: city._id, status: { $ne: "inactive" } }).select("_id").lean()).map((p) => p._id);
        roomsList = await Room.find({
          city: city._id,
          status: { $ne: "inactive" },
          $or: [
            { property: { $in: activePropsInCity } },
            { property: { $exists: false } },
            { property: null },
          ],
        })
          .sort({ order: 1, createdAt: -1 })
          .lean();
      }
    }

    // 4. Resolve City if still null
    if (!city) {
      city = await City.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: detectedCitySlug },
          { name: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
          { name: { $regex: new RegExp(`^${detectedCitySlug}$`, "i") } },
        ],
      }).lean();

      if (city) {
        // A real City document was matched, so this is a genuine destination on
        // the site — never 404 it, even if it has no properties yet (mirrors the
        // "property found but inactive" case above, which also renders with 0 rooms
        // instead of calling notFound()).
        matchedEntity = true;

        // Check if properties exist for this city in DB
        const cityProps = await Property.find({ city: city._id }).lean();
        if (cityProps.length > 0) {
          const activeCityProps = cityProps.filter((p) => p.status !== "inactive");
          if (activeCityProps.length > 0) {
            property = activeCityProps[0];
            roomsList = await Room.find({
              property: property._id,
              status: { $ne: "inactive" },
            })
              .sort({ order: 1, createdAt: -1 })
              .lean();
          } else {
            // All properties in this city are inactive -> no rooms!
            roomsList = [];
          }
        }
      }
    }

    const destinationName = city?.name || cityConfig.destinationName || fallbackDestination;
    const destinationSlug = city?.slug || cityConfig.destinationSlug || detectedCitySlug;
    const propertyName = property?.name || cityConfig.defaultPropertyName;

    // Check if DB has any properties or rooms configured at all
    // (fired near the top of this function — already in flight or resolved by now)
    const totalPropsInDb = await propertyCountPromise;
    const totalRoomsInDb = await roomCountPromise;
    const isDbBootstrapped = totalPropsInDb > 0 || totalRoomsInDb > 0;

    // Map room options
    let roomOptions: PropertyRoomOption[] = [];
    if (roomsList.length > 0) {
      roomOptions = JSON.parse(JSON.stringify(roomsList)).map((r: any, idx: number) => ({
        _id: String(r._id),
        name: r.name,
        badge: r.badge?.trim() || (idx === 0 ? "Private room" : idx === 1 ? "Dormitory" : "Private room"),
        description: r.description || "Spacious Double occupancy room with extra comfort",
        images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
        amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant", "Study Desk", "Double Occupancy"],
        bookingLink: r.link?.trim() || r.cta?.url?.trim() || undefined,
        price: r.pricing?.[0]?.value,
      }));
    } else if (!isDbBootstrapped) {
      // Only fallback to hardcoded dummy rooms if database is completely empty
      roomOptions = getFallbackRoomOptions(destinationSlug);
    } else {
      roomOptions = [];
    }

    // 1. Photos specifically uploaded in Admin Panel under Content Management > Gallery for this location
    let adminGalleryPhotos: string[] = [];
    if (city?._id) {
      try {
        const cityGalleries = await Gallery.find({ city: city._id })
          .sort({ order: 1, createdAt: -1 })
          .lean();
        adminGalleryPhotos = cityGalleries.map((g: any) => g.src).filter(Boolean);
      } catch (err) {
        console.warn("[getPropertyDetailsData] Could not fetch admin gallery:", err);
      }
    }

    const MADURAI_STATIC_GALLERY = [
      "/assets/madurai-gallery/image-1.jpeg",
      "/assets/madurai-gallery/image-2.jpeg",
      "/assets/madurai-gallery/image-3.jpeg",
      "/assets/madurai-gallery/image-4.jpeg",
      "/assets/madurai-gallery/image-5.jpeg",
      "/assets/madurai-gallery/image-6.jpeg",
      "/assets/madurai-gallery/image-7.jpeg",
      "/assets/madurai-gallery/image-8.jpeg",
      "/assets/madurai-gallery/image-9.jpeg",
    ];

    const CHENNAI_STATIC_GALLERY = [
      "/assets/chennai-gallery/image-1.jpeg",
      "/assets/chennai-gallery/image-2.jpeg",
      "/assets/chennai-gallery/image-3.jpeg",
      "/assets/chennai-gallery/image-4.jpeg",
    ];

    const effectiveAdminGallery =
      adminGalleryPhotos.length > 0
        ? adminGalleryPhotos
        : destinationSlug === "madurai"
        ? MADURAI_STATIC_GALLERY
        : destinationSlug === "chennai"
        ? CHENNAI_STATIC_GALLERY
        : [];

    // 2. Photos uploaded in Admin Panel under Properties
    const propertyPhotos: string[] = Array.isArray(property?.images)
      ? property.images.filter(Boolean)
      : [];

    // 3. Photos uploaded in Admin Panel under Rooms
    const roomPhotos: string[] = roomsList.flatMap((r: any) =>
      Array.isArray(r.images) ? r.images.filter(Boolean) : []
    );

    const DEFAULT_PROPERTY_IMAGES =
      destinationSlug === "madurai"
        ? MADURAI_STATIC_GALLERY
        : destinationSlug === "chennai"
        ? CHENNAI_STATIC_GALLERY
        : [
            "/assets/kattil-room-hero.webp",
            "/assets/deluxe-garden-suite.webp",
            "/assets/ac-double-room.webp",
          ];

    // Hero carousel uses property photos from Admin Panel first, or falls back to admin gallery / defaults
    const heroImages =
      propertyPhotos.length > 0
        ? propertyPhotos
        : effectiveAdminGallery.length > 0
        ? effectiveAdminGallery
        : DEFAULT_PROPERTY_IMAGES;

    // Gallery section shows property photos from Admin Panel first, or falls back to admin gallery / defaults
    const galleryImages =
      propertyPhotos.length > 0
        ? propertyPhotos
        : effectiveAdminGallery.length > 0
        ? effectiveAdminGallery
        : DEFAULT_PROPERTY_IMAGES;

    const result: PropertyDetailsData = {
      _id: property ? String(property._id) : undefined,
      name: propertyName,
      slug: cleanSlug,
      destinationName,
      destinationSlug,
      tagline: property?.tagline,
      description:
        property?.description ||
        city?.description ||
        `${propertyName} offers thoughtfully designed spaces with modern amenities, warm hospitality, and a vibrant community experience for students and professionals.`,
      heroImages,
      galleryImages,
      address: property?.address || city?.address || cityConfig.address,
      mapLink: property?.mapSrc || city?.mapSrc || cityConfig.mapSrc,
      phone: property?.phone || city?.phone || cityConfig.phone,
      email: property?.email || city?.email || cityConfig.email,
      whatsapp: property?.whatsapp,
      hotelCode: property?.hotelCode,
      bookingEngineUrl: property?.bookingEngineUrl,
      directions: property?.directions,
      rooms: roomOptions,
      entityFound: matchedEntity,
    };

    if (result.entityFound) {
      propertyDetailsCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }
    return result;
  } catch (error) {
    console.error(`[getPropertyDetailsData] Failed for slug "${slug}":`, error);
    const fallbackDestinationSlug = cityConfig.destinationSlug || "madurai";
    const staticPropertyFallback =
      fallbackDestinationSlug === "madurai"
        ? [
            "/assets/madurai-gallery/image-1.jpeg",
            "/assets/madurai-gallery/image-2.jpeg",
            "/assets/madurai-gallery/image-3.jpeg",
            "/assets/madurai-gallery/image-4.jpeg",
            "/assets/madurai-gallery/image-5.jpeg",
            "/assets/madurai-gallery/image-6.jpeg",
            "/assets/madurai-gallery/image-7.jpeg",
            "/assets/madurai-gallery/image-8.jpeg",
            "/assets/madurai-gallery/image-9.jpeg",
          ]
        : fallbackDestinationSlug === "chennai"
        ? [
            "/assets/chennai-gallery/image-1.jpeg",
            "/assets/chennai-gallery/image-2.jpeg",
            "/assets/chennai-gallery/image-3.jpeg",
            "/assets/chennai-gallery/image-4.jpeg",
          ]
        : [
            "/assets/kattil-room-hero.webp",
            "/assets/deluxe-garden-suite.webp",
            "/assets/ac-double-room.webp",
          ];

    const fallbackResult: PropertyDetailsData = {
      name: cityConfig.defaultPropertyName,
      slug: cleanSlug,
      destinationName: cityConfig.destinationName,
      destinationSlug: cityConfig.destinationSlug,
      description: `${cityConfig.defaultPropertyName} offers thoughtfully designed spaces with modern amenities, warm hospitality, and a vibrant community experience for students and professionals.`,
      heroImages: staticPropertyFallback,
      galleryImages: staticPropertyFallback,
      address: cityConfig.address,
      mapLink: cityConfig.mapSrc,
      phone: cityConfig.phone,
      email: cityConfig.email,
      rooms: getFallbackRoomOptions(cityConfig.destinationSlug),
      entityFound: true,
    };
    return fallbackResult;
  }
});

export function getHotelValueForSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (s === "chennai") return "kattilchennai";
  if (s === "madurai") return "kattil";
  if (s === "coimbatore") return "kattilcoimbatore";
  if (s === "colachel") return "kattilcolachel";
  if (s === "kanniyakumari" || s.includes("sparrow")) return "kattil";
  return `kattil${s}`;
}

export interface RoomsPageData {
  destinationSlug?: string;
  destinationName?: string;
  propertyName?: string;
  hotelValue?: string;
  rooms: PropertyRoomOption[];
  allCities: { name: string; slug: string }[];
}

export async function getRoomsPageData(
  destinationQuery?: string,
  propertyQuery?: string
): Promise<RoomsPageData> {
  const cleanDest = (destinationQuery || "").toLowerCase().trim();
  const cleanProp = (propertyQuery || "").toLowerCase().trim();
  const detectedCitySlug = cleanDest ? detectCitySlug(cleanDest) : (cleanProp ? detectCitySlug(cleanProp) : "");
  const activeSlug = detectedCitySlug || cleanDest || cleanProp;
  const cacheKey = `rooms-${activeSlug || "all"}`;

  const cached = roomsPageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    await connectDB();

    // Unrelated to the city/property lookups below — kick off now, awaited where used.
    // .exec() is called once here to get a real Promise — a Mongoose Query can only be
    // executed (via .then()/.catch()/.exec()) once, so it must not also be awaited later.
    const propertyCountPromise = Property.countDocuments().exec();
    const roomCountPromise = Room.countDocuments().exec();

    // Neither depends on the other's result, so run them concurrently.
    const [allCitiesDocs, activeProperties] = await Promise.all([
      City.find({ active: true }).select("name slug").sort({ order: 1 }).lean(),
      Property.find({ status: { $ne: "inactive" } }).select("_id").lean(),
    ]);
    const allCities = allCitiesDocs.map((c) => ({ name: c.name, slug: c.slug }));
    const activePropertyIds = activeProperties.map((p) => p._id);

    let roomsDocs: any[] = [];
    let propertyName = "";
    let destinationName = "";
    let destinationSlug = "";

    if (cleanProp) {
      const prop = await Property.findOne({ slug: cleanProp, status: { $ne: "inactive" } }).populate("city").lean();
      if (prop) {
        propertyName = prop.name;
        destinationName = (prop.city as any)?.name || "";
        destinationSlug = (prop.city as any)?.slug || "";
        roomsDocs = await Room.find({ property: prop._id, status: { $ne: "inactive" } }).lean();
      }
    } else if (activeSlug) {
      const city = await City.findOne({ slug: activeSlug }).lean();
      if (city) {
        destinationName = city.name;
        destinationSlug = city.slug;
        roomsDocs = await Room.find({
          city: city._id,
          status: { $ne: "inactive" },
          $or: [
            { property: { $in: activePropertyIds } },
            { property: { $exists: false } },
            { property: null },
          ],
        }).lean();
      }
    } else {
      roomsDocs = await Room.find({
        status: { $ne: "inactive" },
        $or: [
          { property: { $in: activePropertyIds } },
          { property: { $exists: false } },
          { property: null },
        ],
      })
        .limit(20)
        .lean();
    }

    const totalPropsInDb = await propertyCountPromise;
    const totalRoomsInDb = await roomCountPromise;
    const isDbBootstrapped = totalPropsInDb > 0 || totalRoomsInDb > 0;

    let rooms: PropertyRoomOption[] = [];
    if (roomsDocs.length > 0) {
      rooms = JSON.parse(JSON.stringify(roomsDocs)).map((r: any) => ({
        _id: String(r._id),
        name: r.name,
        badge: r.badge?.trim() || "Private room",
        description: r.description || "Spacious room with modern amenities and extra comfort",
        images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
        amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant"],
        bookingLink: r.link?.trim() || r.cta?.url?.trim() || undefined,
        price: r.pricing?.[0]?.value,
      }));
    } else if (!isDbBootstrapped) {
      rooms = getFallbackRoomOptions(destinationSlug || "chennai");
    } else {
      rooms = [];
    }

    const result: RoomsPageData = {
      destinationSlug,
      destinationName,
      propertyName,
      hotelValue: getHotelValueForSlug(destinationSlug || "chennai"),
      rooms,
      allCities,
    };

    roomsPageCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("[getRoomsPageData] Error:", error);
    return {
      destinationSlug: activeSlug,
      destinationName: activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1),
      hotelValue: getHotelValueForSlug(activeSlug || "chennai"),
      rooms: getFallbackRoomOptions(activeSlug || "chennai"),
      allCities: [],
    };
  }
}

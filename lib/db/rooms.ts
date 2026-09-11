import { connectDB } from "@/lib/db/mongodb";
import Room from "@/lib/models/Room";
import City from "@/lib/models/City";
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
    defaultPropertyName: "Kattil Executive Stay",
    address: "274, 1st Main Road, Secretariat Colony, Chennai, Thoraipakkam, Tamil Nadu 600097",
    phone: "+91 63851 97921",
    email: "sadhu_burlington@live.com",
    mapSrc: "https://maps.google.com/maps?q=274%2C+1st+Main+Road%2C+Secretariat+Colony%2C+Thoraipakkam%2C+Chennai%2C+Tamil+Nadu+600097&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  madurai: {
    destinationName: "Madurai",
    destinationSlug: "madurai",
    defaultPropertyName: "Kattil The Sparrow",
    address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc: "https://maps.google.com/maps?q=2nd+St%2C+Park+Town%2C+Bama+Nagar%2C+Madurai%2C+Tamil+Nadu+625017&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  coimbatore: {
    destinationName: "Coimbatore",
    destinationSlug: "coimbatore",
    defaultPropertyName: "Kattil Stay Coimbatore",
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
  kanniyakumari: {
    destinationName: "Kanniyakumari",
    destinationSlug: "kanniyakumari",
    defaultPropertyName: "Kattil The Sparrow",
    address: "Main Road, Near Sunset Point, Kanniyakumari, Tamil Nadu 629702",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc: "https://maps.google.com/maps?q=Kanniyakumari%2C+Tamil+Nadu+629702&t=m&z=16&ie=UTF8&iwloc=&output=embed",
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
    s === "madurai" ||
    s.includes("madurai") ||
    s.includes("dormitory") ||
    s.includes("double-room")
  ) {
    return "madurai";
  }
  if (
    s === "kanniyakumari" ||
    s === "kanyakumari" ||
    s.includes("kanniyakumari") ||
    s.includes("kanyakumari") ||
    s.includes("sparrow")
  ) {
    return "kanniyakumari";
  }
  return "kanniyakumari";
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

// In-memory cache with 60-second TTL to avoid repeated slow DB queries on every page click
const propertyDetailsCache = new Map<string, { data: PropertyDetailsData; timestamp: number }>();
const roomsPageCache = new Map<string, { data: RoomsPageData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function getPropertyDetailsData(
  slug: string,
  fallbackDestination: string = "Kanniyakumari"
): Promise<PropertyDetailsData> {
  const cleanSlug = slug.toLowerCase().trim();
  const cacheKey = cleanSlug;

  const cached = propertyDetailsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const detectedCitySlug = detectCitySlug(cleanSlug);
  const cityConfig = CITY_CONFIGS[detectedCitySlug] || CITY_CONFIGS.kanniyakumari;

  try {
    await connectDB();

    // 1. Try finding a room by slug, name regex, or _id
    let primaryRoom: any = null;
    let city: any = null;

    if (cleanSlug.match(/^[0-9a-fA-F]{24}$/)) {
      primaryRoom = await Room.findById(cleanSlug).populate("city").lean();
    }
    if (!primaryRoom) {
      primaryRoom = await Room.findOne({
        $or: [{ slug: cleanSlug }, { name: { $regex: new RegExp(`^${cleanSlug}$`, "i") } }],
        status: { $ne: "inactive" },
      })
        .populate("city")
        .lean();
    }

    if (primaryRoom?.city) {
      city = primaryRoom.city;
    }

    // 2. If city not resolved yet, check detected city slug
    if (!city) {
      city = await City.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: detectedCitySlug },
          { name: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
          { name: { $regex: new RegExp(`^${detectedCitySlug}$`, "i") } },
          { label: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
          { label: { $regex: new RegExp(`^${detectedCitySlug}$`, "i") } },
        ],
      }).lean();
    }

    // 3. Find sibling rooms for this city
    let cityRooms: any[] = [];
    if (city) {
      cityRooms = await Room.find({
        $or: [{ city: city._id }, { city: String(city._id) }],
        status: { $ne: "inactive" },
      })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    }

    const destinationName = city?.name || cityConfig.destinationName || fallbackDestination;
    const destinationSlug = city?.slug || cityConfig.destinationSlug || detectedCitySlug;
    const propertyName =
      primaryRoom?.name ||
      (cleanSlug === detectedCitySlug
        ? cityConfig.defaultPropertyName
        : primaryRoom?.name || cityConfig.defaultPropertyName);

    // Map rooms list for "Select Room"
    let roomOptions: PropertyRoomOption[] = [];
    if (cityRooms.length > 0) {
      roomOptions = JSON.parse(JSON.stringify(cityRooms)).map((r: any, idx: number) => ({
        _id: String(r._id),
        name: r.name,
        badge: r.badge?.trim() || (idx === 0 ? "Private room" : idx === 1 ? "Dormitory" : "Private rooms"),
        description: r.description || "Spacious Double occupancy room with extra comfort",
        images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
        amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant", "Study Desk", "Double Occupancy"],
        bookingLink: r.link?.trim() || r.cta?.url?.trim() || undefined,
        price: r.pricing?.[0]?.value,
      }));
    } else {
      roomOptions = getFallbackRoomOptions(destinationSlug);
    }

    const heroImages =
      primaryRoom?.images && primaryRoom.images.length > 0
        ? [
          "/assets/kattil-room-hero.webp",
          ...primaryRoom.images.filter((i: string) => i !== "/assets/kattil-room-hero.webp"),
        ].slice(0, 3)
        : [
          "/assets/kattil-room-hero.webp",
          "/assets/deluxe-garden-suite.webp",
          "/assets/ac-double-room.webp",
        ];

    const result: PropertyDetailsData = {
      _id: primaryRoom ? String(primaryRoom._id) : undefined,
      name: propertyName,
      slug: cleanSlug,
      destinationName,
      destinationSlug,
      description:
        primaryRoom?.description ||
        city?.description ||
        `${propertyName} offers thoughtfully designed spaces with modern amenities, warm hospitality, and a vibrant community experience for students and professionals.`,
      heroImages,
      address: city?.address || cityConfig.address,
      mapLink: city?.mapSrc || cityConfig.mapSrc,
      phone: city?.phone || cityConfig.phone,
      email: city?.email || cityConfig.email,
      rooms: roomOptions,
    };

    propertyDetailsCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error(`[getPropertyDetailsData] Failed for slug "${slug}":`, error);
    const fallbackResult: PropertyDetailsData = {
      name: cityConfig.defaultPropertyName,
      slug: cleanSlug,
      destinationName: cityConfig.destinationName,
      destinationSlug: cityConfig.destinationSlug,
      description: `${cityConfig.defaultPropertyName} offers thoughtfully designed spaces with modern amenities, warm hospitality, and a vibrant community experience for students and professionals.`,
      heroImages: [
        "/assets/kattil-room-hero.webp",
        "/assets/deluxe-garden-suite.webp",
        "/assets/ac-double-room.webp",
      ],
      address: cityConfig.address,
      mapLink: cityConfig.mapSrc,
      phone: cityConfig.phone,
      email: cityConfig.email,
      rooms: getFallbackRoomOptions(cityConfig.destinationSlug),
    };
    return fallbackResult;
  }
}

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
    const cities = await City.find({ active: true }).sort({ order: 1 }).lean();
    const allCities = cities.map((c) => ({ name: c.name, slug: c.slug }));

    if (activeSlug) {
      const propData = await getPropertyDetailsData(activeSlug);
      const hotelVal = getHotelValueForSlug(propData.destinationSlug || activeSlug);
      const result: RoomsPageData = {
        destinationSlug: propData.destinationSlug || activeSlug,
        destinationName: propData.destinationName,
        propertyName: propData.name,
        hotelValue: hotelVal,
        rooms: propData.rooms,
        allCities,
      };
      roomsPageCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    // If no destination specified, return all active rooms
    const allRooms = await Room.find({ status: { $ne: "inactive" } })
      .populate("city")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    let rooms: PropertyRoomOption[] = [];
    if (allRooms.length > 0) {
      rooms = JSON.parse(JSON.stringify(allRooms)).map((r: any, idx: number) => {
        const citySlug = r.city?.slug || "madurai";
        const hVal = getHotelValueForSlug(citySlug);
        return {
          _id: String(r._id),
          name: r.name,
          badge: r.badge?.trim() || (idx % 2 === 0 ? "Private room" : "Dormitory"),
          description: r.description || "Thoughtfully designed room with modern amenities",
          images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ["/assets/ac-double-room.webp"],
          amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ["Free Wifi", "Restaurant", "Study Desk"],
          bookingLink: r.link?.trim() || `https://live.ipms247.com/booking/book-rooms-${hVal}`,
          price: r.pricing?.[0]?.value,
        };
      });
    } else {
      rooms = [
        ...getFallbackRoomOptions("chennai"),
        ...getFallbackRoomOptions("madurai"),
      ];
    }

    const result: RoomsPageData = {
      destinationSlug: undefined,
      destinationName: undefined,
      propertyName: undefined,
      hotelValue: "kattil",
      rooms,
      allCities,
    };
    roomsPageCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("[getRoomsPageData] Error:", error);
    const config = CITY_CONFIGS[activeSlug] || CITY_CONFIGS.madurai;
    return {
      destinationSlug: activeSlug || undefined,
      destinationName: activeSlug ? config.destinationName : undefined,
      propertyName: activeSlug ? config.defaultPropertyName : undefined,
      hotelValue: activeSlug ? getHotelValueForSlug(activeSlug) : "kattil",
      rooms: getFallbackRoomOptions(activeSlug || "madurai"),
      allCities: [
        { name: "Chennai", slug: "chennai" },
        { name: "Madurai", slug: "madurai" },
        { name: "Coimbatore", slug: "coimbatore" },
        { name: "Kanniyakumari", slug: "kanniyakumari" },
      ],
    };
  }
}

import mongoose from "mongoose";
import Room from "../lib/models/Room";
import City from "../lib/models/City";
import Property from "../lib/models/Property";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function seedRooms() {
  const madurai = await City.findOne({ slug: "madurai" });
  const chennai = await City.findOne({ slug: "chennai" });
  const coimbatore = await City.findOne({ slug: "coimbatore" });

  const maduraiProp = await Property.findOne({ city: madurai?._id });
  const chennaiProp = await Property.findOne({ city: chennai?._id });
  const coimbatoreProp = await Property.findOne({ city: coimbatore?._id });

  if (!madurai || !chennai) {
    console.error("  ✗ Cities not found — run seedCities first");
    return;
  }

  const rooms = [
    // ── Madurai ──────────────────────────────────────────────────────────
    {
      name: "6 Bed Mixed Dormitory",
      slug: "6-bed-mixed-dormitory",
      property: maduraiProp?._id,
      city: madurai._id,
      category: "standard",
      images: ["/assets/six-bed-dormitory.webp"],
      link: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000001",
      description:
        "A comfortable shared dormitory with 6 beds, individual pod cooling, secure lockers, and high-speed Wi-Fi.",
      features: ["Individual Pod Cooling", "Secure Lockers", "High-Speed Wi-Fi"],
      amenities: ["Wi-Fi", "Lockers", "AC"],
      occupancy: "6",
      featured: false,
      status: "active",
      order: 0,
    },
    {
      name: "AC Double Room",
      slug: "ac-double-room",
      property: maduraiProp?._id,
      city: madurai._id,
      category: "deluxe",
      images: ["/assets/ac-double-room.webp"],
      link: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000002",
      description:
        "A private air-conditioned double room with premium amenities and a restful, quiet atmosphere.",
      features: ["Air Conditioning", "Private Room", "High-Speed Wi-Fi"],
      amenities: ["Wi-Fi", "AC", "Private Bathroom"],
      occupancy: "2",
      featured: true,
      status: "active",
      order: 1,
    },
    {
      name: "Non-AC Double Room",
      slug: "non-ac-double-room",
      property: maduraiProp?._id,
      city: madurai._id,
      category: "standard",
      images: ["/assets/non-ac-double-room.webp"],
      link: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000004",
      description:
        "A well-appointed private double room — comfortable, clean, and great value for your stay.",
      features: ["Private Room", "High-Speed Wi-Fi", "Ceiling Fan"],
      amenities: ["Wi-Fi", "Fan", "Private Bathroom"],
      occupancy: "2",
      featured: false,
      status: "active",
      order: 2,
    },
    // ── Chennai ───────────────────────────────────────────────────────────
    {
      name: "Marina Horizon Suite",
      slug: "marina-horizon-suite",
      property: chennaiProp?._id,
      city: chennai._id,
      category: "suite",
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      ],
      description:
        "Floor-to-ceiling windows frame the Bay of Bengal in this contemporary suite, where the horizon becomes your living wall.",
      features: ["Sea View", "Floor-to-Ceiling Windows", "Premium Amenities"],
      amenities: ["Wi-Fi", "AC", "Sea View", "Private Bathroom"],
      occupancy: "2",
      featured: true,
      status: "active",
      order: 0,
    },
    {
      name: "Urban Sanctuary Room",
      slug: "urban-sanctuary-room",
      property: chennaiProp?._id,
      city: chennai._id,
      category: "deluxe",
      images: [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      ],
      description:
        "A calm retreat above the city, designed for the modern traveller who seeks stillness in the heart of Chennai.",
      features: ["City Panorama", "Modern Design", "Premium Amenities"],
      amenities: ["Wi-Fi", "AC", "City View", "Private Bathroom"],
      occupancy: "2",
      featured: false,
      status: "active",
      order: 1,
    },
    {
      name: "Coastal Heritage Suite",
      slug: "coastal-heritage-suite",
      property: chennaiProp?._id,
      city: chennai._id,
      category: "suite",
      images: [
        "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&q=80",
      ],
      description:
        "Colonial architecture meets coastal luxury in this expansive suite with its own private plunge pool.",
      features: ["Private Plunge Pool", "Colonial Architecture", "Coastal Views"],
      amenities: ["Wi-Fi", "AC", "Plunge Pool", "Private Bathroom"],
      occupancy: "3",
      featured: false,
      status: "active",
      order: 2,
    },
    {
      name: "Executive Garden Villa",
      slug: "executive-garden-villa",
      property: chennaiProp?._id,
      city: chennai._id,
      category: "deluxe",
      images: [
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
      ],
      description:
        "Step onto your private garden terrace and hear the city's rhythm slow to a whisper.",
      features: ["Garden Terrace", "Private Outdoor Space", "Premium Amenities"],
      amenities: ["Wi-Fi", "AC", "Garden Access", "Private Bathroom"],
      occupancy: "2",
      featured: false,
      status: "active",
      order: 3,
    },
    // ── Coimbatore ────────────────────────────────────────────────────────
    ...(coimbatore
      ? [
          {
            name: "Deluxe AC Room",
            slug: "deluxe-ac-room-cbe",
            property: coimbatoreProp?._id,
            city: coimbatore._id,
            category: "deluxe",
            images: ["/assets/ac-double-room.webp"],
            link: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattilcoimbatore&roomtypeunkid=6154300000000000001",
            description:
              "A serene and modern air-conditioned private room in the heart of Coimbatore.",
            features: ["Air Conditioning", "City View", "High-Speed Wi-Fi"],
            amenities: ["Wi-Fi", "AC", "Private Bathroom"],
            occupancy: "2",
            featured: true,
            status: "active",
            order: 0,
          },
          {
            name: "6 Bed Mixed Dormitory",
            slug: "6-bed-mixed-dormitory-cbe",
            property: coimbatoreProp?._id,
            city: coimbatore._id,
            category: "standard",
            images: ["/assets/six-bed-dormitory.webp"],
            link: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattilcoimbatore&roomtypeunkid=6154300000000000002",
            description:
              "Comfortable bunk beds with individual locker, reading light, and pod cooling in Coimbatore.",
            features: ["Individual Pod Cooling", "Secure Lockers", "High-Speed Wi-Fi"],
            amenities: ["Wi-Fi", "Lockers", "AC"],
            occupancy: "6",
            featured: false,
            status: "active",
            order: 1,
          },
        ]
      : []),
  ];

  let inserted = 0;
  for (const room of rooms) {
    const existing = await Room.findOne({ slug: room.slug, city: room.city });
    if (existing) {
      await Room.findOneAndUpdate({ slug: room.slug, city: room.city }, room);
      console.log(`  ↺ Room updated: ${room.name}`);
    } else {
      await Room.create(room);
      inserted++;
      console.log(`  ✓ Room created: ${room.name}`);
    }
  }
  console.log(`Rooms: ${inserted} created, ${rooms.length - inserted} updated`);
}

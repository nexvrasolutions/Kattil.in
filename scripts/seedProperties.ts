import mongoose from "mongoose";
import City from "../lib/models/City";
import Property from "../lib/models/Property";
import Room from "../lib/models/Room";

export async function seedProperties() {
  const kaniyakumari = await City.findOne({ slug: "kaniyakumari" });
  const chennai = await City.findOne({ slug: "chennai" });
  const coimbatore = await City.findOne({ slug: "coimbatore" });

  if (!kaniyakumari || !chennai) {
    console.error("  ✗ Cities not found — seed cities first");
    return;
  }

  const properties = [
    {
      name: "Hostel Gandhi",
      slug: "hostel-gandhi",
      city: chennai._id,
      badge: "Hostel & Community",
      category: "hostel",
      tagline: "Vibrant Backpackers Community in Chennai",
      description:
        "Located in the cultural heartbeat of Chennai, Hostel Gandhi provides vibrant community living, clean dorms, and cozy private spaces tailored for travelers, explorers, and digital nomads.",
      images: [
        "/assets/kattil-room-hero.webp",
        "/assets/deluxe-garden-suite.webp",
        "/assets/ac-double-room.webp",
      ],
      address: "274, 1st Main Road, Secretariat Colony, Chennai, Thoraipakkam, Tamil Nadu 600097",
      phone: "+91 63851 97921",
      email: "sadhu_burlington@live.com",
      whatsapp: "+916385197921",
      mapSrc: "https://maps.google.com/maps?q=274%2C+1st+Main+Road%2C+Secretariat+Colony%2C+Thoraipakkam%2C+Chennai%2C+Tamil+Nadu+600097&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      amenities: ["Free Wifi", "Restaurant", "AC", "Community Lounge", "High-Speed Wi-Fi", "Locker"],
      directions: {
        railway: "Chennai Central Railway Station — 18 km",
        busStand: "Thoraipakkam Bus Stop — 500 meters",
        landmark: "Near Secretariat Colony Park",
        byCar: "Direct access via Old Mahabalipuram Road (OMR)",
      },
      hotelCode: "hostelgandhi",
      bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-hostelgandhi",
      featured: true,
      status: "active",
      order: 0,
    },
    {
      name: "The Sparrow",
      slug: "the-sparrow",
      city: kaniyakumari._id,
      badge: "Hostel & Stays",
      category: "hostel",
      tagline: "Scenic Coastal Stay near Sunset Point",
      description:
        "Located near the scenic coast in Kaniyakumari, The Sparrow offers clean, tranquil rooms combining vintage warmth with modern convenience, just minutes from iconic landmarks and sunset viewpoints.",
      images: [
        "/assets/ac-double-room.webp",
        "/assets/six-bed-dormitory.webp",
        "/assets/kattil-room-hero.webp",
        "/assets/deluxe-garden-suite.webp",
      ],
      address: "Main Road, Near Sunset Point, Kaniyakumari, Tamil Nadu 629702",
      phone: "+91 74487 49779",
      email: "hostelsparrow@gmail.com",
      whatsapp: "+917448749779",
      mapSrc: "https://maps.google.com/maps?q=Kaniyakumari%2C+Tamil+Nadu+629702&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      amenities: ["Free Wifi", "Restaurant", "Study Desk", "AC", "Lockers", "24/7 Butler"],
      directions: {
        railway: "Kaniyakumari Railway Station — 1.5 km",
        busStand: "Kaniyakumari Bus Stand — 1.2 km",
        landmark: "Near Sunset Point & Seashore",
        byCar: "Direct access via Main Beach Road",
      },
      hotelCode: "kattil",
      bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattil",
      featured: true,
      status: "active",
      order: 1,
    },
    {
      name: "Kattil Executive Stay",
      slug: "kattil-executive-stay",
      city: chennai._id,
      badge: "Executive Stay",
      category: "hotel",
      tagline: "Your Peaceful Sanctuary in Chennai",
      description:
        "Located in Thoraipakkam, Kattil Executive Stay Chennai offers premium accommodations with contemporary amenities, warm South Indian hospitality, and effortless access to the city's key hubs.",
      images: [
        "/assets/kattil-room-hero.webp",
        "/assets/deluxe-garden-suite.webp",
        "/assets/ac-double-room.webp",
      ],
      address: "274, 1st Main Road, Secretariat Colony, Chennai, Thoraipakkam, Tamil Nadu 600097",
      phone: "+91 63851 97921",
      email: "sadhu_burlington@live.com",
      whatsapp: "+916385197921",
      mapSrc: "https://maps.google.com/maps?q=274%2C+1st+Main+Road%2C+Secretariat+Colony%2C+Thoraipakkam%2C+Chennai%2C+Tamil+Nadu+600097&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      amenities: ["Free Wifi", "Restaurant", "AC", "24/7 Butler", "High-Speed Wi-Fi", "Locker"],
      directions: {
        railway: "Chennai Central Railway Station — 18 km",
        busStand: "Thoraipakkam Bus Stop — 500 meters",
        landmark: "Near Secretariat Colony Park",
        byCar: "Direct access via Old Mahabalipuram Road (OMR)",
      },
      hotelCode: "kattilchennai",
      bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattilchennai",
      featured: true,
      status: "active",
      order: 2,
    },
    ...(coimbatore
      ? [
          {
            name: "Kattil Stay Coimbatore",
            slug: "kattil-stay-coimbatore",
            city: coimbatore._id,
            badge: "Luxury Suite",
            category: "hotel",
            tagline: "Modern Living Near Race Course",
            description:
              "Kattil Stay Coimbatore provides stylish, restful accommodations located near Race Course Road, offering serene suites and high-speed amenities for discerning guests.",
            images: [
              "/assets/deluxe-garden-suite.webp",
              "/assets/ac-double-room.webp",
              "/assets/six-bed-dormitory.webp",
            ],
            address: "124, Race Course Road, Gopalapuram, Coimbatore, Tamil Nadu 641018",
            phone: "+91 74487 49779",
            email: "hostelsparrow@gmail.com",
            whatsapp: "+917448749779",
            mapSrc: "https://maps.google.com/maps?q=Race+Course+Road%2C+Coimbatore%2C+Tamil+Nadu+641018&t=m&z=16&ie=UTF8&iwloc=&output=embed",
            amenities: ["Free Wifi", "Restaurant", "AC", "City View"],
            directions: {
              railway: "Coimbatore Junction — 2.8 km",
              busStand: "Gandhipuram Central Bus Stand — 3.5 km",
              landmark: "Near Race Course Promenade",
              byCar: "Direct access via Race Course Road",
            },
            hotelCode: "kattilcoimbatore",
            bookingEngineUrl: "https://live.ipms247.com/booking/book-rooms-kattilcoimbatore",
            featured: true,
            status: "active",
            order: 2,
          },
        ]
      : []),
  ];

  let inserted = 0;
  for (const prop of properties) {
    let existing = await Property.findOne({ slug: prop.slug });
    if (!existing) {
      existing = await Property.findOne({ city: prop.city, name: prop.name });
    }
    if (existing) {
      await Property.findByIdAndUpdate(existing._id, prop);
      console.log(`  ↺ Property updated: ${prop.name}`);
    } else {
      existing = await Property.create(prop);
      inserted++;
      console.log(`  ✓ Property created: ${prop.name}`);
    }

    // Link any rooms in this city that don't have a property assigned yet
    const updateResult = await Room.updateMany(
      {
        city: prop.city,
        $or: [{ property: { $exists: false } }, { property: null }],
      },
      { $set: { property: existing._id } }
    );
    if (updateResult.modifiedCount > 0) {
      console.log(`    ↳ Linked ${updateResult.modifiedCount} rooms to ${prop.name}`);
    }
  }

  console.log(`Properties: ${inserted} created, ${properties.length - inserted} updated`);
}

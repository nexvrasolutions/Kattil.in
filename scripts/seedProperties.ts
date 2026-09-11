import mongoose from "mongoose";
import City from "../lib/models/City";
import Property from "../lib/models/Property";
import Room from "../lib/models/Room";

export async function seedProperties() {
  const madurai = await City.findOne({ slug: "madurai" });
  const chennai = await City.findOne({ slug: "chennai" });
  const coimbatore = await City.findOne({ slug: "coimbatore" });

  if (!madurai || !chennai) {
    console.error("  ✗ Cities not found — seed cities first");
    return;
  }

  const properties = [
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
      featured: true,
      status: "active",
      order: 0,
    },
    {
      name: "Kattil The Sparrow",
      slug: "kattil-the-sparrow-madurai",
      city: madurai._id,
      badge: "Private room",
      category: "homestay",
      tagline: "Homely Comfort in the Temple City",
      description:
        "Nestled in Anna Nagar, Madurai, Kattil The Sparrow offers clean, tranquil rooms combining vintage warmth with modern convenience, just minutes from iconic cultural landmarks.",
      images: [
        "/assets/ac-double-room.webp",
        "/assets/six-bed-dormitory.webp",
        "/assets/kattil-room-hero.webp",
      ],
      address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017",
      phone: "+91 74487 49779",
      email: "hostelsparrow@gmail.com",
      whatsapp: "+917448749779",
      mapSrc: "https://maps.google.com/maps?q=2nd+St%2C+Park+Town%2C+Bama+Nagar%2C+Madurai%2C+Tamil+Nadu+625017&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      amenities: ["Free Wifi", "Restaurant", "Study Desk", "AC", "Lockers"],
      directions: {
        railway: "Madurai Junction — 4.5 km",
        busStand: "Mattuthavani Bus Stand — 3.2 km",
        landmark: "Near Bama Nagar Park",
        byCar: "Easy access via Anna Nagar Main Road",
      },
      featured: true,
      status: "active",
      order: 1,
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

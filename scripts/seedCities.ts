import mongoose from "mongoose";
import City from "../lib/models/City";

export async function seedCities() {
  const cities = [
    {
      name: "Kaniyakumari",
      slug: "kaniyakumari",
      label: "KANIYAKUMARI",
      description: "Kattil's The Sparrow in Kaniyakumari near the ocean.",
      address: "Main Road, Near Sunset Point, Kaniyakumari, Tamil Nadu 629702",
      phone: "+91 74487 49779",
      email: "hostelsparrow@gmail.com",
      mapSrc:
        "https://maps.google.com/maps?q=Kaniyakumari%2C+Tamil+Nadu+629702&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      active: true,
      order: 0,
    },
    {
      name: "Chennai",
      slug: "chennai",
      label: "CHENNAI",
      description: "Kattil's Chennai properties in Thoraipakkam and Central Chennai.",
      address:
        "274, 1st Main Road, Secretariat Colony, Chennai, Thoraipakkam, Tamil Nadu 600097",
      phone: "+91 6385197921",
      email: "sadhu_burlington@live.com",
      mapSrc:
        "https://maps.google.com/maps?q=274%2C+1st+Main+Road%2C+Secretariat+Colony%2C+Thoraipakkam%2C+Chennai%2C+Tamil+Nadu+600097&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      active: true,
      order: 1,
    },
    {
      name: "Coimbatore",
      slug: "coimbatore",
      label: "COIMBATORE",
      description: "Kattil's Coimbatore property near Race Course.",
      address:
        "124, Race Course Road, Gopalapuram, Coimbatore, Tamil Nadu 641018",
      phone: "+91 74487 49779",
      email: "hostelsparrow@gmail.com",
      mapSrc:
        "https://maps.google.com/maps?q=Race+Course+Road%2C+Coimbatore%2C+Tamil+Nadu+641018&t=m&z=16&ie=UTF8&iwloc=&output=embed",
      active: true,
      order: 2,
    },
  ];

  let inserted = 0;
  for (const city of cities) {
    const existing = await City.findOne({ slug: city.slug });
    if (existing) {
      await City.findOneAndUpdate({ slug: city.slug }, city);
      console.log(`  ↺ City updated: ${city.name}`);
    } else {
      await City.create(city);
      inserted++;
      console.log(`  ✓ City created: ${city.name}`);
    }
  }
  console.log(`Cities: ${inserted} created, ${cities.length - inserted} updated`);
  return {
    kaniyakumari: await City.findOne({ slug: "kaniyakumari" }),
    chennai: await City.findOne({ slug: "chennai" }),
    coimbatore: await City.findOne({ slug: "coimbatore" }),
  };
}

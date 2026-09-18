import { connectDB } from "../lib/db/mongodb";
import Gallery from "../lib/models/Gallery";
import City from "../lib/models/City";
import Property from "../lib/models/Property";

async function main() {
  await connectDB();

  const chennai = await City.findOne({ slug: "chennai" });
  const hostelGandhi = await Property.findOne({ slug: "hostel-gandhi" });

  if (!chennai || !hostelGandhi) {
    console.error("Chennai city or Hostel Gandhi property not found");
    process.exit(1);
  }

  console.log("Hostel Gandhi images:", hostelGandhi.images);

  const images = hostelGandhi.images || [];
  let added = 0;

  for (let i = 0; i < images.length; i++) {
    const src = images[i];
    const exists = await Gallery.findOne({ src });
    if (!exists) {
      await Gallery.create({
        src,
        alt: `Hostel Gandhi Chennai — Photo ${i + 1}`,
        caption: `Hostel Gandhi, Chennai — Photo ${i + 1}`,
        category: i === 2 ? "Exterior" : "Rooms",
        city: chennai._id,
        featured: i === 0 || i === 2,
        order: 10 + i,
      });
      added++;
      console.log(`✓ Added gallery item: ${src}`);
    } else {
      console.log(`- Gallery item already exists: ${src}`);
    }
  }

  console.log(`Done! Added ${added} new gallery items for Hostel Gandhi in Chennai.`);
  process.exit(0);
}

main().catch(console.error);

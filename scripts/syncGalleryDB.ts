import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

import Gallery from "../lib/models/Gallery";
import GalleryCategory from "../lib/models/GalleryCategory";

const CATEGORIES = [
  { name: "Resort", slug: "resort", order: 0 },
  { name: "Dining", slug: "dining", order: 1 },
  { name: "Rooms", slug: "rooms", order: 2 },
  { name: "Experience", slug: "experience", order: 3 },
];

const CATEGORY_SLUGS = ["rooms", "resort", "dining", "experience"];

const IMAGES = CATEGORY_SLUGS.flatMap((catSlug, catIdx) =>
  Array.from({ length: 9 }).map((_, itemIdx) => ({
    src: "/images/gallery/luxury-suite-bedroom.jpg",
    alt: `Luxury Hotel Bedroom Suite - ${catSlug} ${itemIdx + 1}`,
    caption: `Minimalist Luxury Suite with Oak Wood Partition`,
    category: catSlug,
    featured: itemIdx < 3,
    order: catIdx * 10 + itemIdx,
  }))
);

async function sync() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Sync categories
  await GalleryCategory.deleteMany({});
  await GalleryCategory.insertMany(CATEGORIES);
  console.log("Synced gallery categories");

  // Sync images
  await Gallery.deleteMany({});
  await Gallery.insertMany(IMAGES);
  console.log(`Synced ${IMAGES.length} gallery items`);

  await mongoose.disconnect();
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});

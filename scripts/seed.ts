/**
 * Database seed script.
 * Populates MongoDB with all initial website content.
 *
 * Usage:
 *   npm run seed
 *   # or directly:
 *   npx tsx scripts/seed.ts
 */

// Load .env.local without requiring the dotenv package
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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

import dns from "dns";
try {
  if (typeof (dns as any).setDefaultResultOrder === "function") {
    (dns as any).setDefaultResultOrder("ipv4first");
  }
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

import mongoose from "mongoose";
import { seedCities } from "./seedCities";
import { seedProperties } from "./seedProperties";
import { seedRooms } from "./seedRooms";
import { seedAmenities } from "./seedAmenities";
import { seedBlogs } from "./seedBlogs";
import { seedFaqs } from "./seedFaqs";
import { seedGallery } from "./seedGallery";
import { seedHome } from "./seedHome";
import { seedAbout } from "./seedAbout";
import { seedCategories } from "./seedCategories";
import { seedFooter } from "./seedFooter";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected.\n");

  console.log("── Cities ──────────────────────────────");
  await seedCities();

  console.log("\n── Properties ──────────────────────────");
  await seedProperties();

  console.log("\n── Rooms ───────────────────────────────");
  await seedRooms();

  console.log("\n── Amenities ───────────────────────────");
  await seedAmenities();

  console.log("\n── Blogs ───────────────────────────────");
  await seedBlogs();

  console.log("\n── FAQs ────────────────────────────────");
  await seedFaqs();

  console.log("\n── Gallery ─────────────────────────────");
  await seedGallery();

  console.log("\n── Home Page ───────────────────────────");
  await seedHome();

  console.log("\n── About Page ──────────────────────────");
  await seedAbout();

  console.log("\n── Categories ──────────────────────────");
  await seedCategories();

  console.log("\n── Footer ──────────────────────────────");
  await seedFooter();

  console.log("\n✓ Seed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

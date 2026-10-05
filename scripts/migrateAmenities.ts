/**
 * One-off migration: moves amenities from code into the Admin-managed
 * Amenity collection.
 *
 * Adds (never deletes or edits) an Amenity for:
 *   - every amenity name previously hardcoded in the Room / Property admin forms
 *   - every amenity name already stored on a room or property
 *
 * Safe to run more than once.
 *
 * Usage:
 *   npx tsx scripts/migrateAmenities.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import { syncAmenityCatalog } from "../lib/db/amenities";
import Amenity from "../lib/models/Amenity";

function loadEnvFile(p: string) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }

  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected.");

  const created = await syncAmenityCatalog();
  if (created.length === 0) {
    console.log("✓ Amenity catalog already up to date.");
  } else {
    console.log(`✓ Added ${created.length} amenit${created.length === 1 ? "y" : "ies"}:`);
    for (const name of created) console.log(`  + ${name}`);
  }
  console.log(`  Total amenities: ${await Amenity.countDocuments()}`);

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

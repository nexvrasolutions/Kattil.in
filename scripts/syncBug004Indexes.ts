/**
 * One-time migration for BUG-004: syncs the Property and Room collections'
 * indexes with the current schema definitions — drops the old, insufficient
 * indexes (Property's per-city slug uniqueness, Room's non-unique slug+property
 * index) and creates the new unique indexes that enforce:
 *   - Property.name  — globally unique (case-insensitive)
 *   - Property.slug  — globally unique
 *   - Property.hotelCode — globally unique (when set)
 *   - Room.name  — unique within the same property (case-insensitive)
 *   - Room.slug  — unique within the same property
 *   - Room.roomCode — unique within the same property (when set)
 *
 * A duplicate-check was already run against production data and found no
 * conflicts, so this is safe to run as-is. Run once:
 *   npx tsx scripts/syncBug004Indexes.ts
 */

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

import { connectDB } from "../lib/db/mongodb";
import Property from "../lib/models/Property";
import Room from "../lib/models/Room";

async function run() {
  await connectDB();

  console.log("Syncing Property indexes...");
  const propertyResult = await Property.syncIndexes();
  console.log(JSON.stringify(propertyResult, null, 2));

  console.log("\nSyncing Room indexes...");
  const roomResult = await Room.syncIndexes();
  console.log(JSON.stringify(roomResult, null, 2));

  console.log("\nFinal Property indexes:");
  for (const idx of await Property.collection.indexes()) {
    console.log(" ", JSON.stringify(idx.key), idx.unique ? "(unique)" : "", idx.partialFilterExpression ? JSON.stringify(idx.partialFilterExpression) : "");
  }

  console.log("\nFinal Room indexes:");
  for (const idx of await Room.collection.indexes()) {
    console.log(" ", JSON.stringify(idx.key), idx.unique ? "(unique)" : "", idx.partialFilterExpression ? JSON.stringify(idx.partialFilterExpression) : "");
  }

  await (await import("mongoose")).default.disconnect();
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

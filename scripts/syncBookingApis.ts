import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import dns from "dns";
import mongoose from "mongoose";

try {
  if (typeof (dns as any).setDefaultResultOrder === "function") {
    (dns as any).setDefaultResultOrder("ipv4first");
  }
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

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

import City from "../lib/models/City";
import Property from "../lib/models/Property";
import Room from "../lib/models/Room";
import Settings from "../lib/models/Settings";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected to MongoDB.");

  // Ensure schemas are registered
  void City;
  void Property;
  void Room;
  void Settings;

  // 1. Ensure Global Settings bookingEngine is populated
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      hotelName: "Kattil",
      bookingEngine: {
        provider: "eZee / IPMS247",
        baseUrl: "https://live.ipms247.com/booking/book-rooms-",
        apiKey: "",
        apiSecret: "",
        defaultHotelCode: "kattil",
        globalBookingUrl: "https://live.ipms247.com/booking/book-rooms-kattil",
      },
    });
    console.log("✓ Created default Settings with Booking Engine configuration.");
  } else {
    if (!settings.bookingEngine || !settings.bookingEngine.baseUrl) {
      settings.bookingEngine = {
        provider: "eZee / IPMS247",
        baseUrl: "https://live.ipms247.com/booking/book-rooms-",
        apiKey: settings.bookingEngine?.apiKey || "",
        apiSecret: settings.bookingEngine?.apiSecret || "",
        defaultHotelCode: settings.bookingEngine?.defaultHotelCode || "kattil",
        globalBookingUrl: settings.bookingEngine?.globalBookingUrl || "https://live.ipms247.com/booking/book-rooms-kattil",
      };
      await settings.save();
      console.log("✓ Updated Settings bookingEngine configuration.");
    }
  }

  // 2. Update Properties with their exact hotel codes & booking URLs
  const properties = await Property.find().populate("city");
  console.log(`Found ${properties.length} properties to inspect.`);

  for (const prop of properties) {
    const slug = (prop.slug || "").toLowerCase();
    const name = (prop.name || "").toLowerCase();
    const citySlug = ((prop.city as any)?.slug || "").toLowerCase();

    let hotelCode = prop.hotelCode || "";
    let bookingEngineUrl = prop.bookingEngineUrl || "";

    if (slug.includes("gandhi") || name.includes("gandhi")) {
      hotelCode = "hostelgandhi";
      bookingEngineUrl = "https://live.ipms247.com/booking/book-rooms-hostelgandhi";
    } else if (slug.includes("chennai") || name.includes("chennai") || (citySlug === "chennai" && !hotelCode)) {
      hotelCode = "kattilchennai";
      bookingEngineUrl = "https://live.ipms247.com/booking/book-rooms-kattilchennai";
    } else if (slug.includes("coimbatore") || name.includes("coimbatore") || (citySlug === "coimbatore" && !hotelCode)) {
      hotelCode = "kattilcoimbatore";
      bookingEngineUrl = "https://live.ipms247.com/booking/book-rooms-kattilcoimbatore";
    } else if (slug.includes("sparrow") || slug.includes("madurai") || name.includes("madurai") || (citySlug === "madurai" && !hotelCode)) {
      hotelCode = "kattil";
      bookingEngineUrl = "https://live.ipms247.com/booking/book-rooms-kattil";
    } else if (slug.includes("colachel") || name.includes("colachel") || (citySlug === "colachel" && !hotelCode)) {
      hotelCode = "kattilcolachel";
      bookingEngineUrl = "https://live.ipms247.com/booking/book-rooms-kattilcolachel";
    } else if (!hotelCode) {
      hotelCode = `kattil${slug}`;
      bookingEngineUrl = `https://live.ipms247.com/booking/book-rooms-${hotelCode}`;
    }

    await Property.findByIdAndUpdate(prop._id, {
      hotelCode,
      bookingEngineUrl,
    });
    console.log(`  ✓ Property [${prop.name}]: hotelCode="${hotelCode}", url="${bookingEngineUrl}"`);
  }

  // 3. Update Rooms with specific booking links
  const rooms = await Room.find().populate("city").populate("property");
  console.log(`Found ${rooms.length} rooms to inspect.`);

  for (const room of rooms) {
    const rName = (room.name || "").toLowerCase();
    const rSlug = (room.slug || "").toLowerCase();
    const citySlug = ((room.city as any)?.slug || "").toLowerCase();
    const propName = ((room.property as any)?.name || "").toLowerCase();

    let link = room.link || "";
    let roomCode = room.roomCode || "";

    if (propName.includes("gandhi")) {
      link = "https://live.ipms247.com/booking/book-rooms-hostelgandhi";
    } else if (citySlug === "madurai" || propName.includes("sparrow")) {
      if (rName.includes("dormitory") || rSlug.includes("dormitory") || rSlug.includes("mixed")) {
        roomCode = "6154300000000000001";
        link = "https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000001";
      } else if (rName.includes("ac double") || rSlug.includes("ac-double")) {
        roomCode = "6154300000000000002";
        link = "https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000002";
      } else if (rName.includes("non-ac") || rSlug.includes("non-ac")) {
        roomCode = "6154300000000000004";
        link = "https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000004";
      } else if (!link) {
        link = "https://live.ipms247.com/booking/book-rooms-kattil";
      }
    } else if (citySlug === "coimbatore" || propName.includes("coimbatore")) {
      if (rName.includes("deluxe") || rSlug.includes("deluxe")) {
        roomCode = "6154300000000000001";
        link = "https://live.ipms247.com/booking/roomwisedata.php?hid=kattilcoimbatore&roomtypeunkid=6154300000000000001";
      } else if (rName.includes("dormitory") || rSlug.includes("dormitory")) {
        roomCode = "6154300000000000002";
        link = "https://live.ipms247.com/booking/roomwisedata.php?hid=kattilcoimbatore&roomtypeunkid=6154300000000000002";
      } else if (!link) {
        link = "https://live.ipms247.com/booking/book-rooms-kattilcoimbatore";
      }
    } else if (citySlug === "chennai" || propName.includes("chennai")) {
      if (!link) {
        link = "https://live.ipms247.com/booking/book-rooms-kattilchennai";
      }
    }

    await Room.findByIdAndUpdate(room._id, {
      link,
      roomCode,
    });
    console.log(`  ✓ Room [${room.name}]: link="${link}", roomCode="${roomCode}"`);
  }

  console.log("\n All current Booking APIs and links synced to database successfully.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

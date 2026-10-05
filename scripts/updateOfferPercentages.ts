import dns from "dns";
import mongoose from "mongoose";
import Property from "../lib/models/Property";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const updates = [
    { slug: "hostel-gandhi", offerPercentage: 10 },
    { slug: "kattil-executive-stay", offerPercentage: 10 },
    { slug: "the-sparrow", offerPercentage: 15 },
    { slug: "kattil-stay-coimbatore", offerPercentage: 10 },
    { slug: "kattil-stay-madurai", offerPercentage: 20 },
  ];

  for (const item of updates) {
    const res = await Property.updateOne(
      { slug: item.slug },
      { $set: { offerPercentage: item.offerPercentage } }
    );
    console.log(`Updated ${item.slug} -> ${item.offerPercentage}% (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
  }

  // Also set a default 10% on any property where offerPercentage is not set
  const fallbackRes = await Property.updateMany(
    { $or: [{ offerPercentage: { $exists: false } }, { offerPercentage: null }] },
    { $set: { offerPercentage: 10 } }
  );
  console.log(`Set fallback on ${fallbackRes.modifiedCount} other properties`);

  await mongoose.disconnect();
  console.log("Done!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

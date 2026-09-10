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

import Blog from "../lib/models/Blog";

const blogs = [
  {
    title: "The Art of a Perfect Weekend Your Comfort",
    slug: "the-art-of-a-perfect-weekend-your-comfort",
    category: "Stay Experience",
    readTime: "6 mins",
    date: "August 20, 2025",
    excerpt:
      "From serene Morning to breathtaking sunsets a weekend at our resort is all about you",
    image: "/assets/kattil-room-hero.webp",
    featured: true,
    status: "published",
    content: `<p>A perfect weekend getaway is not merely about a change of location — it is about finding a sanctuary where time decelerates and every detail is designed around your personal comfort.</p>
<p>At Kattil, we believe that true hospitality is about creating meaningful experiences that resonate long after your stay. From serene mornings with gentle sunlight filtering through sheer curtains to relaxing evenings under open skies, every moment is crafted to restore balance.</p>
<h2>Thoughtful Spaces, Unhurried Moments</h2>
<p>Our suites and rooms combine warm wooden textures, plush bedding, and acoustic serenity so that whether you are travelling for business, relaxation, or leisure with loved ones, settling in feels effortless.</p>
<h2>The Art of Dining & Relaxation</h2>
<p>Wake up to traditional South Indian breakfasts prepared with local ingredients, enjoy high-speed connectivity for work or leisure, and end your day in calming spaces that feel just like home — only better.</p>`,
    order: 0,
  },
  {
    title: "Morning Calm by the Pool",
    slug: "morning-calm-by-the-pool",
    category: "Stay",
    readTime: "5 min read",
    date: "August 10",
    excerpt: "Experience the tranquil early mornings with gentle waters, soft breezes, and golden sunrise light.",
    image: "/assets/kattil-room-hero.webp",
    featured: false,
    status: "published",
    content: "<p>There is a unique stillness to early mornings at Kattil. As the first rays of sunlight strike the water, the gentle reflection illuminates the surrounding greenery, offering a peaceful start before the day unfolds.</p>",
    order: 1,
  },
  {
    title: "A Taste of the Coast",
    slug: "a-taste-of-the-coast",
    category: "Dining",
    readTime: "4 min read",
    date: "August 11",
    excerpt: "Indulge in freshly prepared coastal flavours rooted in authentic South Indian spice traditions.",
    image: "/assets/deluxe-garden-suite.webp",
    featured: false,
    status: "published",
    content: "<p>South Indian coastal cuisine is a celebration of fresh aromatics, toasted coconut, and heritage spice blends. Our dining experiences bring these timeless recipes straight to your table.</p>",
    order: 2,
  },
  {
    title: "Wellness, Reimagined",
    slug: "wellness-reimagined",
    category: "Wellness",
    readTime: "7 min read",
    date: "August 12",
    excerpt: "Holistic self-care routines, mindful rituals, and rejuvenating spaces crafted for modern travellers.",
    image: "/assets/gallery.png",
    featured: false,
    status: "published",
    content: "<p>Wellness is not just a treatment; it is a way of living. From ergonomic workspaces to restful sleep setups and restorative lounges, wellness is woven into every corner of Kattil.</p>",
    order: 3,
  },
  {
    title: "Heritage Walk & Temple City Secrets",
    slug: "heritage-walk-temple-city-secrets",
    category: "Local Guide",
    readTime: "6 min read",
    date: "August 08",
    excerpt: "Uncover centuries of history, vibrant markets, and timeless architectural wonders in Madurai.",
    image: "/assets/ac-double-room.webp",
    featured: false,
    status: "published",
    content: "<p>From the towering gopurams of Meenakshi Amman Temple to age-old culinary streets, Madurai is a living treasure of Tamil culture waiting to be explored.</p>",
    order: 4,
  },
  {
    title: "Modern Comfort in the Heart of Chennai",
    slug: "modern-comfort-heart-of-chennai",
    category: "Stay",
    readTime: "5 min read",
    date: "August 06",
    excerpt: "Thoughtfully designed rooms and peaceful retreats nestled amidst Chennai's bustling vibrant hubs.",
    image: "/assets/kattil-room-hero.webp",
    featured: false,
    status: "published",
    content: "<p>Chennai blends coastal charm with vibrant enterprise. Stay in central, well-connected accommodations designed for maximum comfort and peace of mind.</p>",
    order: 5,
  },
  {
    title: "Culinary Traditions of Tamil Nadu",
    slug: "culinary-traditions-of-tamil-nadu",
    category: "Dining",
    readTime: "4 min read",
    date: "August 04",
    excerpt: "From authentic filter coffee to traditional feasts, explore the distinct culinary heritage of the South.",
    image: "/images/home/dining-community.png",
    featured: false,
    status: "published",
    content: "<p>Discover the secrets behind traditional filter coffee, slow-cooked gravies, and the vibrant hospitality of Tamil Nadu.</p>",
    order: 6,
  },
];

async function sync() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Remove any legacy blogs or duplicate entries
  await Blog.deleteMany({});
  console.log("Cleared old blogs");

  await Blog.insertMany(blogs);
  console.log(`Inserted ${blogs.length} clean blog posts`);

  const count = await Blog.countDocuments({});
  console.log(`Current DB count: ${count}`);
  await mongoose.disconnect();
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});

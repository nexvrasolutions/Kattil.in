import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { blogPosts } from "@/lib/data";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/chennai`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/kaniyakumari`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/kanyakumari`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/madurai`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/coimbatore`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/colachel`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/rooms`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/about-us`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact-us`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE_URL}/gallery`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.65 },
    { url: `${SITE_URL}/faqs`, lastModified, changeFrequency: "monthly", priority: 0.55 },
    { url: `${SITE_URL}/destinations`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/partners`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // These cities already have dedicated static routes above (/chennai, /kaniyakumari, /kanyakumari, /madurai,
  // /coimbatore, /colachel) — exclude them here so /destinations/[slug] doesn't
  // duplicate those URLs.
  const RESERVED_DESTINATION_SLUGS = new Set(["chennai", "kaniyakumari", "kanyakumari", "kanniyakumari", "madurai", "coimbatore", "colachel"]);

  let destinationRoutes: MetadataRoute.Sitemap = [];
  let propertyRoutes: MetadataRoute.Sitemap = [];
  let roomRoutes: MetadataRoute.Sitemap = [];

  try {
    await connectDB();

    const [cities, properties, rooms] = await Promise.all([
      City.find({ active: { $ne: false } }).select("slug").lean(),
      Property.find({ status: { $ne: "inactive" } }).select("slug").lean(),
      Room.find({ status: { $ne: "inactive" } }).select("slug").lean(),
    ]);

    destinationRoutes = cities
      .filter((c) => c.slug && !RESERVED_DESTINATION_SLUGS.has(c.slug))
      .map((c) => ({
        url: `${SITE_URL}/destinations/${c.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    propertyRoutes = properties
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_URL}/properties/${p.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    roomRoutes = rooms
      .filter((r) => r.slug)
      .map((r) => ({
        url: `${SITE_URL}/rooms/${r.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      }));
  } catch (error) {
    console.error("[sitemap] Failed to load dynamic routes from DB:", error);
  }

  return [
    ...staticRoutes,
    ...destinationRoutes,
    ...propertyRoutes,
    ...roomRoutes,
    ...blogRoutes,
  ];
}

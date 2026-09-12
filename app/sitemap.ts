import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { blogPosts } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/chennai`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/madurai`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/coimbatore`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/colachel`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/rooms`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/about-us`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact-us`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE_URL}/gallery`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.65 },
    { url: `${SITE_URL}/faqs`, lastModified, changeFrequency: "monthly", priority: 0.55 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes];
}

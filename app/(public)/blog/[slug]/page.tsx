import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import BlogModel from "@/lib/models/Blog";
import BlogDetailContent from "./_content";

interface BlogDocLean {
  _id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  additionalImages?: string[];
  readTime: string;
  date: string;
  featured: boolean;
  author?: string;
  tags?: string[];
  publishedAt?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
}

export interface BlogPost extends BlogDocLean {
  relatedPosts?: RelatedPost[];
}

export interface RelatedPost {
  _id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
}

const STATIC_POSTS: BlogDocLean[] = [
  {
    _id: "featured-1",
    slug: "the-art-of-a-perfect-weekend-your-comfort",
    title: "The Art of a Perfect Weekend: Your Comfort",
    category: "Stay Experience",
    readTime: "6 mins",
    date: "August 20, 2025",
    excerpt: "From serene Morning to breathtaking sunsets a weekend at our resort is all about you",
    image: "/assets/kattil-room-hero.webp",
    featured: true,
    content: `<p>A perfect weekend getaway is not merely about a change of location — it is about finding a sanctuary where time decelerates and every detail is designed around your personal comfort.</p>
<p>At Kattil, we believe that true hospitality is about creating meaningful experiences that resonate long after your stay. From serene mornings with gentle sunlight filtering through sheer curtains to relaxing evenings under open skies, every moment is crafted to restore balance.</p>
<h2>Thoughtful Spaces, Unhurried Moments</h2>
<p>Our suites and rooms combine warm wooden textures, plush bedding, and acoustic serenity so that whether you are travelling for business, relaxation, or leisure with loved ones, settling in feels effortless.</p>
<h2>The Art of Dining & Relaxation</h2>
<p>Wake up to traditional South Indian breakfasts prepared with local ingredients, enjoy high-speed connectivity for work or leisure, and end your day in calming spaces that feel just like home — only better.</p>`,
  },
  {
    _id: "post-1",
    slug: "morning-calm-by-the-pool",
    title: "Morning Calm by the Pool",
    category: "Stay",
    readTime: "5 min read",
    date: "August 10, 2025",
    excerpt: "Experience the tranquil early mornings with gentle waters, soft breezes, and golden sunrise light.",
    image: "/assets/kattil-room-hero.webp",
    featured: false,
    content: "<p>There is a unique stillness to early mornings at Kattil. As the first rays of sunlight strike the water, the gentle reflection illuminates the surrounding greenery, offering a peaceful start before the day unfolds.</p>",
  },
  {
    _id: "post-2",
    slug: "a-taste-of-the-coast",
    title: "A Taste of the Coast",
    category: "Dining",
    readTime: "4 min read",
    date: "August 11, 2025",
    excerpt: "Indulge in freshly prepared coastal flavours rooted in authentic South Indian spice traditions.",
    image: "/assets/deluxe-garden-suite.webp",
    featured: false,
    content: "<p>South Indian coastal cuisine is a celebration of fresh aromatics, toasted coconut, and heritage spice blends. Our dining experiences bring these timeless recipes straight to your table.</p>",
  },
  {
    _id: "post-3",
    slug: "wellness-reimagined",
    title: "Wellness, Reimagined",
    category: "Wellness",
    readTime: "7 min read",
    date: "August 12, 2025",
    excerpt: "Holistic self-care routines, mindful rituals, and rejuvenating spaces crafted for modern travellers.",
    image: "/assets/gallery.png",
    featured: false,
    content: "<p>Wellness is not just a treatment; it is a way of living. From ergonomic workspaces to restful sleep setups and restorative lounges, wellness is woven into every corner of Kattil.</p>",
  },
  {
    _id: "post-4",
    slug: "heritage-walk-temple-city-secrets",
    title: "Heritage Walk & Temple City Secrets",
    category: "Local Guide",
    readTime: "6 min read",
    date: "August 08, 2025",
    excerpt: "Uncover centuries of history, vibrant markets, and timeless architectural wonders in Madurai.",
    image: "/assets/ac-double-room.webp",
    featured: false,
    content: "<p>From the towering gopurams of Meenakshi Amman Temple to age-old culinary streets, Madurai is a living treasure of Tamil culture waiting to be explored.</p>",
  },
  {
    _id: "post-5",
    slug: "modern-comfort-heart-of-chennai",
    title: "Modern Comfort in the Heart of Chennai",
    category: "Stay",
    readTime: "5 min read",
    date: "August 06, 2025",
    excerpt: "Thoughtfully designed rooms and peaceful retreats nestled amidst Chennai's bustling vibrant hubs.",
    image: "/assets/kattil-room-hero.webp",
    featured: false,
    content: "<p>Chennai blends coastal charm with vibrant enterprise. Stay in central, well-connected accommodations designed for maximum comfort and peace of mind.</p>",
  },
  {
    _id: "post-6",
    slug: "culinary-traditions-of-tamil-nadu",
    title: "Culinary Traditions of Tamil Nadu",
    category: "Dining",
    readTime: "4 min read",
    date: "August 04, 2025",
    excerpt: "From authentic filter coffee to traditional feasts, explore the distinct culinary heritage of the South.",
    image: "/images/home/dining-community.png",
    featured: false,
    content: "<p>Discover the secrets behind traditional filter coffee, slow-cooked gravies, and the vibrant hospitality of Tamil Nadu.</p>",
  },
];

type PageProps = { params: Promise<{ slug: string }> };

function findStaticPost(slug: string): BlogDocLean | null {
  const clean = slug.toLowerCase().trim();
  const found = STATIC_POSTS.find(
    (p) =>
      p.slug.toLowerCase() === clean ||
      (clean.includes("perfect-weekend") && p.slug.includes("perfect-weekend")) ||
      (clean.includes("morning-calm") && p.slug.includes("morning-calm")) ||
      (clean.includes("coast") && p.slug.includes("coast")) ||
      (clean.includes("wellness") && p.slug.includes("wellness")) ||
      (clean.includes("heritage-walk") && p.slug.includes("heritage-walk")) ||
      (clean.includes("chennai") && p.slug.includes("chennai")) ||
      (clean.includes("culinary") && p.slug.includes("culinary"))
  );
  return found || null;
}

async function getPost(slug: string): Promise<{ post: BlogDocLean; related: RelatedPost[] } | null> {
  const cleanSlug = slug.toLowerCase().trim();
  try {
    await connectDB();
    const rawPost = await BlogModel.findOne({
      $or: [
        { slug: cleanSlug },
        { slug: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
        ...(cleanSlug.includes("perfect-weekend")
          ? [{ slug: "the-art-of-a-perfect-weekend-your-comfort" }, { slug: "art-of-a-perfect-weekend" }]
          : []),
      ],
      status: "published",
    })
      .select("slug title category excerpt content image additionalImages readTime date featured author tags publishedAt seo")
      .lean();

    if (rawPost) {
      const rawRelated = await BlogModel.find({ status: "published", slug: { $ne: (rawPost as any).slug } })
        .sort({ order: 1, createdAt: -1 })
        .limit(3)
        .select("slug category title excerpt image _id")
        .lean();

      const post: BlogDocLean = {
        _id: String((rawPost as any)._id),
        slug: (rawPost as any).slug,
        title: (rawPost as any).title,
        category: (rawPost as any).category,
        excerpt: (rawPost as any).excerpt || "",
        content: (rawPost as any).content || "",
        image: (rawPost as any).image || "",
        additionalImages: Array.isArray((rawPost as any).additionalImages)
          ? (rawPost as any).additionalImages.map(String)
          : [],
        readTime: (rawPost as any).readTime || "",
        date: (rawPost as any).date || "",
        featured: Boolean((rawPost as any).featured),
        author: (rawPost as any).author || "",
        tags: Array.isArray((rawPost as any).tags) ? (rawPost as any).tags.map(String) : [],
        publishedAt: (rawPost as any).publishedAt ? String((rawPost as any).publishedAt) : undefined,
        seo: (rawPost as any).seo ? { ...(rawPost as any).seo } : undefined,
      };

      const related: RelatedPost[] = (rawRelated || []).map((r: any) => ({
        _id: String(r._id),
        slug: r.slug,
        category: r.category || "",
        title: r.title || "",
        excerpt: r.excerpt || "",
        image: r.image || "",
      }));

      return { post, related };
    }
  } catch (error) {
    console.warn("[getPost] DB error, falling back to static:", error);
  }

  // Fallback to static articles if not found in DB
  const staticPost = findStaticPost(cleanSlug);
  if (!staticPost) return null;

  const related: RelatedPost[] = STATIC_POSTS
    .filter((p) => p._id !== staticPost._id)
    .slice(0, 3)
    .map((p) => ({
      _id: p._id,
      slug: p.slug,
      category: p.category,
      title: p.title,
      excerpt: p.excerpt,
      image: p.image,
    }));

  return { post: staticPost, related };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await getPost(slug);
    if (!data) return { title: "Post Not Found" };

    const post = data.post;
    const title = post.seo?.title || post.title;
    const description = post.seo?.description || post.excerpt;
    const ogImage = post.seo?.ogImage || post.image;
    const canonical = `${SITE_URL}/blog/${slug}`;

    return {
      title: `${title} | Kattil Stories`,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: "article",
        ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return { title: "Blog | Kattil" };
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();
  return <BlogDetailContent post={data.post} related={data.related} />;
}

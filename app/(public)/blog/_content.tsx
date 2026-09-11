"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { usePageView } from "@/hooks/usePageView";
import type { BlogPost } from "./page";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FALLBACK_FEATURED: BlogPost = {
  _id: "featured-1",
  slug: "art-of-a-perfect-weekend",
  title: "The Art of a Perfect Weekend: Your Comfort",
  category: "Stay Experience",
  excerpt:
    "From serene Morning to breathtaking sunsets a weeekend at our resort is all about you",
  image: "/assets/kattil-room-hero.webp",
  readTime: "6 mins",
  date: "August 20,2025",
  featured: true,
  content: "",
};

const FALLBACK_BLOGS: BlogPost[] = [
  {
    _id: "post-1",
    slug: "morning-calm-by-the-pool",
    title: "Morning Calm by the Pool",
    category: "Stay",
    excerpt: "Experience the tranquil early mornings with gentle waters, soft breezes, and golden sunrise light.",
    image: "/assets/kattil-room-hero.webp",
    readTime: "5 min read",
    date: "August 10",
    featured: false,
    content: "",
  },
  {
    _id: "post-2",
    slug: "a-taste-of-the-coast",
    title: "A Taste of the Coast",
    category: "Dining",
    excerpt: "Indulge in freshly prepared coastal flavours rooted in authentic South Indian spice traditions.",
    image: "/assets/deluxe-garden-suite.webp",
    readTime: "4 min read",
    date: "August 11",
    featured: false,
    content: "",
  },
  {
    _id: "post-3",
    slug: "wellness-reimagined",
    title: "Wellness, Reimagined",
    category: "Wellness",
    excerpt: "Holistic self-care routines, mindful rituals, and rejuvenating spaces crafted for modern travellers.",
    image: "/assets/gallery.png",
    readTime: "7 min read",
    date: "August 12",
    featured: false,
    content: "",
  },
  {
    _id: "post-4",
    slug: "heritage-walk-temple-city-secrets",
    title: "Heritage Walk & Temple City Secrets",
    category: "Local Guide",
    excerpt: "Uncover centuries of history, vibrant markets, and timeless architectural wonders in Madurai.",
    image: "/assets/ac-double-room.webp",
    readTime: "6 min read",
    date: "August 08",
    featured: false,
    content: "",
  },
  {
    _id: "post-5",
    slug: "modern-comfort-heart-of-chennai",
    title: "Modern Comfort in the Heart of Chennai",
    category: "Stay",
    excerpt: "Thoughtfully designed rooms and peaceful retreats nestled amidst Chennai's bustling vibrant hubs.",
    image: "/assets/kattil-room-hero.webp",
    readTime: "5 min read",
    date: "August 06",
    featured: false,
    content: "",
  },
  {
    _id: "post-6",
    slug: "culinary-traditions-of-tamil-nadu",
    title: "Culinary Traditions of Tamil Nadu",
    category: "Dining",
    excerpt: "From authentic filter coffee to traditional feasts, explore the distinct culinary heritage of the South.",
    image: "/images/home/dining-community.png",
    readTime: "4 min read",
    date: "August 04",
    featured: false,
    content: "",
  },
];

const DEFAULT_CATEGORIES = ["All Stories", "Stay", "Dining", "Wellness", "Local Guide"];

export default function BlogContent({
  posts: initialPosts,
  currentCategory,
  currentPage,
  totalPages,
}: {
  posts: BlogPost[];
  categories: string[];
  currentCategory: string;
  currentPage: number;
  totalPages: number;
  total: number;
}) {
  usePageView();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Core 5 categories matching mockup
  const allCategories = DEFAULT_CATEGORIES;

  // Combine initial posts with fallbacks if DB has limited entries
  const allPosts = useMemo(() => {
    if (initialPosts && initialPosts.length >= 7) {
      return initialPosts;
    }
    if (initialPosts && initialPosts.length > 0) {
      const existingSlugs = new Set(initialPosts.map((p) => p.slug.toLowerCase()));
      const fillers = [FALLBACK_FEATURED, ...FALLBACK_BLOGS].filter(
        (p) => !existingSlugs.has(p.slug.toLowerCase())
      );
      return [...initialPosts, ...fillers];
    }
    return [FALLBACK_FEATURED, ...FALLBACK_BLOGS];
  }, [initialPosts]);

  // Filter posts based on active category
  const filteredPosts = useMemo(() => {
    if (!currentCategory || currentCategory === "All Stories" || currentCategory === "All") {
      return allPosts;
    }
    const lower = currentCategory.toLowerCase();
    return allPosts.filter(
      (p) =>
        p.category?.toLowerCase() === lower ||
        p.category?.toLowerCase().includes(lower) ||
        lower.includes(p.category?.toLowerCase() || "")
    );
  }, [allPosts, currentCategory]);

  // Determine featured post and grid items
  const featuredPost = useMemo(() => {
    if (currentCategory && currentCategory !== "All Stories" && currentCategory !== "All") {
      return null;
    }
    return filteredPosts.find((p) => p.featured) || filteredPosts[0] || FALLBACK_FEATURED;
  }, [filteredPosts, currentCategory]);

  const gridPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.filter((p) => p._id !== featuredPost._id && p.slug !== featuredPost.slug);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "All Stories" && category !== "All") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeCategory = currentCategory || "All Stories";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Top Fixed Navbar ──────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Header Section (Sage Green) ───────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-8 sm:pb-9 md:pb-10 lg:pb-12">
        {/* Right Background Monument Skyline Silhouette */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.2 }}
          className="hidden md:flex absolute right-0 bottom-0 top-auto md:h-[78%] lg:h-[82%] md:w-[40%] lg:w-[34%] max-w-[460px] pointer-events-none z-0 overflow-hidden items-end justify-end pr-2 md:pr-6"
        >
          <div
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: "url('/images/partners/hero-skyline.png')",
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
            }}
          />
        </motion.div>

        {/* Hero Content aligned straight down with Navbar container */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="font-[Public_Sans] font-semibold text-[14px] leading-[14px] tracking-normal text-left align-middle uppercase text-white/95 mb-3 drop-shadow-xs"
            >
              LET US EXPLORE
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >
              <span className="block font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] leading-[1.12]">
                Stories Beyond
              </span>
              <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15] mt-1">
                Your Stay
              </span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── 2. Main Blog Section ─────────────────────────────────────────── */}
      <section className="relative z-20 w-full py-10 sm:py-12 md:py-16 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Category Filter Tabs */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3.5 sm:gap-6 md:gap-8 lg:gap-11 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allCategories.map((cat) => {
                  const isSelected =
                    (cat === "All Stories" && (!currentCategory || currentCategory === "All Stories" || currentCategory === "All")) ||
                    cat.toLowerCase() === currentCategory.toLowerCase();

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`font-sans text-[13.5px] sm:text-[14.5px] md:text-[15.5px] transition-colors whitespace-nowrap cursor-pointer shrink-0 ${isSelected
                        ? "font-bold text-[#2d3134]"
                        : "font-medium text-[#9ca3af] hover:text-[#4b5563]"
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 3. Featured Hero Card (2-Column Banner) ───────────────────── */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="mb-16 md:mb-20"
              >
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-[40px]">
                  {/* Left: Featured Image */}
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group shrink-0 block relative w-full lg:w-[564px] h-[260px] sm:h-[280px] lg:h-[290px] rounded-[8px] overflow-hidden bg-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                  >
                    <Image
                      src={featuredPost.image || "/assets/kattil-room-hero.webp"}
                      alt={featuredPost.title.replace("\n", " ")}
                      fill
                      sizes="564px"
                      className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      priority
                    />
                  </Link>

                  {/* Right: Featured Text Details */}
                  <div className="flex-1 flex flex-col justify-center text-left">
                    <p className="font-[Public_Sans] font-normal text-[14px] leading-[18px] text-[#202020] mb-2.5">
                      {featuredPost.category || "Stay Experience"}
                    </p>

                    <Link href={`/blog/${featuredPost.slug}`} className="group mb-[24px]">
                      <h2 className="font-[Public_Sans] font-normal text-[26px] sm:text-[30px] lg:text-[34px] xl:text-[36px] leading-[1.18] tracking-[-0.5px] text-[#202020] transition-colors">
                        {featuredPost.title.replace(/\n/g, " ") || "The Art of a Perfect Weekend Your Comfort"}
                      </h2>
                    </Link>

                    <p className="font-[Public_Sans] font-normal text-[14.5px] sm:text-[15.5px] leading-[1.45] text-[#5e6670] max-w-[430px] mb-8">
                      From serene Morning to breathtaking sunsets a weeekend at our resort is all about you
                    </p>

                    {/* Meta Row: Date, Read time, Read More */}
                    <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                      <div className="flex items-center gap-7 text-[13.5px] font-[Public_Sans] text-[#4b5563]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#526e4e] stroke-[1.5]" />
                          <span>{featuredPost.date || "August 20,2025"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#526e4e] stroke-[1.5]" />
                          <span>{featuredPost.readTime || "6 mins"}</span>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 font-[Public_Sans] text-[13.5px] text-[#333] hover:text-black border-b border-[#333] hover:border-black pb-0.5 transition-colors"
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 4. "Our Blogs" Section & 3-Column Grid ─────────────────────── */}
            <div>
              <h2 className="font-[Public_Sans] font-normal text-[32px] leading-[20px] tracking-[-0.5px] text-[#202020] mb-8 sm:mb-10">
                Our Blogs
              </h2>

              {gridPosts.length === 0 ? (
                <div className="py-16 text-center text-gray-500 font-sans">
                  No blog stories found in &ldquo;{activeCategory}&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
                  {gridPosts.map((post, idx) => (
                    <motion.article
                      key={post._id || post.slug || idx}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: EASE }}
                      className="group flex flex-col bg-white rounded-[12px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300"
                    >
                      <Link href={`/blog/${post.slug}`} className="block flex flex-col flex-1">
                        {/* Card Image */}
                        <div className="relative w-full h-[240px] sm:h-[260px] overflow-hidden bg-gray-100 rounded-t-[12px]">
                          <Image
                            src={post.image || "/assets/deluxe-garden-suite.webp"}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                          />
                        </div>
                        {/* Card Content */}
                        <div className="p-5 sm:p-6 flex flex-col flex-1">
                          <p className="font-sans text-[14px] sm:text-[14.5px] font-normal text-[#737373] mb-1.5">
                            {post.category || "Stay"}
                          </p>

                          <h3 className="font-sans text-[24px] sm:text-[25px] text-[#1a1a1a] leading-snug tracking-tight group-hover:text-[#526442] transition-colors line-clamp-2 mb-4">
                            {post.title}
                          </h3>

                          {/* Bottom Meta Row */}
                          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {post.date && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#f0eee9] text-[11px] font-medium text-[#5c5a55] font-sans">
                                  {post.date}
                                </span>
                              )}
                              {post.readTime && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#f0eee9] text-[11px] font-medium text-[#5c5a55] font-sans">
                                  {post.readTime}
                                </span>
                              )}
                            </div>

                            <span className="text-[12.5px] font-medium text-[#4a4a4a] group-hover:text-black inline-flex items-center gap-1 transition-colors shrink-0">
                              <span>View</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}

              {/* ── 5. Pagination ────────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-14 sm:mt-16">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-[6px] border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-30 hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${p === currentPage
                          ? "bg-[#0d1b2e] text-white"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 rounded-[6px] border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-30 hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

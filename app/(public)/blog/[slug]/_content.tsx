"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Share2, Check, Calendar, Clock, Tag, ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { usePageView } from "@/hooks/usePageView";
import type { BlogPost, RelatedPost } from "./page";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px 0px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function RelatedCard({ post, index }: { post: RelatedPost; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px 0px 0px" });
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.1 }}
      className="group flex flex-col bg-white rounded-[8px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <Link href={`/blog/${post.slug}`} className="block flex flex-col flex-1">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 rounded-t-[8px]">
          <Image
            src={post.image || "/assets/deluxe-garden-suite.webp"}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="font-sans text-[11.5px] font-bold uppercase tracking-[0.14em] text-gray-500 mb-1.5">
            {post.category || "Story"}
          </p>
          <h3 className="font-sans text-[17px] font-semibold text-[#0d1b2e] leading-snug tracking-tight group-hover:text-[#526442] transition-colors line-clamp-2 mb-4">
            {post.title}
          </h3>
          <div className="mt-auto pt-3 border-t border-gray-100/90 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-sans">Read article</span>
            <span className="text-[12.5px] font-semibold text-[#0d1b2e] group-hover:text-[#526442] inline-flex items-center gap-1 transition-colors">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function BlogDetailContent({
  post,
  related,
}: {
  post: BlogPost;
  related: RelatedPost[];
}) {
  usePageView();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* ── Top Fixed Navbar ──────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Header Section (Sage Green) ───────────────────────────── */}
      <section className="relative w-full bg-[#9caf88] overflow-hidden pt-36 md:pt-44 lg:pt-50 pb-16 md:pb-22">
        {/* Right Background Monument Skyline Silhouette */}
        <div className="hidden md:flex absolute right-0 bottom-0 top-auto md:h-[78%] lg:h-[82%] md:w-[40%] lg:w-[34%] max-w-[460px] pointer-events-none z-0 overflow-hidden items-end justify-end pr-2 md:pr-6">
          <div
            className="w-full h-full opacity-85 md:opacity-90 bg-no-repeat"
            style={{
              backgroundImage: "url('/images/partners/hero-skyline.png')",
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
            }}
          />
        </div>

        {/* Hero Content aligned straight down with Navbar container */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="relative px-5 md:px-8 lg:px-15 max-w-4xl">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to all stories
            </Link>

            <p className="font-sans text-[12.5px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[#f4f7ef] mb-3">
              {post.category || "Hotel Story"}
            </p>

            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] text-white leading-[1.18] tracking-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── 2. Article Content Section ────────────────────────────────────── */}
      <section className="w-full py-12 md:py-16 bg-[#FAF8F5]">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Main Featured Image Banner */}
            {post.image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[540px] rounded-[8px] overflow-hidden bg-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.06)] mb-12 md:mb-16"
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
            )}

            {/* 2-Column Article Grid (Sidebar + Content) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left Sidebar */}
              <motion.aside
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 bg-white p-6 rounded-[8px] border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]"
              >
                {post.date && (
                  <div>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Published
                    </p>
                    <p className="font-sans text-[14.5px] font-semibold text-gray-800">{post.date}</p>
                  </div>
                )}

                {post.readTime && (
                  <div>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Reading Time
                    </p>
                    <p className="font-sans text-[14.5px] font-semibold text-gray-800">{post.readTime}</p>
                  </div>
                )}

                {post.author && (
                  <div>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-1">Author</p>
                    <p className="font-sans text-[14.5px] font-semibold text-gray-800">{post.author}</p>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="font-sans text-[11px] font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-[4px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Button */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2.5">Share Story</p>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </motion.aside>

              {/* Right: Article Main Body */}
              <div className="lg:col-span-8">
                <FadeIn>
                  {post.content ? (
                    <div
                      className="prose max-w-none font-sans text-[16px] sm:text-[17px] leading-[1.8] text-gray-700 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-[#0d1b2e] [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:mb-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#9caf88] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6 [&_img]:rounded-[8px] [&_img]:my-6"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  ) : (
                    <p className="font-sans text-[16px] sm:text-[17px] leading-[1.8] text-gray-700">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Additional Images Grid if present */}
                  {post.additionalImages && post.additionalImages.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {post.additionalImages.map((src, i) => (
                        <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-[8px]">
                          <Image
                            src={src}
                            alt={`${post.title} photo ${i + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </FadeIn>
              </div>
            </div>

            {/* ── 3. Related Articles Section ───────────────────────────────── */}
            {related && related.length > 0 && (
              <div className="mt-20 pt-16 border-t border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-sans font-bold text-[#0d1b2e] mb-8">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
                  {related.map((p, i) => (
                    <RelatedCard key={String(p._id)} post={p} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

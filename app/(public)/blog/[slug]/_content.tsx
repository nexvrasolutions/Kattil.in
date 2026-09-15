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
      className="group flex flex-col bg-white rounded-[12px] overflow-hidden border border-[#EBE8DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <Link href={`/blog/${post.slug}`} className="block flex flex-col flex-1">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 rounded-t-[12px]">
          <Image
            src={post.image || "/assets/deluxe-garden-suite.webp"}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <p className="font-[Public_Sans] text-[12px] font-semibold uppercase tracking-[0.14em] text-[#526442] mb-2">
            {post.category || "Story"}
          </p>
          <h3 className="font-[Public_Sans] text-[18px] sm:text-[19px] font-medium text-[#0d1b2e] leading-snug tracking-tight group-hover:text-[#526442] transition-colors line-clamp-2 mb-5">
            {post.title}
          </h3>
          <div className="mt-auto pt-1 flex items-center justify-between">
            <span className="text-xs text-[#0d1b2e]/60 font-[Public_Sans] font-medium">Read article</span>
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

interface FormattedTitle {
  line1: string;
  line2Sans?: string;
  line2Italic?: string;
  line2?: string;
}

function formatBlogTitle(title: string): FormattedTitle {
  const clean = (title || "").trim();
  if (clean.toLowerCase().includes("weekend your comfort")) {
    return {
      line1: "The Art of a Perfect",
      line2Sans: "Weekend",
      line2Italic: "Your Comfort",
    };
  }
  if (clean.includes("\n")) {
    const parts = clean.split("\n");
    return {
      line1: parts[0].trim(),
      line2Italic: parts.slice(1).join(" ").trim(),
    };
  }
  if (clean.includes(":")) {
    const parts = clean.split(":");
    return {
      line1: parts[0].trim(),
      line2Italic: parts.slice(1).join(":").trim(),
    };
  }
  if (clean.includes(",")) {
    const parts = clean.split(",");
    return {
      line1: parts[0].trim() + ",",
      line2Italic: parts.slice(1).join(",").trim(),
    };
  }
  if (clean.includes("—") || clean.includes(" - ")) {
    const sep = clean.includes("—") ? "—" : " - ";
    const parts = clean.split(sep);
    return {
      line1: parts[0].trim(),
      line2Italic: parts.slice(1).join(sep).trim(),
    };
  }
  const words = clean.split(" ");
  if (words.length >= 4) {
    const mid = Math.ceil(words.length / 2);
    return {
      line1: words.slice(0, mid).join(" "),
      line2Italic: words.slice(mid).join(" "),
    };
  }
  if (words.length > 1) {
    return {
      line1: words[0],
      line2Italic: words.slice(1).join(" "),
    };
  }
  return {
    line1: clean,
  };
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
  const { line1, line2Sans, line2Italic, line2 } = formatBlogTitle(post.title);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => { });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF2]">
      {/* ── Top Fixed Navbar ──────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 1. Hero Header Section (Sage Green) ───────────────────────────── */}
      <section className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[280px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-12 sm:pb-14 md:pb-16">
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
          <div className="relative px-5 md:px-8 lg:px-15 max-w-4xl">
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-[Public_Sans] text-xs font-semibold uppercase tracking-[0.16em] text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to all stories
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="font-[Public_Sans] text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.18em] text-white/95 mb-3 drop-shadow-xs"
            >
              {post.category || "Hotel Story"}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="text-white tracking-tight"
            >
              <span className="block font-[Public_Sans] text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-medium leading-[1.12]">
                {line1}
              </span>
              {(line2Sans || line2Italic || line2) && (
                <span className="block mt-1">
                  {line2Sans && (
                    <span className="font-[Public_Sans] text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-medium text-white leading-[1.12]">
                      {line2Sans}{" "}
                    </span>
                  )}
                  {(line2Italic || line2) && (
                    <span className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-normal italic text-[#f4f7ef] leading-[1.15]">
                      {line2Italic || line2}
                    </span>
                  )}
                </span>
              )}
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── 2. Article Content Section ────────────────────────────────────── */}
      <section className="relative z-20 w-full py-12 md:py-16 bg-[#FFFCF2] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            {/* Main Featured Image Banner */}
            {post.image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[540px] rounded-[10px] overflow-hidden bg-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.06)] mb-12 md:mb-16"
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
                className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 bg-white p-6 sm:p-7 rounded-[12px] border border-[#EBE8DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              >
                {post.date && (
                  <div>
                    <p className="font-[Public_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#526442] mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 stroke-[1.8]" /> Published
                    </p>
                    <p className="font-[Public_Sans] text-[15px] font-medium text-[#0d1b2e]">{post.date}</p>
                  </div>
                )}

                {post.readTime && (
                  <div>
                    <p className="font-[Public_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#526442] mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 stroke-[1.8]" /> Reading Time
                    </p>
                    <p className="font-[Public_Sans] text-[15px] font-medium text-[#0d1b2e]">{post.readTime}</p>
                  </div>
                )}

                {post.author && (
                  <div>
                    <p className="font-[Public_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#526442] mb-1.5">Author</p>
                    <p className="font-[Public_Sans] text-[15px] font-medium text-[#0d1b2e]">{post.author}</p>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div>
                    <p className="font-[Public_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#526442] mb-2.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 stroke-[1.8]" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="font-[Public_Sans] text-[11.5px] font-medium text-[#0d1b2e] bg-[#F5F3EB] px-3 py-1 rounded-full border border-[#E5E0D0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Button */}
                <div className="pt-3 border-t border-[#EBE8DF]">
                  <p className="font-[Public_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#526442] mb-2.5">Share Story</p>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E0DCCE] bg-white text-xs font-semibold font-[Public_Sans] text-[#0d1b2e] hover:bg-[#F5F3EB] hover:border-[#526442]/40 transition-colors cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#526442]" />}
                    <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </motion.aside>

              {/* Right: Article Main Body */}
              <div className="lg:col-span-8">
                <FadeIn>
                  {post.content ? (
                    <div
                      className="prose max-w-none font-[Public_Sans] text-[15.5px] sm:text-[16.5px] leading-[1.78] text-[#0d1b2e]/80
                        [&_h1]:font-[Public_Sans] [&_h1]:text-[#0d1b2e] [&_h1]:text-[28px] [&_h1]:sm:text-[34px] [&_h1]:md:text-[38px] [&_h1]:font-normal [&_h1]:leading-[1.2] [&_h1]:tracking-tight [&_h1]:mt-10 [&_h1]:mb-5
                        [&_h2]:font-[Public_Sans] [&_h2]:text-[#0d1b2e] [&_h2]:text-[24px] [&_h2]:sm:text-[28px] [&_h2]:md:text-[32px] [&_h2]:font-normal [&_h2]:leading-[1.25] [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4
                        [&_h3]:font-[Public_Sans] [&_h3]:text-[#0d1b2e] [&_h3]:text-[20px] [&_h3]:sm:text-[22px] [&_h3]:md:text-[24px] [&_h3]:font-medium [&_h3]:leading-[1.3] [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:mb-3
                        [&_h4]:font-[Public_Sans] [&_h4]:text-[#0d1b2e] [&_h4]:text-[17px] [&_h4]:sm:text-[18px] [&_h4]:font-semibold [&_h4]:leading-snug [&_h4]:tracking-tight [&_h4]:mt-6 [&_h4]:mb-2
                        [&_p]:font-[Public_Sans] [&_p]:font-normal [&_p]:text-[#0d1b2e]/80 [&_p]:leading-[1.78] [&_p]:mb-6
                        [&_strong]:font-semibold [&_strong]:text-[#0d1b2e]
                        [&_em]:italic
                        [&_a]:text-[#526442] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[#0d1b2e]
                        [&_blockquote]:border-l-2 [&_blockquote]:border-[#526442] [&_blockquote]:pl-5 [&_blockquote]:sm:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-8 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-[18px] [&_blockquote]:sm:text-[20px] [&_blockquote]:text-[#0d1b2e] [&_blockquote]:leading-[1.6] [&_blockquote]:bg-[#F5F3EB]/60 [&_blockquote]:rounded-r-[8px]
                        [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:text-[#0d1b2e]/80
                        [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_ol]:mb-6 [&_ol]:space-y-2 [&_ol]:text-[#0d1b2e]/80
                        [&_li]:pl-1.5
                        [&_hr]:my-10 [&_hr]:border-t [&_hr]:border-[#EBE8DF]
                        [&_img]:rounded-[10px] [&_img]:my-8 [&_img]:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  ) : (
                    <p className="font-[Public_Sans] font-normal text-[15.5px] sm:text-[16.5px] leading-[1.78] text-[#0d1b2e]/80">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Additional Images Grid if present */}
                  {post.additionalImages && post.additionalImages.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {post.additionalImages.map((src, i) => (
                        <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
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
              <div className="mt-20 pt-14 border-t border-[#EBE8DF]">
                <h2 className="text-[#0d1b2e] tracking-tight mb-8 sm:mb-10">
                  <span className="font-[Public_Sans] text-2xl sm:text-3xl md:text-[34px] font-normal">
                    Related{" "}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl md:text-[34px] font-normal italic">
                    Stories
                  </span>
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

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, FileText, Star, Tag, X, Plus, Images } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";

// Lazy-load the rich text editor (heavy bundle — only load when needed)
const RichTextEditor = dynamic(() => import("@/components/admin/ui/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.3)]">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--adm-muted-foreground))]" />
    </div>
  ),
});

const EASE = [0.22, 1, 0.36, 1] as const;

interface Category { _id: string; name: string }
interface BlogForm {
  title:            string;
  category:         string;
  excerpt:          string;
  content:          string;
  image:            string;
  additionalImages: string[];
  readTime:         string;
  date:             string;
  featured:         boolean;
  status:           "draft" | "published";
  author:           string;
  tags:             string[];
}

const EMPTY: BlogForm = {
  title: "", category: "", excerpt: "", content: "", image: "",
  additionalImages: [], readTime: "", date: "", featured: false,
  status: "draft", author: "", tags: [],
};

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase text-[hsl(var(--adm-muted-foreground))] border-b border-[hsl(var(--adm-border)/0.5)] pb-3 mb-5">
      {children}
    </h2>
  );
}

function FormField({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--adm-foreground))]">
        {label}{required && <span className="text-[hsl(var(--adm-destructive))]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">{hint}</p>}
    </div>
  );
}

const inputCls = "flex w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors";

export default function BlogFormPage() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();
  const isNew   = id === "new";

  const [form,       setForm]       = useState<BlogForm>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(!isNew);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [tagInput,   setTagInput]   = useState("");

  // Load categories
  useEffect(() => {
    fetch("/api/admin/blog-categories")
      .then((r) => r.json())
      .then((r) => { if (r.success) setCategories(r.data.categories); })
      .catch(() => {});
  }, []);

  // Load existing blog for edit
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/blogs/${id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          const d = r.data;
          setForm({
            title:            d.title            ?? "",
            category:         d.category         ?? "",
            excerpt:          d.excerpt          ?? "",
            content:          d.content          ?? "",
            image:            d.image            ?? "",
            additionalImages: d.additionalImages ?? [],
            readTime:         d.readTime         ?? "",
            date:             d.date             ?? "",
            featured:         d.featured         ?? false,
            status:           d.status           ?? "draft",
            author:           d.author           ?? "",
            tags:             d.tags             ?? [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput("");
  };

  const removeAdditionalImage = (idx: number) => {
    setForm((f) => ({ ...f, additionalImages: f.additionalImages.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (statusOverride?: "draft" | "published") => {
    setError("");
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.category)     { setError("Please select a category."); return; }

    setSaving(true);
    try {
      const body = {
        ...form,
        status: statusOverride ?? form.status,
        // slug is auto-generated server-side — not sent from form
      };
      const url    = isNew ? "/api/admin/blogs" : `/api/admin/blogs/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

      if (res.success) {
        router.push("/admin/blogs");
      } else {
        setError(res.error ?? res.message ?? "Failed to save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--adm-muted-foreground))]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-2 px-1">
      <button onClick={() => router.push("/admin/blogs")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors mb-5 group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Blog Posts
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[hsl(var(--adm-border)/0.5)]">
          <div className="flex items-center gap-3">
            <div className="rounded-[8px] p-2.5 bg-[hsl(var(--adm-primary)/0.1)]">
              <FileText className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--adm-foreground))]">
                {isNew ? "New Blog Post" : "Edit Blog Post"}
              </h1>
              <p className="text-sm text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                {isNew ? "Write and publish a new article." : "Update this post. Changes are saved immediately."}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* ── Post Details ── */}
          <section>
            <SectionTitle>Post Details</SectionTitle>
            <div className="space-y-5">
              <FormField label="Title" required hint="The headline guests see on the blog listing and article page.">
                <input type="text" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. The Art of Slow Travel"
                  className={`${inputCls} h-10`} />
                {form.title && (
                  <p className="text-[10px] text-[hsl(var(--adm-muted-foreground))] mt-1">
                    URL: <span>/blog/{slugify(form.title)}</span>
                  </p>
                )}
              </FormField>

              <div className="grid md:grid-cols-3 gap-5">
                <FormField label="Category" required>
                  <div className="flex items-center gap-2">
                    <select value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className={`${inputCls} h-10 flex-1`}>
                      <option value="">Select category…</option>
                      {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                    <a href="/admin/blog-categories" target="_blank" rel="noopener noreferrer"
                      className="h-10 flex items-center gap-1 rounded-[8px] border border-[hsl(var(--adm-border))] px-3 text-xs font-medium text-[hsl(var(--adm-primary))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors whitespace-nowrap">
                      <Plus className="h-3 w-3" /> Manage
                    </a>
                  </div>
                </FormField>

                <FormField label="Author">
                  <input type="text" value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder="e.g. The Kattil Team"
                    className={`${inputCls} h-10`} />
                </FormField>

                <FormField label="Read Time" hint="e.g. 8 Min Read">
                  <input type="text" value={form.readTime}
                    onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                    placeholder="8 Min Read"
                    className={`${inputCls} h-10`} />
                </FormField>
              </div>

              <FormField label="Short Description" hint="A 1–2 sentence summary shown on the blog listing card (~160 characters recommended).">
                <textarea value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="A compelling summary of this post…"
                  rows={3}
                  className={`${inputCls} py-2.5 resize-none`} />
              </FormField>
            </div>
          </section>

          {/* ── Article Content ── */}
          <section>
            <SectionTitle>Article Content</SectionTitle>
            <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mb-3">
              Write your article below. Use the toolbar to format text, add headings, lists, and insert images directly into the content.
            </p>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              folder="blog"
              minHeight="400px"
              placeholder="Start writing your article here…"
            />
          </section>

          {/* ── Featured Image ── */}
          <section>
            <SectionTitle>Featured Image</SectionTitle>
            <AdminDropzone
              label="Cover / Hero Image"
              hint="The main image shown on the blog listing card and at the top of the article. Recommended: 1200 × 630 px (16:9 ratio)."
              value={form.image}
              folder="blog"
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              aspectRatio="aspect-[16/7]"
            />
          </section>

          {/* ── Additional Images ── */}
          <section>
            <SectionTitle>Additional Images</SectionTitle>
            <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mb-4">
              Upload supporting photos for this post. These can be referenced or displayed alongside the article.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
              {form.additionalImages.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-[8px] border border-[hsl(var(--adm-border))]">
                  <img src={img} alt={`Additional ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeAdditionalImage(i)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-[8px] bg-black/60 text-white hover:bg-red-500/90 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* Upload new additional image */}
              <AdminDropzone
                label=""
                folder="blog"
                value=""
                onChange={(url) => { if (url) setForm((f) => ({ ...f, additionalImages: [...f.additionalImages, url] })); }}
                aspectRatio="aspect-square"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--adm-muted-foreground))]">
              <Images className="h-3.5 w-3.5" />
              <span>{form.additionalImages.length} additional image{form.additionalImages.length !== 1 ? "s" : ""} uploaded</span>
            </div>
          </section>

          {/* ── Tags ── */}
          <section>
            <SectionTitle>Tags</SectionTitle>
            <FormField label="Tags" hint="Press Enter or comma to add a tag. Tags help with content discovery.">
              <div className="flex gap-2">
                <input type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag…"
                  className={`${inputCls} h-10 flex-1`} />
                <button type="button" onClick={addTag}
                  className="h-10 rounded-[8px] border border-[hsl(var(--adm-border))] px-4 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors">
                  <Tag className="h-3.5 w-3.5" />
                </button>
              </div>
            </FormField>
            {form.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.6)] px-3 py-1 text-xs font-medium text-[hsl(var(--adm-foreground))]">
                    {tag}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                      className="text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── Publication ── */}
          <section>
            <SectionTitle>Publication</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField label="Display Date" hint="Shown on the post (e.g. April 2025). Leave blank to hide.">
                <input type="text" value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  placeholder="e.g. April 2025"
                  className={`${inputCls} h-10`} />
              </FormField>
              <FormField label="Options">
                <label className="flex h-10 cursor-pointer items-center gap-3 rounded-[8px] border border-[hsl(var(--adm-border))] px-3 hover:bg-[hsl(var(--adm-accent)/0.3)] transition-colors">
                  <input type="checkbox" checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 accent-[hsl(var(--adm-primary))]" />
                  <div className="flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-[hsl(38_92%_50%)]" />
                    <span className="text-sm text-[hsl(var(--adm-foreground))]">Featured post</span>
                  </div>
                  <span className="ml-auto text-xs text-[hsl(var(--adm-muted-foreground))]">Shown prominently on listing</span>
                </label>
              </FormField>
            </div>

            <div className="mt-4 rounded-[8px] bg-[hsl(var(--adm-accent)/0.2)] border border-[hsl(var(--adm-border)/0.5)] p-3 text-xs text-[hsl(var(--adm-muted-foreground))]">
              <strong className="text-[hsl(var(--adm-foreground))]">SEO is generated automatically</strong> from your title, description, category, and tags.
              No manual SEO configuration needed.
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-[8px] border border-[hsl(var(--adm-destructive)/0.3)] bg-[hsl(var(--adm-destructive)/0.08)] px-4 py-3">
              <p className="text-sm text-[hsl(var(--adm-destructive))]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--adm-border)/0.4)]">
            <button type="button" onClick={() => router.push("/admin/blogs")}
              className="h-10 rounded-[8px] border border-[hsl(var(--adm-border))] bg-transparent px-5 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave("draft")} disabled={saving}
              className="h-10 rounded-[8px] border border-[hsl(var(--adm-border))] bg-transparent px-5 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors disabled:opacity-60">
              Save as Draft
            </button>
            <button type="button" onClick={() => handleSave()} disabled={saving}
              className="flex h-10 items-center gap-2 rounded-[8px] px-6 text-sm font-semibold text-[hsl(var(--adm-brand-foreground))] transition-all disabled:opacity-60"
              style={{ background: "hsl(var(--adm-brand))" }}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> {isNew ? "Publish Post" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

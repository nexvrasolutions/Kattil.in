"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Search, Pencil, Trash2, Star, FileText,
  X, Check, LayoutGrid, List, Eye,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/admin/ui/SkeletonLoader";
import AdminPagination from "@/components/admin/ui/AdminPagination";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  featured: boolean;
  status: "draft" | "published";
  author?: string;
  tags: string[];
  createdAt: string;
}


function StatusChanger({ blog, onChanged }: { blog: Blog; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const change = async (status: "draft" | "published") => {
    setSaving(true);
    setOpen(false);
    await fetch(`/api/admin/blogs/${blog._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    onChanged();
  };

  const isPublished = blog.status === "published";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80"
        style={{
          background: isPublished ? "hsl(142 76% 36% / 0.12)" : "hsl(var(--adm-muted))",
          color: isPublished ? "hsl(142 76% 30%)" : "hsl(var(--adm-muted-foreground))",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-[8px]" style={{ background: "currentColor" }} />
        {isPublished ? "Published" : "Draft"}
        <span className="opacity-50">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-36 rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] py-1">
            {(["published", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => change(s)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-[hsl(var(--adm-accent)/0.5)] ${blog.status === s ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-foreground))]"}`}
              >
                {blog.status === s ? <Check className="h-3 w-3" /> : <span className="h-3 w-3" />}
                {s === "published" ? "Published" : "Draft"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/blog-categories")
      .then((r) => r.json())
      .then((r) => { if (r.success) setCategories(r.data.categories.map((c: { name: string }) => c.name)); })
      .catch(() => {});
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);
    try {
      const res = await fetch(`/api/admin/blogs?${params}`).then((r) => r.json());
      if (res.success) {
        setBlogs(res.data.blogs);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterCategory, filterStatus]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/blogs/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchBlogs();
  };

  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const featuredCount = blogs.filter((b) => b.featured).length;

  return (
    <div>
      <PageHeader title="Blog Posts" subtitle="Manage your hotel journal and stories">
        <Link href="/admin/blogs/new">
          <AdminButton variant="default">
            <Plus className="h-4 w-4" /> Add Post
          </AdminButton>
        </Link>
      </PageHeader>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { label: "Total", value: total, icon: FileText, color: "hsl(var(--adm-primary))" },
          { label: "Published", value: publishedCount, icon: Check, color: "hsl(var(--adm-success))" },
          { label: "Featured", value: featuredCount, icon: Star, color: "hsl(var(--adm-warning))" },
          { label: "Drafts", value: total - publishedCount, icon: Eye, color: "hsl(var(--adm-muted-foreground))" },
        ].map(({ label, value, icon: Icon, color }) => (
          <AdminCard key={label} className="rounded-[8px]!">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[hsl(var(--adm-muted-foreground))]">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--adm-card-foreground))]">{value}</p>
              </div>
              <div className="rounded-[8px] p-2.5" style={{ background: `${color}20` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            </div>
          </AdminCard>
        ))}
      </motion.div>

      {/* Filters + View Toggle */}
      <AdminCard className="mb-6">
        <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--adm-muted-foreground))]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search posts…"
              className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-9 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="h-10 shrink-0 sm:w-[188px] rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-10 shrink-0 sm:w-[188px] rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          {(search || filterCategory || filterStatus) && (
            <AdminButton variant="ghost" onClick={() => { setSearch(""); setFilterCategory(""); setFilterStatus(""); setPage(1); }}>
              <X className="h-4 w-4" /> Clear
            </AdminButton>
          )}
          <div className="flex items-center gap-1 ml-auto rounded-[8px] border border-[hsl(var(--adm-border))] p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${viewMode === "list" ? "bg-[hsl(var(--adm-brand))] text-[hsl(var(--adm-brand-foreground))]" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${viewMode === "grid" ? "bg-[hsl(var(--adm-brand))] text-[hsl(var(--adm-brand-foreground))]" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminCard>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-[8px] adm-skeleton" />)}
            </div>
          ) : blogs.length === 0 ? (
            <AdminCard>
              <div className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-3" />
                <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No blog posts found</p>
                <Link href="/admin/blogs/new" className="mt-2 inline-block text-xs text-[hsl(var(--adm-primary))] hover:underline">
                  Write your first post
                </Link>
              </div>
            </AdminCard>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {blogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="group relative rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] bg-[hsl(var(--adm-muted))]">
                    {blog.image ? (
                      <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-10 w-10 text-[hsl(var(--adm-muted-foreground)/0.3)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Link href={`/admin/blogs/${blog._id}`}>
                        <button className="flex items-center gap-1.5 rounded-[8px] bg-white/90 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-white transition-colors">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteId(blog._id)}
                        className="flex items-center gap-1.5 rounded-[8px] bg-red-500/90 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    {blog.featured && (
                      <div className="absolute top-2 right-2">
                        <Star className="h-4 w-4 fill-[hsl(var(--adm-warning))] text-[hsl(var(--adm-warning))]" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="rounded-[8px] px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ background: blog.status === "published" ? "hsl(142 76% 36% / 0.85)" : "hsl(var(--adm-muted-foreground)/0.5)" }}>
                        {blog.status}
                      </span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase text-[hsl(var(--adm-primary))] mb-1.5">{blog.category}</p>
                    <p className="font-semibold text-sm text-[hsl(var(--adm-foreground))] leading-snug line-clamp-2 mb-2">{blog.title}</p>
                    <p className="text-xs text-[hsl(var(--adm-muted-foreground))] line-clamp-2 mb-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <StatusChanger blog={blog} onChanged={fetchBlogs} />
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/blogs/${blog._id}`}>
                          <button className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(blog._id)}
                          className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <AdminCard>
          {loading ? <div className="p-6"><SkeletonTable /></div> : (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--adm-border)/0.5)] bg-[hsl(var(--adm-muted)/0.4)]">
                    {["Post", "Category", "Author", "Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-[hsl(var(--adm-muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blogs.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center">
                      <FileText className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-3" />
                      <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No blog posts found</p>
                      <Link href="/admin/blogs/new" className="mt-2 inline-block text-xs text-[hsl(var(--adm-primary))] hover:underline">
                        Write your first post
                      </Link>
                    </td></tr>
                  ) : blogs.map((blog) => (
                    <tr key={blog._id} className="border-b border-[hsl(var(--adm-border)/0.3)] transition-colors hover:bg-[hsl(var(--adm-accent)/0.25)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {blog.image ? (
                            <img src={blog.image} alt={blog.title} className="h-10 w-16 rounded-[8px] object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-16 rounded-[8px] bg-[hsl(var(--adm-muted))] flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-[hsl(var(--adm-muted-foreground)/0.5)]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-[hsl(var(--adm-foreground))] line-clamp-1">{blog.title}</p>
                            <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">/{blog.slug}</p>
                          </div>
                          {blog.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-[hsl(var(--adm-warning))] text-[hsl(var(--adm-warning))]" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge variant="secondary" className="text-[10px]">{blog.category}</AdminBadge>
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--adm-muted-foreground))]">{blog.author ?? "—"}</td>
                      <td className="px-4 py-3 text-[hsl(var(--adm-muted-foreground))] whitespace-nowrap">{blog.date || "—"}</td>
                      <td className="px-4 py-3"><StatusChanger blog={blog} onChanged={fetchBlogs} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/blogs/${blog._id}`}>
                            <button className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteId(blog._id)}
                            className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 pb-4">
            <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} itemLabel="posts" />
          </div>
        </AdminCard>
      )}

      {viewMode === "grid" && (
        <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} itemLabel="posts" />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete Post"
      />
    </div>
  );
}

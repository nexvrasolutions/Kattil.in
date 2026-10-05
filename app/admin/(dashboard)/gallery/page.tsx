"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Images, X, Star, StarOff,
  GripVertical, Eye,
  Tag, Pencil, Check,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import AdminPagination from "@/components/admin/ui/AdminPagination";

const EASE = [0.22, 1, 0.36, 1] as const;

function galleryFolderForCity(city: City | null | undefined): string {
  const name = city?.name?.toLowerCase() ?? "";
  if (name.includes("madurai")) return "madurai-gallery";
  if (name.includes("chennai")) return "chennai-gallery";
  return "madurai-gallery";
}

interface City { _id: string; name: string }
interface GalleryCategory { _id: string; name: string; slug: string; order: number }
interface GalleryItem {
  _id: string; src: string; alt: string; caption?: string;
  category: string; tags: string[]; city?: City | null;
  featured: boolean; order: number;
}

const EMPTY_FORM: Omit<GalleryItem, "_id" | "order"> = {
  src: "", alt: "", caption: "", category: "", tags: [], city: null, featured: false,
};

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => { const t = input.trim(); if (t && !value.includes(t)) { onChange([...value, t]); setInput(""); } };
  return (
    <div className="flex flex-wrap gap-1.5 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 py-2 min-h-[40px]">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-[8px] bg-[hsl(var(--adm-primary)/0.1)] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--adm-primary))]">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add} placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[hsl(var(--adm-foreground))] outline-none placeholder:text-[hsl(var(--adm-muted-foreground))]" />
    </div>
  );
}

// ─── Category Management Panel ───────────────────────────────────────────────
function CategoryManager({
  categories,
  onRefresh,
}: {
  categories: GalleryCategory[];
  onRefresh: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/gallery-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json());
      if (res.success) { setNewName(""); onRefresh(); }
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/gallery-categories/${id}`, { method: "DELETE" });
    setDeleteId(null);
    onRefresh();
  };

  const handleRename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    await fetch(`/api/admin/gallery-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setEditId(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Add new category */}
      <div>
        <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">Add New Category</label>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Rooftop, Dining, Events…"
            className="flex h-10 flex-1 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          />
          <AdminButton onClick={handleAdd} loading={adding} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" /> Add
          </AdminButton>
        </div>
        <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">
          Categories appear in the gallery filter and as options when uploading images.
        </p>
      </div>

      {/* Category list */}
      <div className="space-y-1.5">
        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-[hsl(var(--adm-muted-foreground)/0.6)] italic">No categories yet. Add one above.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat._id}
              className="flex items-center gap-3 rounded-[8px] border border-[hsl(var(--adm-border)/0.5)] bg-[hsl(var(--adm-accent)/0.1)] px-3 py-2.5">
              <Tag className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--adm-primary))]" />
              {editId === cat._id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(cat._id); if (e.key === "Escape") setEditId(null); }}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-[hsl(var(--adm-foreground))] outline-none border-b border-[hsl(var(--adm-primary))]"
                />
              ) : (
                <span className="flex-1 text-sm text-[hsl(var(--adm-foreground))]">{cat.name}</span>
              )}
              <span className="text-[10px] text-[hsl(var(--adm-muted-foreground)/0.5)]">{cat.slug}</span>
              {editId === cat._id ? (
                <button onClick={() => handleRename(cat._id)}
                  className="rounded-[8px] p-1.5 text-[hsl(var(--adm-primary))] hover:bg-[hsl(var(--adm-primary)/0.1)] transition-colors">
                  <Check className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button onClick={() => { setEditId(cat._id); setEditName(cat.name); }}
                  className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => setDeleteId(cat._id)}
                className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Category"
        message="This will delete the category. Existing gallery images using this category will keep their current value but won't match any category in the filter."
        variant="destructive" confirmLabel="Delete" />
    </div>
  );
}

// ─── Main Gallery Page ───────────────────────────────────────────────────────
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({ src: "", alt: "", category: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const allCategories = categories.map((c) => c.slug);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filterCategory) params.set("category", filterCategory);
    if (filterCity) params.set("city", filterCity);
    if (filterFeatured) params.set("featured", filterFeatured);
    try {
      const res = await fetch(`/api/admin/gallery?${params}`).then((r) => r.json());
      if (res.success) { setItems(res.data.items); setTotalPages(res.data.pagination.pages); setTotal(res.data.pagination.total); }
    } finally { setLoading(false); }
  }, [page, limit, filterCategory, filterCity, filterFeatured]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/gallery-categories").then((r) => r.json());
    if (res.success) setCategories(res.data);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetch("/api/admin/cities?limit=100").then((r) => r.json()).then((r) => r.success && setCities(r.data.cities)); }, []);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const clearErrors = () => setFormErrors({ src: "", alt: "", category: "" });

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, category: allCategories[0] ?? "" });
    clearErrors();
    setEditingItem(null);
    setIsModalOpen(true);
  };
  const openEdit = (item: GalleryItem) => { setForm({ ...item }); clearErrors(); setEditingItem(item); setIsModalOpen(true); };

  const handleSave = async () => {
    const errors = { src: "", alt: "", category: "" };
    if (!form.src) errors.src = "Image is required";
    if (!form.alt.trim()) errors.alt = "Alt text is required";
    if (!form.category) errors.category = "Category is required";
    if (errors.src || errors.alt || errors.category) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      const url = editingItem ? `/api/admin/gallery/${editingItem._id}` : "/api/admin/gallery";
      const method = editingItem ? "PUT" : "POST";
      const body = { ...form, city: (form.city as City | null)?._id ?? null };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
      if (res.success) { setIsModalOpen(false); fetchItems(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/gallery/${deleteId}`, { method: "DELETE" });
    setDeleteId(null); fetchItems();
  };

  const toggleFeatured = async (item: GalleryItem) => {
    await fetch(`/api/admin/gallery/${item._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !item.featured }),
    });
    fetchItems();
  };

  const categoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div>
      <PageHeader title="Gallery" subtitle={`${total} images across all locations`}>
        <AdminButton variant="outline" onClick={() => setShowCategories(true)}>
          <Tag className="h-4 w-4" /> Manage Categories
        </AdminButton>
        <AdminButton onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Gallery
        </AdminButton>
      </PageHeader>

      {/* Filters */}
      <AdminCard className="mb-6">
        <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="h-10 shrink-0 sm:w-[188px] rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]">
            <option value="">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
          </select>
          <select value={filterCity} onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
            className="h-10 shrink-0 sm:w-[188px] rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]">
            <option value="">All Cities</option>
            {cities.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={filterFeatured} onChange={(e) => { setFilterFeatured(e.target.value); setPage(1); }}
            className="h-10 shrink-0 sm:w-[188px] rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]">
            <option value="">All Images</option>
            <option value="true">Featured Only</option>
          </select>
          <div className="flex items-center gap-1.5 rounded-[8px] border border-[hsl(var(--adm-border))] p-1 ml-auto">
            {(["grid", "list"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setViewMode(m)}
                className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === m ? "bg-[hsl(var(--adm-brand))] text-[hsl(var(--adm-brand-foreground))]" : "text-[hsl(var(--adm-muted-foreground))]"}`}>
                {m === "grid" ? "Grid" : "List"}
              </button>
            ))}
          </div>
          {(filterCategory || filterCity || filterFeatured) && (
            <AdminButton variant="ghost" size="sm" onClick={() => { setFilterCategory(""); setFilterCity(""); setFilterFeatured(""); setPage(1); }}>
              <X className="h-4 w-4" /> Clear
            </AdminButton>
          )}
        </div>
      </AdminCard>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => <div key={i} className="aspect-square rounded-[8px] adm-skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--adm-border))] py-24">
          <Images className="h-16 w-16 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-4" />
          <p className="text-lg font-semibold text-[hsl(var(--adm-foreground))]">No images yet</p>
          <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">Start building your gallery</p>
          <AdminButton onClick={openAdd} className="mt-4"><Plus className="h-4 w-4" /> Add Gallery</AdminButton>
        </div>
      ) : viewMode === "grid" ? (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        >
          {items.map((item) => (
            <motion.div
              key={item._id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: EASE } } }}
              className="group relative aspect-square overflow-hidden rounded-[8px] border border-[hsl(var(--adm-border)/0.4)]"
            >
              <img src={item.src} alt={item.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => setPreviewItem(item)} className="rounded-[8px] bg-black/70 p-2.5 hover:bg-black/90 transition-colors">
                  <Eye className="h-4 w-4 text-white" />
                </button>
                <button onClick={() => openEdit(item)} className="rounded-[8px] bg-black/70 p-2.5 hover:bg-black/90 transition-colors">
                  <GripVertical className="h-4 w-4 text-white" />
                </button>
                <button onClick={() => setDeleteId(item._id)} className="rounded-[8px] bg-red-600/80 p-2.5 hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
              <button onClick={() => toggleFeatured(item)} className="absolute top-2 right-2">
                {item.featured
                  ? <Star className="h-4 w-4 fill-[hsl(var(--adm-warning))] text-[hsl(var(--adm-warning))]" />
                  : <StarOff className="h-4 w-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
              <div className="absolute bottom-2 left-2">
                <span className="rounded-[8px] bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">{categoryLabel(item.category)}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <AdminCard>
          <div className="divide-y divide-[hsl(var(--adm-border)/0.4)]">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 px-5 py-3 hover:bg-[hsl(var(--adm-accent)/0.2)] transition-colors">
                <img src={item.src} alt={item.alt} className="h-14 w-20 rounded-[8px] object-cover shrink-0 border border-[hsl(var(--adm-border)/0.4)]" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[hsl(var(--adm-foreground))] truncate">{item.alt}</p>
                  <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mt-0.5 truncate">{item.src}</p>
                </div>
                <AdminBadge variant="secondary">{categoryLabel(item.category)}</AdminBadge>
                {item.city && <AdminBadge variant="outline">{(item.city as City).name}</AdminBadge>}
                {item.featured && <AdminBadge variant="warning"><Star className="h-3 w-3" /> Featured</AdminBadge>}
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(item)} className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(item._id)} className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} itemLabel="images" />

      {/* Add/Edit Modal */}
      <AdminModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); clearErrors(); }} title={editingItem ? "Edit Image" : "Add Image"} size="lg">
        <div className="space-y-4">
          <div>
            <AdminDropzone
              label="Image"
              required
              hint="Select the city first, then upload. Madurai images → images/madurai-gallery, Chennai → images/chennai-gallery."
              value={form.src}
              onChange={(url) => { setForm((f) => ({ ...f, src: url })); setFormErrors((e) => ({ ...e, src: "" })); }}
              folder={galleryFolderForCity(form.city as City | null)}
              aspectRatio="aspect-video"
            />
            {formErrors.src && <p className="mt-1 text-xs text-red-500">{formErrors.src}</p>}
          </div>
          <div>
            <AdminInput
              label="Alt Text"
              required
              value={form.alt}
              onChange={(e) => { setForm((f) => ({ ...f, alt: e.target.value })); setFormErrors((errs) => ({ ...errs, alt: "" })); }}
              placeholder="Describe the image for accessibility"
              error={formErrors.alt}
            />
            {!formErrors.alt && <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">A short description of the image — shown to screen readers and when the image can&apos;t load.</p>}
          </div>
          <div>
            <AdminInput label="Caption" value={form.caption ?? ""} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Optional caption shown below the image" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => { setForm((f) => ({ ...f, category: e.target.value })); setFormErrors((errs) => ({ ...errs, category: "" })); }}
                className={`flex h-10 w-full rounded-[8px] border px-3 text-sm text-[hsl(var(--adm-foreground))] bg-[hsl(var(--adm-background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] ${formErrors.category ? "border-red-500" : "border-[hsl(var(--adm-input))]"}`}
              >
                <option value="">Select category…</option>
                {allCategories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
              </select>
              {formErrors.category
                ? <p className="mt-1 text-xs text-red-500">{formErrors.category}</p>
                : <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Groups images in the gallery filter. Manage categories from the &quot;Manage Categories&quot; button.</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">City</label>
              <select value={(form.city as City | null)?._id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, city: cities.find((c) => c._id === e.target.value) ?? null }))}
                className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]">
                <option value="">Select city…</option>
                {cities.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Associates this image with a specific hotel location.</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">Tags</label>
            <TagInput value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} placeholder="Add tags — press Enter or comma to confirm" />
            <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Optional keywords for search and filtering (e.g. "pool", "sunset", "interior").</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-[8px] transition-colors ${form.featured ? "bg-[hsl(var(--adm-brand))]" : "bg-[hsl(var(--adm-muted))]"}`}>
              <span className={`inline-block h-4 w-4 rounded-[8px] bg-white transition-transform ${form.featured ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <div>
              <span className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Featured Image</span>
              <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">Featured images appear prominently on the homepage and gallery hero.</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[hsl(var(--adm-border)/0.4)] pt-4">
          <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</AdminButton>
          <AdminButton onClick={handleSave} loading={saving}>{editingItem ? "Save Changes" : "Add Gallery"}</AdminButton>
        </div>
      </AdminModal>

      {/* Category Management Modal */}
      <AdminModal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Manage Categories" size="md">
        <CategoryManager categories={categories} onRefresh={fetchCategories} />
        <div className="mt-6 flex justify-end border-t border-[hsl(var(--adm-border)/0.4)] pt-4">
          <AdminButton variant="outline" onClick={() => setShowCategories(false)}>Done</AdminButton>
        </div>
      </AdminModal>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewItem(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={previewItem.src} alt={previewItem.alt} className="max-h-[80vh] w-full rounded-[8px] object-contain" />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{previewItem.alt}</p>
                  {previewItem.caption && <p className="text-sm text-white/60">{previewItem.caption}</p>}
                </div>
                <button onClick={() => setPreviewItem(null)} className="rounded-[8px] bg-white/20 p-2 text-white hover:bg-white/30">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Image" message="Remove this image from the gallery?" variant="destructive" confirmLabel="Delete" />
    </div>
  );
}

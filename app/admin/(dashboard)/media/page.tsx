"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Search, Trash2, Upload, X, Eye, Tag, Filter,
  Image as ImageIcon,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import AdminPagination from "@/components/admin/ui/AdminPagination";

const EASE = [0.22, 1, 0.36, 1] as const;

interface MediaItem {
  _id: string; filename: string; originalName: string; url: string;
  mimeType: string; size: number; width?: number; height?: number;
  folder: string; tags: string[]; alt?: string; createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Upload URL form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({ url: "", alt: "", folder: "general" });

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterFolder) params.set("folder", filterFolder);
    try {
      const res = await fetch(`/api/admin/media?${params}`).then((r) => r.json());
      if (res.success) {
        setItems(res.data.items);
        setFolders(res.data.folders ?? []);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } finally { setLoading(false); }
  }, [page, limit, search, filterFolder]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/media/${deleteId}`, { method: "DELETE" });
    setDeleteId(null); fetchMedia();
  };

  const handleUploadUrl = async () => {
    if (!uploadForm.url) return;
    const filename = uploadForm.url.split("/").pop() ?? "image";
    const res = await fetch("/api/admin/media", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename, originalName: filename, url: uploadForm.url,
        mimeType: "image/jpeg", size: 0,
        alt: uploadForm.alt, folder: uploadForm.folder,
      }),
    }).then((r) => r.json());
    if (res.success) { setShowUploadForm(false); setUploadForm({ url: "", alt: "", folder: "general" }); fetchMedia(); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  return (
    <div>
      <PageHeader title="Media Library" subtitle={`${total} files · ${formatBytes(totalSize)}`}>
        <AdminButton onClick={() => setShowUploadForm(!showUploadForm)}>
          <Upload className="h-4 w-4" /> Add Media URL
        </AdminButton>
      </PageHeader>

      {/* Upload URL form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }} className="mb-6 overflow-hidden">
            <AdminCard className="!rounded-[8px]">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[hsl(var(--adm-foreground))]">Add Image by URL</h3>
                  <button onClick={() => setShowUploadForm(false)} className="rounded-[8px] p-1 hover:bg-[hsl(var(--adm-accent))]">
                    <X className="h-4 w-4 text-[hsl(var(--adm-muted-foreground))]" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <AdminInput label="Image URL" value={uploadForm.url} onChange={(e) => setUploadForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">Folder</label>
                    <select value={uploadForm.folder} onChange={(e) => setUploadForm((f) => ({ ...f, folder: e.target.value }))}
                      className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none">
                      {["general", "rooms", "gallery", "banners", "team", "other"].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <AdminInput label="Alt Text" value={uploadForm.alt} onChange={(e) => setUploadForm((f) => ({ ...f, alt: e.target.value }))} placeholder="Describe the image" />
                <div className="flex justify-end gap-2">
                  <AdminButton variant="outline" size="sm" onClick={() => setShowUploadForm(false)}>Cancel</AdminButton>
                  <AdminButton size="sm" onClick={handleUploadUrl}>Add to Library</AdminButton>
                </div>
              </div>
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folders sidebar + main */}
      <div className="flex gap-6">
        {/* Folders */}
        <div className="w-48 shrink-0">
          <AdminCard className="!rounded-[8px]">
            <div className="p-3">
              <p className="mb-2 text-xs font-bold uppercase text-[hsl(var(--adm-muted-foreground))] px-2">Folders</p>
              <button
                onClick={() => setFilterFolder("")}
                className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-sm transition-colors ${!filterFolder ? "bg-[hsl(var(--adm-primary)/0.1)] text-[hsl(var(--adm-primary))] font-medium" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}
              >
                <FolderOpen className="h-4 w-4" />
                All Files
                <span className="ml-auto text-xs">{total}</span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => { setFilterFolder(folder); setPage(1); }}
                  className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-sm capitalize transition-colors ${filterFolder === folder ? "bg-[hsl(var(--adm-primary)/0.1)] text-[hsl(var(--adm-primary))] font-medium" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}
                >
                  <FolderOpen className="h-4 w-4" />
                  {folder}
                </button>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--adm-muted-foreground))]" />
              <input
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search files…"
                className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-9 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
              />
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[hsl(var(--adm-muted-foreground))]">{selected.size} selected</span>
                <AdminButton variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5" /> Delete</AdminButton>
                <AdminButton variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</AdminButton>
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {[...Array(12)].map((_, i) => <div key={i} className="aspect-square rounded-[8px] adm-skeleton" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--adm-border))] py-24">
              <ImageIcon className="h-16 w-16 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-4" />
              <p className="text-lg font-semibold">No files yet</p>
              <AdminButton onClick={() => setShowUploadForm(true)} className="mt-4"><Upload className="h-4 w-4" /> Add Media</AdminButton>
            </div>
          ) : (
            <motion.div initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((item) => (
                <motion.div key={item._id}
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE } } }}
                  className={`group relative aspect-square overflow-hidden rounded-[8px] border-2 transition-colors ${selected.has(item._id) ? "border-[hsl(var(--adm-primary))]" : "border-transparent"}`}
                  onClick={() => toggleSelect(item._id)}
                >
                  <img src={item.url} alt={item.alt ?? item.originalName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/50" />
                  {selected.has(item._id) && (
                    <div className="absolute top-2 left-2 rounded-[8px] bg-[hsl(var(--adm-brand))] p-0.5">
                      <X className="h-3 w-3 text-[hsl(var(--adm-brand-foreground))]" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                      className="rounded-[8px] bg-white/90 p-2 hover:bg-white"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(item._id); }}
                      className="rounded-[8px] bg-white/90 p-2 hover:bg-white"><Trash2 className="h-3.5 w-3.5 text-[hsl(var(--adm-destructive))]" /></button>
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <span className="block truncate rounded-[8px] bg-black/60 px-2 py-0.5 text-[10px] text-white">{item.originalName}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} itemLabel="files" />
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {previewItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewItem(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={previewItem.url} alt={previewItem.alt ?? ""} className="max-h-[70vh] w-full rounded-[8px] object-contain" />
              <div className="mt-3 rounded-[8px] bg-white/10 backdrop-blur-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{previewItem.originalName}</p>
                    <p className="text-sm text-white/60">{previewItem.mimeType} · {formatBytes(previewItem.size)}</p>
                    {previewItem.alt && <p className="text-xs text-white/50 mt-1">{previewItem.alt}</p>}
                  </div>
                  <div className="flex gap-2">
                    <AdminBadge variant="secondary">{previewItem.folder}</AdminBadge>
                    <button onClick={() => setPreviewItem(null)} className="rounded-[8px] bg-white/20 p-1.5 hover:bg-white/30">
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete File" message="Permanently delete this file from the media library?" variant="destructive" confirmLabel="Delete" />
    </div>
  );
}

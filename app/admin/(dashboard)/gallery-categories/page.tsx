"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Images, Tag, Check, X } from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

const EASE = [0.22, 1, 0.36, 1] as const;

interface GalleryCategory { _id: string; name: string; slug: string; order: number }

export default function GalleryCategoriesPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState("");
  const [adding,     setAdding]     = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [editName,   setEditName]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gallery-categories").then((r) => r.json());
      if (res.success) setCategories(res.data);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gallery-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json());
      if (res.success) {
        setNewName("");
        fetchCategories();
      } else {
        setError(res.error ?? "Failed to add category.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/gallery-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json());
      if (res.success) {
        setEditId(null);
        fetchCategories();
      } else {
        setError(res.error ?? "Failed to rename category.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/gallery-categories/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <div>
      <PageHeader
        title="Gallery Categories"
        subtitle="Organise your gallery images into browsable groups"
      >
        <Link href="/admin/gallery">
          <AdminButton variant="outline">
            <Images className="h-4 w-4" /> View Gallery
          </AdminButton>
        </Link>
        <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </span>
      </PageHeader>

      {/* Add new category */}
      <AdminCard className="mb-6">
        <div className="p-5">
          <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))] mb-3">
            Add New Category
          </p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Rooftop, Dining, Rooms, Events…"
              className="flex-1 h-11 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3.5 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-all"
            />
            <AdminButton onClick={handleAdd} loading={adding} disabled={!newName.trim()}>
              <Plus className="h-4 w-4" /> Add
            </AdminButton>
          </div>
          {error && (
            <p className="mt-2 text-xs font-medium text-[hsl(var(--adm-destructive))]">{error}</p>
          )}
          <p className="mt-2 text-xs text-[hsl(var(--adm-muted-foreground))]">
            Categories appear as filter tabs in the public gallery and as options when uploading images.
          </p>
        </div>
      </AdminCard>

      {/* Category list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-[8px] adm-skeleton" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <AdminCard>
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="rounded-[8px] bg-[hsl(var(--adm-accent)/0.5)] p-4">
              <Tag className="h-8 w-8 text-[hsl(var(--adm-muted-foreground)/0.5)]" />
            </div>
            <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))]">No categories yet</p>
            <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">
              Add your first category above to start organising your gallery
            </p>
          </div>
        </AdminCard>
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="divide-y divide-[hsl(var(--adm-border)/0.4)]">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: EASE, duration: 0.28 }}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[hsl(var(--adm-accent)/0.3)] transition-colors group"
              >
                {/* Icon */}
                <div className="rounded-[8px] p-1.5 bg-[hsl(var(--adm-primary)/0.1)] shrink-0">
                  <Tag className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                </div>

                {/* Name / inline edit */}
                {editId === cat._id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit(cat._id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    className="flex-1 h-9 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-2.5 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[hsl(var(--adm-foreground))]">{cat.name}</p>
                    <p className="text-[10px] text-[hsl(var(--adm-muted-foreground)/0.6)]">/{cat.slug}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {editId === cat._id ? (
                    <>
                      <button
                        onClick={() => handleEdit(cat._id)}
                        disabled={saving}
                        title="Save"
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-success))] hover:bg-[hsl(var(--adm-success)/0.1)] transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        title="Cancel"
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditId(cat._id); setEditName(cat.name); }}
                        title="Rename"
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat._id)}
                        title="Delete"
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AdminCard>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Delete this category? Gallery images using it will keep their current value but won't appear under this filter in the gallery."
        variant="destructive"
        confirmLabel="Delete"
      />
    </div>
  );
}

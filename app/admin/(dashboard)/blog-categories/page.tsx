"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tag, Check, X } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Category { _id: string; name: string; slug: string; active: boolean; order: number }

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState("");
  const [adding,     setAdding]     = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [editName,   setEditName]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog-categories").then((r) => r.json());
      if (res.success) setCategories(res.data.categories);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      }).then((r) => r.json());
      if (res.success) { setNewName(""); fetchCategories(); }
    } finally { setAdding(false); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/blog-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      setEditId(null);
      fetchCategories();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/blog-categories/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <div>
      <PageHeader title="Blog Categories" subtitle="Manage categories for your blog posts">
        <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">{categories.length} categories</span>
      </PageHeader>

      {/* Add new category */}
      <AdminCard className="rounded-[8px]! mb-6">
        <div className="p-4 flex items-center gap-3">
          <Tag className="h-4 w-4 shrink-0 text-[hsl(var(--adm-primary))]" />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="New category name… (e.g. Travel Guide, Wellness, Dining)"
            className="flex-1 h-10 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          />
          <AdminButton onClick={handleAdd} loading={adding} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" /> Add
          </AdminButton>
        </div>
      </AdminCard>

      {/* Category list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-[8px] adm-skeleton" />)}
        </div>
      ) : categories.length === 0 ? (
        <AdminCard>
          <div className="flex flex-col items-center py-16 gap-3">
            <Tag className="h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)]" />
            <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No categories yet</p>
            <p className="text-xs text-[hsl(var(--adm-muted-foreground)/0.7)]">Add your first category above</p>
          </div>
        </AdminCard>
      ) : (
        <AdminCard className="rounded-[8px]! overflow-hidden">
          <div className="divide-y divide-[hsl(var(--adm-border)/0.4)]">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: EASE }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--adm-accent)/0.3)] transition-colors"
              >
                <div className="rounded-[8px] p-1.5 bg-[hsl(var(--adm-primary)/0.1)]">
                  <Tag className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                </div>

                {editId === cat._id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEdit(cat._id); if (e.key === "Escape") setEditId(null); }}
                    className="flex-1 h-8 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[hsl(var(--adm-foreground))]">{cat.name}</p>
                    <p className="text-[10px] text-[hsl(var(--adm-muted-foreground))]">/{cat.slug}</p>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {editId === cat._id ? (
                    <>
                      <button onClick={() => handleEdit(cat._id)} disabled={saving}
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-success))] hover:bg-[hsl(var(--adm-success)/0.1)] transition-colors">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(cat._id); setEditName(cat.name); }}
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(cat._id)}
                        className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors">
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

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Category" message="Delete this category? Blog posts using it will keep their category text but it won't appear in the dropdown."
        variant="destructive" confirmLabel="Delete" />
    </div>
  );
}

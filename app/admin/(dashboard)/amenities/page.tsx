"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Sparkles, Eye, EyeOff } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { AmenityIcon, AMENITY_ICON_OPTIONS } from "@/components/admin/ui/AmenityIcon";
import { DEFAULT_AMENITY_ICON } from "@/lib/amenities";
import { toast } from "sonner";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Amenity {
  _id: string;
  name: string;
  icon: string;
  description?: string;
  visible: boolean;
  order: number;
  usage?: { rooms: number; properties: number };
}

type AmenityForm = Omit<Amenity, "_id" | "usage">;

const EMPTY_FORM: AmenityForm = {
  name: "", icon: DEFAULT_AMENITY_ICON, description: "", visible: true, order: 0,
};

function describeUsage(usage?: Amenity["usage"]) {
  if (!usage) return "";
  const parts = [];
  if (usage.rooms) parts.push(`${usage.rooms} room${usage.rooms === 1 ? "" : "s"}`);
  if (usage.properties) parts.push(`${usage.properties} propert${usage.properties === 1 ? "y" : "ies"}`);
  return parts.join(" · ");
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Amenity | null>(null);
  const [form, setForm] = useState<AmenityForm>(EMPTY_FORM);
  const [deleteItem, setDeleteItem] = useState<Amenity | null>(null);

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/amenities?limit=500&usage=true").then((r) => r.json());
      if (res.success) setAmenities(res.data.amenities);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, order: amenities.length });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (a: Amenity) => {
    setForm({ name: a.name, icon: a.icon, description: a.description ?? "", visible: a.visible, order: a.order });
    setEditingItem(a);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Amenity name is required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingItem ? `/api/admin/amenities/${editingItem._id}` : "/api/admin/amenities";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());
      if (res.success) { setIsModalOpen(false); fetchAmenities(); }
      else toast.error(res.error || "Failed to save amenity.");
    } catch {
      toast.error("Failed to save amenity.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const res = await fetch(`/api/admin/amenities/${deleteItem._id}`, { method: "DELETE" })
      .then((r) => r.json())
      .catch(() => null);
    if (!res?.success) toast.error(res?.error || "Failed to delete amenity.");
    setDeleteItem(null);
    fetchAmenities();
  };

  const toggleVisible = async (a: Amenity) => {
    await fetch(`/api/admin/amenities/${a._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !a.visible }),
    });
    fetchAmenities();
  };

  const visibleCount = amenities.filter((a) => a.visible).length;

  return (
    <div>
      <PageHeader title="Amenities" subtitle={`${amenities.length} total · ${visibleCount} visible on website`}>
        <AdminButton onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Amenity
        </AdminButton>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(9)].map((_, i) => <div key={i} className="h-36 rounded-[8px] adm-skeleton" />)}
        </div>
      ) : amenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--adm-border))] py-24">
          <Sparkles className="h-16 w-16 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-4" />
          <p className="text-lg font-semibold text-[hsl(var(--adm-foreground))]">No amenities yet</p>
          <AdminButton onClick={openAdd} className="mt-4"><Plus className="h-4 w-4" /> Add Amenity</AdminButton>
        </div>
      ) : (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {amenities.map((amenity) => (
            <motion.div
              key={amenity._id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } } }}
              className="group"
            >
              <AdminCard className={`rounded-[8px]! overflow-hidden h-full transition-opacity ${!amenity.visible ? "opacity-40" : ""}`}>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="rounded-[8px] bg-[hsl(var(--adm-primary)/0.1)] p-2.5">
                      <AmenityIcon name={amenity.icon} className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-[hsl(var(--adm-muted-foreground))]">
                      #{amenity.order}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-sm text-[hsl(var(--adm-card-foreground))] leading-snug">{amenity.name}</p>
                    <p className="text-[10px] font-medium text-[hsl(var(--adm-muted-foreground))] mt-0.5">{amenity.icon}</p>
                    {describeUsage(amenity.usage) && (
                      <p className="text-[10px] font-medium text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                        Used in {describeUsage(amenity.usage)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleVisible(amenity)}
                      title={amenity.visible ? "Hide" : "Show"}
                      className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors"
                    >
                      {amenity.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(amenity)}
                      className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(amenity)}
                      className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Amenity" : "Add Amenity"}
        size="md"
      >
        <div className="space-y-4">
          <AdminInput
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. High Speed Wi-Fi"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">Icon</label>
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
              >
                {!AMENITY_ICON_OPTIONS.includes(form.icon) && <option value={form.icon}>{form.icon}</option>}
                {AMENITY_ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <AdminInput
              label="Display Order"
              type="number"
              value={String(form.order)}
              onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <AdminTextarea
            label="Description (optional)"
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description of this amenity"
          />
          <label className="flex h-10 cursor-pointer items-center gap-3 rounded-[8px] border border-[hsl(var(--adm-border))] px-3 hover:bg-[hsl(var(--adm-accent)/0.3)] transition-colors">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-[8px] transition-colors ${form.visible ? "bg-[hsl(var(--adm-brand))]" : "bg-[hsl(var(--adm-muted))]"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-[8px] bg-white transition-transform ${form.visible ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm text-[hsl(var(--adm-foreground))]">Visible on website</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[hsl(var(--adm-border)/0.4)] pt-4">
          <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</AdminButton>
          <AdminButton onClick={handleSave} loading={saving}>{editingItem ? "Save Changes" : "Add Amenity"}</AdminButton>
        </div>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Amenity"
        message={
          describeUsage(deleteItem?.usage)
            ? `"${deleteItem?.name}" is used in ${describeUsage(deleteItem?.usage)}. Deleting it will also remove it from them.`
            : `Delete "${deleteItem?.name ?? ""}"? This cannot be undone.`
        }
        variant="destructive"
        confirmLabel="Delete"
      />
    </div>
  );
}

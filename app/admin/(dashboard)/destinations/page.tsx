"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin, Building, ExternalLink, Image as ImageIcon } from "lucide-react";
import {
  AdminCard,
} from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Destination {
  _id: string;
  name: string;
  slug: string;
  label?: string;
  description?: string;
  banner?: string;
  image?: string;
  hotelCount?: string;
  link?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapSrc?: string;
  active: boolean;
  order: number;
  seo?: { title?: string; description?: string; keywords?: string; ogImage?: string };
}

const EMPTY_FORM: Omit<Destination, "_id"> = {
  name: "",
  slug: "",
  label: "",
  description: "",
  banner: "",
  image: "",
  hotelCount: "1 hotels",
  link: "",
  address: "",
  phone: "",
  email: "",
  mapSrc: "",
  active: true,
  order: 0,
  seo: { title: "", description: "", keywords: "", ogImage: "" },
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

const GRADIENT_PAIRS = [
  "from-[#0d1b2e] to-[#3a5535]",       // deep navy → dark sage
  "from-[#526442] to-[#9CAF88]",        // dark sage → sage green
  "from-[#162840] to-[#526442]",        // medium navy → sage
  "from-[#3d6080] to-[#9CAF88]",        // mid navy → sage green
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "media" | "contact" | "seo">("basic");

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cities?limit=100").then((r) => r.json());
      if (res.success) setDestinations(res.data.cities);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingDestination(null);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const openEdit = (dest: Destination) => {
    setForm({
      ...EMPTY_FORM,
      ...dest,
      seo: { ...EMPTY_FORM.seo, ...dest.seo },
    });
    setEditingDestination(dest);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingDestination
        ? `/api/admin/cities/${editingDestination._id}`
        : "/api/admin/cities";
      const method = editingDestination ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());

      if (res.success) {
        setIsModalOpen(false);
        fetchDestinations();
      } else {
        alert(res.error || "Failed to save destination");
      }
    } catch {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/cities/${deleteId}`, { method: "DELETE" }).then((r) => r.json());
    if (!res.success) {
      alert(res.error || "Failed to delete");
    } else {
      fetchDestinations();
    }
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Destinations"
        subtitle="Manage hotel locations & dropdown properties shown when hovering Destinations in navbar"
      >
        <AdminButton onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Destination
        </AdminButton>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl adm-skeleton" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[hsl(var(--adm-border))] py-24"
        >
          <Building className="h-16 w-16 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-4" />
          <p className="text-lg font-semibold text-[hsl(var(--adm-foreground))]">No destinations yet</p>
          <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">
            Add your first hotel destination to show in the hover dropdown menu
          </p>
          <AdminButton onClick={openAdd} className="mt-4">
            <Plus className="h-4 w-4" /> Add Destination
          </AdminButton>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {destinations.map((dest, i) => (
            <motion.div
              key={dest._id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
              }}
              whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
              className="group"
            >
              <AdminCard className="overflow-hidden h-full flex flex-col justify-between">
                <div>
                  {/* Banner / Cover */}
                  <div className={`relative h-36 bg-gradient-to-br ${GRADIENT_PAIRS[i % GRADIENT_PAIRS.length]}`}>
                    {dest.banner && (
                      <img
                        src={dest.banner}
                        alt={dest.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Thumbnail floating preview */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl border-2 border-white/40 overflow-hidden bg-white/20 shadow-md backdrop-blur-sm shrink-0">
                        {dest.image || dest.banner ? (
                          <img
                            src={dest.image || dest.banner}
                            alt={dest.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-[#0d1b2e]/60">
                            <MapPin className="h-5 w-5 text-white/80" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 drop-shadow-sm">
                          /{dest.slug}
                        </span>
                        {dest.link && (
                          <p className="text-[10.5px] text-white/70 flex items-center gap-1 font-mono">
                            <ExternalLink className="h-2.5 w-2.5" />
                            {dest.link}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons — visible on hover */}
                    <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(dest)}
                        className="rounded-lg bg-white/90 p-1.5 text-[hsl(var(--adm-foreground))] shadow-sm hover:bg-white transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(dest._id)}
                        className="rounded-lg bg-white/90 p-1.5 text-[hsl(var(--adm-destructive))] shadow-sm hover:bg-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <h3 className="text-xl font-bold text-[hsl(var(--adm-card-foreground))] font-serif">
                          {dest.name}
                        </h3>
                        <p className="text-xs font-medium text-[hsl(var(--adm-primary))] mt-0.5">
                          {dest.hotelCount || "1 hotel"}
                        </p>
                      </div>
                      <AdminBadge variant={dest.active ? "success" : "destructive"}>
                        {dest.active ? "Active" : "Inactive"}
                      </AdminBadge>
                    </div>

                    {dest.description && (
                      <p className="text-sm text-[hsl(var(--adm-muted-foreground))] line-clamp-2 mt-2">
                        {dest.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[hsl(var(--adm-border)/0.4)]">
                  <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">
                    Display Order: {dest.order}
                  </span>
                  <AdminButton variant="outline" size="sm" onClick={() => openEdit(dest)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </AdminButton>
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
        title={editingDestination ? `Edit Destination: ${editingDestination.name}` : "Add Destination"}
        size="lg"
      >
        <div className="mb-6 flex gap-1 rounded-xl border border-[hsl(var(--adm-border))] p-1">
          {(["basic", "media", "contact", "seo"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-colors ${
                activeTab === t
                  ? "bg-[hsl(var(--adm-primary))] text-white"
                  : "text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))]"
              }`}
            >
              {t === "basic"
                ? "Basic Info"
                : t === "media"
                ? "Thumbnail & Media"
                : t === "contact"
                ? "Contact & Address"
                : "SEO"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Destination Name *"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug && f.slug !== slugify(f.name) ? f.slug : slugify(e.target.value),
                    }))
                  }
                  placeholder="e.g. Chennai, Kanniyakumari, Coimbatore"
                  required
                />
                <AdminInput
                  label="Slug *"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="e.g. chennai"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Hotel Count / Subtitle"
                  value={form.hotelCount ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, hotelCount: e.target.value }))}
                  placeholder="e.g. 2 hotels, 1 hotels"
                  hint="Shown in the navbar hover dropdown beneath the destination name"
                />
                <AdminInput
                  label="Custom Page Link"
                  value={form.link ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="e.g. /chennai, /coimbatore, /rooms"
                  hint="Link navigated to when clicked in the hover dropdown"
                />
              </div>

              <AdminTextarea
                label="Description"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this destination"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Display Order"
                  type="number"
                  value={String(form.order)}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                />
                <div className="flex items-center gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.active ? "bg-[hsl(var(--adm-primary))]" : "bg-[hsl(var(--adm-muted))]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        form.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[hsl(var(--adm-foreground))]">
                    {form.active ? "Active (Visible in dropdown)" : "Inactive"}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === "media" && (
            <div className="space-y-5">
              <AdminDropzone
                label="Hover Dropdown Thumbnail Image"
                hint="Square/compact image shown in the navbar hover dropdown (Recommended: 200x200px or 400x400px)"
                value={form.image ?? ""}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                folder="destinations"
                aspectRatio="aspect-[4/3]"
              />

              <AdminDropzone
                label="Banner / Cover Image"
                hint="Wide cover image for destination landing page (Recommended: 1920x600px)"
                value={form.banner ?? ""}
                onChange={(url) => setForm((f) => ({ ...f, banner: url }))}
                folder="destinations"
                aspectRatio="aspect-[4/1]"
              />

              {/* Live Card Preview */}
              <div className="rounded-2xl border border-[hsl(var(--adm-border))] p-4 bg-[hsl(var(--adm-accent)/0.15)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--adm-muted-foreground))] mb-3">
                  Navbar Dropdown Item Preview
                </p>
                <div className="inline-flex items-center gap-3.5 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
                  <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    {form.image || form.banner ? (
                      <img
                        src={form.image || form.banner}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-serif text-[17px] font-medium text-[#0d1b2e] leading-tight">
                      {form.name || "Destination Name"}
                    </p>
                    <p className="text-[13px] text-gray-500 font-sans mt-0.5">
                      {form.hotelCount || "1 hotels"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & LOCATION */}
          {activeTab === "contact" && (
            <>
              <AdminInput
                label="Display Label"
                value={form.label ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. CHENNAI — shown as tab name on Contact page"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Phone Number"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                />
                <AdminInput
                  label="Email Address"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="location@kattilhotels.com"
                />
              </div>
              <AdminTextarea
                label="Full Address"
                value={form.address ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="274, 1st Main Road, Secretariat Colony, Thoraipakkam, Chennai, Tamil Nadu 600097"
              />
              <AdminInput
                label="Google Maps Embed URL"
                value={form.mapSrc ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, mapSrc: e.target.value }))}
                placeholder="https://maps.google.com/maps?q=...&output=embed"
              />
            </>
          )}

          {/* TAB 4: SEO */}
          {activeTab === "seo" && (
            <>
              <AdminInput
                label="SEO Title"
                value={form.seo?.title ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seo: { ...f.seo!, title: e.target.value } }))
                }
                placeholder="Page title for search engines"
              />
              <AdminTextarea
                label="Meta Description"
                value={form.seo?.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seo: { ...f.seo!, description: e.target.value } }))
                }
                placeholder="Max 160 characters"
              />
              <AdminInput
                label="Keywords"
                value={form.seo?.keywords ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seo: { ...f.seo!, keywords: e.target.value } }))
                }
                placeholder="hotel, chennai, luxury rooms"
              />
              <AdminInput
                label="OG Image URL"
                value={form.seo?.ogImage ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seo: { ...f.seo!, ogImage: e.target.value } }))
                }
                placeholder="https://..."
              />
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[hsl(var(--adm-border)/0.4)] pt-4">
          <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </AdminButton>
          <AdminButton onClick={handleSave} loading={saving}>
            {editingDestination ? "Save Changes" : "Create Destination"}
          </AdminButton>
        </div>
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Destination"
        message="Are you sure you want to delete this destination? It will be removed from the website and navbar, and any linked rooms will be unassigned."
        variant="destructive"
        confirmLabel="Delete Destination"
      />
    </div>
  );
}

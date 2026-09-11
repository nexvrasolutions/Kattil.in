"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Search, Pencil, Trash2, BedDouble, Star, StarOff,
  X, Check, LayoutGrid, List,
} from "lucide-react";
import AdminPagination from "@/components/admin/ui/AdminPagination";
import {
  AdminCard,
} from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/admin/ui/SkeletonLoader";

const EASE = [0.22, 1, 0.36, 1] as const;


interface City { _id: string; name: string; slug: string }
interface Room {
  _id: string;
  name: string;
  slug: string;
  city: City | null;
  category: string;
  images: string[];
  description: string;
  features: string[];
  amenities: string[];
  status: "active" | "inactive" | "maintenance";
  featured: boolean;
  badge?: string;
  cta?: { text: string; url: string };
}

const statusLabel: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
};

const categoryLabel: Record<string, string> = {
  deluxe: "Deluxe", suite: "Suite", standard: "Standard", premium: "Premium",
};

function StatusChanger({ room, onChanged }: { room: Room; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const change = async (status: Room["status"]) => {
    setSaving(true);
    setOpen(false);
    await fetch(`/api/admin/rooms/${room._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    onChanged();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80"
        style={{
          background: room.status === "active" ? "hsl(142 76% 36% / 0.12)" : room.status === "maintenance" ? "hsl(38 92% 50% / 0.12)" : "hsl(var(--adm-muted))",
          color: room.status === "active" ? "hsl(142 76% 30%)" : room.status === "maintenance" ? "hsl(38 80% 35%)" : "hsl(var(--adm-muted-foreground))",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
        {statusLabel[room.status]}
        <span className="opacity-50">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-40 rounded-xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] py-1 shadow-xl">
            {(["active", "inactive", "maintenance"] as const).map((s) => (
              <button
                key={s}
                onClick={() => change(s)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-[hsl(var(--adm-accent)/0.5)] ${room.status === s ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-foreground))]"}`}
              >
                {room.status === s && <Check className="h-3 w-3" />}
                {room.status !== s && <span className="h-3 w-3" />}
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterCity) params.set("city", filterCity);
    if (filterStatus) params.set("status", filterStatus);
    try {
      const res = await fetch(`/api/admin/rooms?${params}`).then((r) => r.json());
      if (res.success) {
        setRooms(res.data.rooms);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } finally { setLoading(false); }
  }, [page, limit, search, filterCity, filterStatus]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);
  useEffect(() => {
    fetch("/api/admin/cities?limit=100").then((r) => r.json()).then((r) => r.success && setCities(r.data.cities));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/rooms/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchRooms();
  };

  const activeCount = rooms.filter((r) => r.status === "active").length;
  const featuredCount = rooms.filter((r) => r.featured).length;

  return (
    <div>
      <PageHeader title="Properties & Rooms" subtitle="Manage properties and rooms across Chennai, Madurai, Coimbatore and other destinations">
        <Link href="/admin/rooms/new">
          <AdminButton variant="default">
            <Plus className="h-4 w-4" /> Add Property / Room
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
          { label: "Total", value: total, icon: BedDouble, color: "hsl(var(--adm-primary))" },
          { label: "Active", value: activeCount, icon: Check, color: "hsl(var(--adm-success))" },
          { label: "Featured", value: featuredCount, icon: Star, color: "hsl(var(--adm-warning))" },
          { label: "Inactive", value: total - activeCount, icon: StarOff, color: "hsl(var(--adm-destructive))" },
        ].map(({ label, value, icon: Icon, color }) => (
          <AdminCard key={label} className="rounded-2xl!">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--adm-card-foreground))]">{value}</p>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: `${color}20` }}>
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
              placeholder="Search rooms…"
              className="flex h-10 w-full rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-9 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
            />
          </div>
          <select
            value={filterCity}
            onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Cities</option>
            {cities.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {(search || filterCity || filterStatus) && (
            <AdminButton variant="ghost" onClick={() => { setSearch(""); setFilterCity(""); setFilterStatus(""); setPage(1); }}>
              <X className="h-4 w-4" /> Clear
            </AdminButton>
          )}
          {/* View toggle */}
          <div className="flex items-center gap-1 ml-auto rounded-lg border border-[hsl(var(--adm-border))] p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${viewMode === "list" ? "bg-[hsl(var(--adm-primary))] text-white" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${viewMode === "grid" ? "bg-[hsl(var(--adm-primary))] text-white" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl adm-skeleton" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <AdminCard>
              <div className="py-16 text-center">
                <BedDouble className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-3" />
                <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No rooms found</p>
                <Link href="/admin/rooms/new" className="mt-2 inline-block text-xs text-[hsl(var(--adm-primary))] hover:underline">
                  Add your first room
                </Link>
              </div>
            </AdminCard>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
            >
              {rooms.map((room, idx) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group flex items-center gap-3 rounded-2xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] p-3 hover:border-[hsl(var(--adm-primary)/0.3)] hover:shadow-sm transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--adm-muted))]">
                    {room.images[0] ? (
                      <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BedDouble className="h-6 w-6 text-[hsl(var(--adm-muted-foreground)/0.35)]" />
                      </div>
                    )}
                    {room.featured && (
                      <Star className="absolute top-1 right-1 h-3 w-3 fill-[hsl(var(--adm-warning))] text-[hsl(var(--adm-warning))] drop-shadow" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[hsl(var(--adm-foreground))] truncate leading-tight">{room.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-[hsl(var(--adm-muted-foreground))]">{room.city?.name ?? "—"}</span>
                          {room.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[hsl(var(--adm-accent))] text-[hsl(var(--adm-primary))] font-medium">
                              {room.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <AdminBadge variant="secondary" className="shrink-0 text-[10px]">
                        {categoryLabel[room.category] ?? room.category}
                      </AdminBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusChanger room={room} onChanged={fetchRooms} />
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/rooms/${room._id}`}>
                          <button className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(room._id)}
                          className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors"
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
                    {["Room", "City", "Category", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center">
                      <BedDouble className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-3" />
                      <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No rooms found</p>
                      <Link href="/admin/rooms/new" className="mt-2 inline-block text-xs text-[hsl(var(--adm-primary))] hover:underline">
                        Add your first room
                      </Link>
                    </td></tr>
                  ) : rooms.map((room) => (
                    <tr
                      key={room._id}
                      className="border-b border-[hsl(var(--adm-border)/0.3)] transition-colors hover:bg-[hsl(var(--adm-accent)/0.25)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {room.images[0] ? (
                            <img src={room.images[0]} alt={room.name} className="h-9 w-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-9 w-12 rounded-lg bg-[hsl(var(--adm-muted))] flex items-center justify-center shrink-0">
                              <BedDouble className="h-4 w-4 text-[hsl(var(--adm-muted-foreground)/0.5)]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[hsl(var(--adm-foreground))]">{room.name}</p>
                            <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">/{room.slug}</p>
                          </div>
                          {room.featured && <Star className="h-3.5 w-3.5 fill-[hsl(var(--adm-warning))] text-[hsl(var(--adm-warning))]" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--adm-muted-foreground))]">
                        <div className="flex flex-col">
                          <span className="font-medium text-[hsl(var(--adm-foreground))]">{room.city?.name ?? "—"}</span>
                          {room.badge && (
                            <span className="text-[11px] text-[hsl(var(--adm-primary))]">{room.badge}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge variant="secondary">{categoryLabel[room.category] ?? room.category}</AdminBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChanger room={room} onChanged={fetchRooms} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/rooms/${room._id}`}>
                            <button className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteId(room._id)}
                            className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors"
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
            <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={setLimit} itemLabel="rooms" />
          </div>
        </AdminCard>
      )}

      {viewMode === "grid" && (
        <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={setLimit} itemLabel="rooms" />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete Room"
      />
    </div>
  );
}

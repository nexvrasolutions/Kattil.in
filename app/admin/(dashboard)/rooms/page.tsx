"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus, Search, Pencil, Trash2, BedDouble, Star, StarOff,
  X, Check, LayoutGrid, List, Building2,
} from "lucide-react";
import AdminPagination from "@/components/admin/ui/AdminPagination";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/admin/ui/SkeletonLoader";

const EASE = [0.22, 1, 0.36, 1] as const;

interface City {
  _id: string;
  name: string;
  slug: string;
}

interface PropertySummary {
  _id: string;
  name: string;
  slug: string;
  badge?: string;
  status?: "active" | "inactive" | "maintenance";
}

interface Room {
  _id: string;
  name: string;
  slug: string;
  property: PropertySummary | null;
  city: City | null;
  category: string;
  images: string[];
  description: string;
  features: string[];
  amenities: string[];
  status: "active" | "inactive" | "maintenance";
  featured: boolean;
  badge?: string;
  pricing?: { label: string; value: string }[];
  cta?: { text: string; url: string };
}

const statusLabel: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
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
          background:
            room.status === "active"
              ? "hsl(142 76% 36% / 0.12)"
              : room.status === "maintenance"
              ? "hsl(38 92% 50% / 0.12)"
              : "hsl(var(--adm-muted))",
          color:
            room.status === "active"
              ? "hsl(142 76% 30%)"
              : room.status === "maintenance"
              ? "hsl(38 80% 35%)"
              : "hsl(var(--adm-muted-foreground))",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
        {statusLabel[room.status] || "Active"}
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
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-[hsl(var(--adm-accent)/0.5)] ${
                  room.status === s ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-foreground))]"
                }`}
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

function RoomsContent() {
  const searchParams = useSearchParams();
  const initialProperty = searchParams.get("property") || "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [search, setSearch] = useState("");
  const [filterProperty, setFilterProperty] = useState(initialProperty);
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterProperty) params.set("property", filterProperty);
    if (filterCity) params.set("city", filterCity);
    if (filterStatus) params.set("status", filterStatus);
    try {
      const res = await fetch(`/api/admin/rooms?${params}`).then((r) => r.json());
      if (res.success) {
        setRooms(res.data.rooms);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterProperty, filterCity, filterStatus]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    fetch("/api/admin/properties?limit=100")
      .then((r) => r.json())
      .then((r) => r.success && setProperties(r.data.properties));
    fetch("/api/admin/cities?limit=100")
      .then((r) => r.json())
      .then((r) => r.success && setCities(r.data.cities));
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
      <PageHeader
        title="Rooms"
        subtitle="Manage room types, pricing, and amenities assigned to each property"
      >
        <Link href={filterProperty ? `/admin/rooms/new?property=${filterProperty}` : "/admin/rooms/new"}>
          <AdminButton variant="default">
            <Plus className="h-4 w-4" /> Add Room
          </AdminButton>
        </Link>
      </PageHeader>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { label: "Total Rooms", value: total, icon: BedDouble, color: "hsl(var(--adm-primary))" },
          { label: "Active", value: activeCount, icon: Check, color: "hsl(var(--adm-success))" },
          { label: "Featured", value: featuredCount, icon: Star, color: "hsl(var(--adm-warning))" },
          { label: "Inactive", value: total - activeCount, icon: StarOff, color: "hsl(var(--adm-destructive))" },
        ].map(({ label, value, icon: Icon, color }) => (
          <AdminCard key={label} className="rounded-2xl!">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">
                  {label}
                </p>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search rooms…"
              className="flex h-10 w-full rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-9 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
            />
          </div>
          <select
            value={filterProperty}
            onChange={(e) => {
              setFilterProperty(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={filterCity}
            onChange={(e) => {
              setFilterCity(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Destinations</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {(search || filterProperty || filterCity || filterStatus) && (
            <AdminButton
              variant="ghost"
              onClick={() => {
                setSearch("");
                setFilterProperty("");
                setFilterCity("");
                setFilterStatus("");
                setPage(1);
              }}
            >
              <X className="h-4 w-4" /> Clear
            </AdminButton>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 ml-auto rounded-lg border border-[hsl(var(--adm-border))] p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-[hsl(var(--adm-primary))] text-white"
                  : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-[hsl(var(--adm-primary))] text-white"
                  : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"
              }`}
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
            <AdminCard className="p-12 text-center">
              <BedDouble className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground))]" />
              <h3 className="mt-4 text-base font-semibold text-[hsl(var(--adm-card-foreground))]">No rooms found</h3>
              <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">
                {search || filterProperty || filterCity || filterStatus
                  ? "Try clearing filters."
                  : "Get started by adding your first room to a property."}
              </p>
              <div className="mt-4">
                <Link href="/admin/rooms/new">
                  <AdminButton variant="default">
                    <Plus className="h-4 w-4" /> Add Room
                  </AdminButton>
                </Link>
              </div>
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {rooms.map((room) => (
                <AdminCard key={room._id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {room.property && (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            room.property.status === "inactive"
                              ? "text-[hsl(var(--adm-muted-foreground))] bg-[hsl(var(--adm-muted))]"
                              : "text-[hsl(var(--adm-primary))] bg-[hsl(var(--adm-primary)/0.1)]"
                          }`}>
                            <Building2 className="w-3 h-3" /> {room.property.name}
                            {room.property.status === "inactive" && " (Inactive)"}
                          </span>
                        )}
                        {room.city && (
                          <AdminBadge variant="outline">{room.city.name}</AdminBadge>
                        )}
                      </div>
                      <StatusChanger room={room} onChanged={fetchRooms} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--adm-muted))]">
                        {room.images[0] ? (
                          <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BedDouble className="h-6 w-6 text-[hsl(var(--adm-muted-foreground))]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[hsl(var(--adm-card-foreground))] truncate">{room.name}</h3>
                        <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">{room.badge || "Private room"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[hsl(var(--adm-border)/0.5)] flex items-center justify-between">
                    <span className="text-xs font-bold text-[hsl(var(--adm-foreground))]">
                      {room.pricing?.[0]?.value || "Standard"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/rooms/${room._id}`}
                        className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-foreground))]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(room._id)}
                        className="rounded-lg p-1.5 text-[hsl(var(--adm-destructive))] hover:bg-[hsl(var(--adm-destructive)/0.1)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </AdminCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <AdminCard>
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center">
              <BedDouble className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground))]" />
              <h3 className="mt-4 text-base font-semibold text-[hsl(var(--adm-card-foreground))]">No rooms found</h3>
              <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">
                {search || filterProperty || filterCity || filterStatus
                  ? "Try clearing filters."
                  : "Get started by adding your first room to a property."}
              </p>
              <div className="mt-4">
                <Link href="/admin/rooms/new">
                  <AdminButton variant="default">
                    <Plus className="h-4 w-4" /> Add Room
                  </AdminButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--adm-border))] text-xs font-semibold uppercase text-[hsl(var(--adm-muted-foreground))]">
                    <th className="px-4 py-3.5">Room</th>
                    <th className="px-4 py-3.5">Property</th>
                    <th className="px-4 py-3.5">Destination</th>
                    <th className="px-4 py-3.5">Badge / Type</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--adm-border)/0.5)]">
                  {rooms.map((room) => (
                    <tr key={room._id} className="hover:bg-[hsl(var(--adm-accent)/0.3)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--adm-muted))]">
                            {room.images[0] ? (
                              <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BedDouble className="h-5 w-5 text-[hsl(var(--adm-muted-foreground))]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[hsl(var(--adm-card-foreground))]">{room.name}</p>
                            <p className="text-xs text-[hsl(var(--adm-muted-foreground))] line-clamp-1">{room.pricing?.[0]?.value || "Standard"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {room.property ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            room.property.status === "inactive"
                              ? "text-[hsl(var(--adm-muted-foreground))]"
                              : "text-[hsl(var(--adm-foreground))]"
                          }`}>
                            <Building2 className={`w-3.5 h-3.5 ${
                              room.property.status === "inactive"
                                ? "text-[hsl(var(--adm-muted-foreground))]"
                                : "text-[hsl(var(--adm-primary))]"
                            }`} />
                            {room.property.name}
                            {room.property.status === "inactive" && (
                              <span className="text-[10px] font-semibold text-[hsl(var(--adm-muted-foreground))] bg-[hsl(var(--adm-muted))] px-1.5 py-0.5 rounded ml-1">
                                Property Inactive
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {room.city ? (
                          <AdminBadge variant="outline">{room.city.name}</AdminBadge>
                        ) : (
                          <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[hsl(var(--adm-foreground))]">{room.badge || "Private room"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChanger room={room} onChanged={fetchRooms} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/rooms/${room._id}`}
                            className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-foreground))]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(room._id)}
                            className="rounded-lg p-1.5 text-[hsl(var(--adm-destructive))] hover:bg-[hsl(var(--adm-destructive)/0.1)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPage={setPage}
            onLimit={(l) => {
              setLimit(l);
              setPage(1);
            }}
            itemLabel="rooms"
          />
        </div>
      )}

      {/* Delete dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Room"
        description="Are you sure you want to delete this room? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[hsl(var(--adm-muted-foreground))]">Loading rooms…</div>}>
      <RoomsContent />
    </Suspense>
  );
}

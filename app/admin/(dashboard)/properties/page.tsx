"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Search, Pencil, Trash2, Building2, Star, StarOff,
  X, Check, LayoutGrid, List, BedDouble, MapPin, ExternalLink,
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

interface PropertyItem {
  _id: string;
  name: string;
  slug: string;
  city: City | null;
  badge?: string;
  category?: string;
  images: string[];
  address?: string;
  phone?: string;
  email?: string;
  status: "active" | "inactive" | "maintenance";
  featured: boolean;
  roomCount?: number;
}

const statusLabel: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
};

function StatusChanger({ property, onChanged }: { property: PropertyItem; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const change = async (status: PropertyItem["status"]) => {
    setSaving(true);
    setOpen(false);
    await fetch(`/api/admin/properties/${property._id}`, {
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
            property.status === "active"
              ? "hsl(142 76% 36% / 0.12)"
              : property.status === "maintenance"
              ? "hsl(38 92% 50% / 0.12)"
              : "hsl(var(--adm-muted))",
          color:
            property.status === "active"
              ? "hsl(142 76% 30%)"
              : property.status === "maintenance"
              ? "hsl(38 80% 35%)"
              : "hsl(var(--adm-muted-foreground))",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
        {statusLabel[property.status] || "Active"}
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
                  property.status === s ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-foreground))]"
                }`}
              >
                {property.status === s && <Check className="h-3 w-3" />}
                {property.status !== s && <span className="h-3 w-3" />}
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
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

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterCity) params.set("city", filterCity);
    if (filterStatus) params.set("status", filterStatus);
    try {
      const res = await fetch(`/api/admin/properties?${params}`).then((r) => r.json());
      if (res.success) {
        setProperties(res.data.properties);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterCity, filterStatus]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetch("/api/admin/cities?limit=100")
      .then((r) => r.json())
      .then((r) => r.success && setCities(r.data.cities));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/properties/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProperties();
  };

  const activeCount = properties.filter((p) => p.status === "active").length;
  const featuredCount = properties.filter((p) => p.featured).length;

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Manage all accommodation properties across Chennai, Madurai, Coimbatore and other destinations"
      >
        <Link href="/admin/properties/new">
          <AdminButton variant="default">
            <Plus className="h-4 w-4" /> Add Property
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
          { label: "Total Properties", value: total, icon: Building2, color: "hsl(var(--adm-primary))" },
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
              placeholder="Search properties by name…"
              className="flex h-10 w-full rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-9 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
            />
          </div>
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
          {(search || filterCity || filterStatus) && (
            <AdminButton
              variant="ghost"
              onClick={() => {
                setSearch("");
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-2xl adm-skeleton" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <AdminCard className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground))]" />
              <h3 className="mt-4 text-base font-semibold text-[hsl(var(--adm-card-foreground))]">No properties found</h3>
              <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">
                {search || filterCity || filterStatus
                  ? "Try clearing filters."
                  : "Get started by adding your first property."}
              </p>
              <div className="mt-4">
                <Link href="/admin/properties/new">
                  <AdminButton variant="default">
                    <Plus className="h-4 w-4" /> Add Property
                  </AdminButton>
                </Link>
              </div>
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map((property) => (
                <AdminCard key={property._id} className="overflow-hidden flex flex-col justify-between">
                  <div className="relative h-44 bg-[hsl(var(--adm-muted))] overflow-hidden">
                    {property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[hsl(var(--adm-muted-foreground))]">
                        <Building2 className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <StatusChanger property={property} onChanged={fetchProperties} />
                    </div>
                    {property.city && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
                          {property.city.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--adm-primary))]">
                          {property.badge || "Property"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[hsl(var(--adm-card-foreground))]">{property.name}</h3>
                      {property.address && (
                        <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))] line-clamp-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" /> {property.address}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[hsl(var(--adm-border)/0.5)] flex items-center justify-between">
                      <Link
                        href={`/admin/rooms?property=${property._id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--adm-primary))] hover:underline"
                      >
                        <BedDouble className="h-3.5 w-3.5" />
                        {property.roomCount ?? 0} {property.roomCount === 1 ? "Room" : "Rooms"}
                      </Link>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-foreground))]"
                          title="View on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/properties/${property._id}`}
                          className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-foreground))]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(property._id)}
                          className="rounded-lg p-1.5 text-[hsl(var(--adm-destructive))] hover:bg-[hsl(var(--adm-destructive)/0.1)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
          ) : properties.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground))]" />
              <h3 className="mt-4 text-base font-semibold text-[hsl(var(--adm-card-foreground))]">No properties found</h3>
              <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">
                {search || filterCity || filterStatus
                  ? "Try clearing filters."
                  : "Get started by adding your first property."}
              </p>
              <div className="mt-4">
                <Link href="/admin/properties/new">
                  <AdminButton variant="default">
                    <Plus className="h-4 w-4" /> Add Property
                  </AdminButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--adm-border))] text-xs font-semibold uppercase text-[hsl(var(--adm-muted-foreground))]">
                    <th className="px-4 py-3.5">Property</th>
                    <th className="px-4 py-3.5">Destination</th>
                    <th className="px-4 py-3.5">Type / Badge</th>
                    <th className="px-4 py-3.5">Rooms</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--adm-border)/0.5)]">
                  {properties.map((property) => (
                    <tr key={property._id} className="hover:bg-[hsl(var(--adm-accent)/0.3)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--adm-muted))]">
                            {property.images[0] ? (
                              <img src={property.images[0]} alt={property.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Building2 className="h-5 w-5 text-[hsl(var(--adm-muted-foreground))]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[hsl(var(--adm-card-foreground))]">{property.name}</p>
                            <p className="text-xs text-[hsl(var(--adm-muted-foreground))] line-clamp-1">{property.address || `/properties/${property.slug}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {property.city ? (
                          <AdminBadge variant="outline">{property.city.name}</AdminBadge>
                        ) : (
                          <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-[hsl(var(--adm-foreground))]">{property.badge || "Private room"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/rooms?property=${property._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--adm-primary))] hover:underline"
                        >
                          <BedDouble className="h-3.5 w-3.5" />
                          {property.roomCount ?? 0} {property.roomCount === 1 ? "room" : "rooms"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChanger property={property} onChanged={fetchProperties} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-foreground))]"
                            title="View on site"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/properties/${property._id}`}
                            className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-foreground))]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(property._id)}
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
            itemLabel="properties"
          />
        </div>
      )}

      {/* Delete dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Property"
        description="Are you sure you want to delete this property? Rooms assigned to this property will be unlinked."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

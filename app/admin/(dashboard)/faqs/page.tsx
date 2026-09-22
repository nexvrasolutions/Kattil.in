"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Search, Pencil, Trash2, HelpCircle,
  X,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/admin/ui/SkeletonLoader";
import AdminPagination from "@/components/admin/ui/AdminPagination";
import { toast } from "sonner";

const EASE = [0.22, 1, 0.36, 1] as const;
const CATEGORIES = ["Reservations", "Amenities", "Dining", "Policies"] as const;

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  status: "active" | "inactive";
  displayOrder: number;
}

function StatusToggle({ faq, onChanged }: { faq: Faq; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);
  const toggle = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faqs/${faq._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: faq.status === "active" ? "inactive" : "active" }),
      }).then((r) => r.json());
      if (res.success) {
        onChanged();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80 disabled:opacity-50"
      style={{
        background: faq.status === "active" ? "hsl(142 76% 36% / 0.12)" : "hsl(var(--adm-muted))",
        color: faq.status === "active" ? "hsl(142 76% 30%)" : "hsl(var(--adm-muted-foreground))",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
      {faq.status === "active" ? "Active" : "Inactive"}
    </button>
  );
}

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<"displayOrder" | "category">("displayOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);
    try {
      const res = await fetch(`/api/admin/faqs?${params}`).then((r) => r.json());
      if (res.success) {
        const data: Faq[] = res.data.faqs;
        const sorted = [...data].sort((a, b) => {
          const aVal = sortField === "displayOrder" ? a.displayOrder : a.category;
          const bVal = sortField === "displayOrder" ? b.displayOrder : b.category;
          if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
          if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
        setFaqs(sorted);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterCategory, filterStatus, sortField, sortDir]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/faqs/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchFaqs();
  };

  const toggleSort = (field: "displayOrder" | "category") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: "displayOrder" | "category" }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-[hsl(var(--adm-primary))]" />
      : <ChevronDown className="h-3 w-3 text-[hsl(var(--adm-primary))]" />;
  };

  const activeCount = faqs.filter((f) => f.status === "active").length;

  return (
    <div>
      <PageHeader title="FAQs" subtitle="Manage frequently asked questions">
        <Link href="/admin/faqs/new">
          <AdminButton variant="default">
            <Plus className="h-4 w-4" /> Add FAQ
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
          { label: "Total", value: total, color: "hsl(var(--adm-primary))" },
          { label: "Active", value: activeCount, color: "hsl(var(--adm-success))" },
          { label: "Inactive", value: total - activeCount, color: "hsl(var(--adm-muted-foreground))" },
          { label: "Categories", value: CATEGORIES.length, color: "hsl(var(--adm-warning))" },
        ].map(({ label, value, color }) => (
          <AdminCard key={label} className="rounded-2xl!">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--adm-card-foreground))]">{value}</p>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: `${color}20` }}>
                <HelpCircle className="h-5 w-5" style={{ color }} />
              </div>
            </div>
          </AdminCard>
        ))}
      </motion.div>

      {/* Filters */}
      <AdminCard className="mb-6">
        <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--adm-muted-foreground))]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search questions…"
              className="flex h-10 w-full rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-9 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || filterCategory || filterStatus) && (
            <AdminButton variant="ghost" onClick={() => { setSearch(""); setFilterCategory(""); setFilterStatus(""); setPage(1); }}>
              <X className="h-4 w-4" /> Clear
            </AdminButton>
          )}
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard>
        {loading ? <div className="p-6"><SkeletonTable /></div> : (
          <div className="w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--adm-border)/0.5)] bg-[hsl(var(--adm-muted)/0.4)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">
                    Question
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))] cursor-pointer select-none hover:text-[hsl(var(--adm-foreground))] transition-colors"
                    onClick={() => toggleSort("category")}
                  >
                    <div className="flex items-center gap-1">Category <SortIcon field="category" /></div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))] cursor-pointer select-none hover:text-[hsl(var(--adm-foreground))] transition-colors"
                    onClick={() => toggleSort("displayOrder")}
                  >
                    <div className="flex items-center gap-1">Order <SortIcon field="displayOrder" /></div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center">
                    <HelpCircle className="mx-auto h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-3" />
                    <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No FAQs found</p>
                    <Link href="/admin/faqs/new" className="mt-2 inline-block text-xs text-[hsl(var(--adm-primary))] hover:underline">
                      Add your first FAQ
                    </Link>
                  </td></tr>
                ) : faqs.map((faq) => (
                  <tr key={faq._id} className="border-b border-[hsl(var(--adm-border)/0.3)] transition-colors hover:bg-[hsl(var(--adm-accent)/0.25)]">
                    <td className="px-4 py-3 max-w-sm">
                      <p className="font-medium text-[hsl(var(--adm-foreground))] line-clamp-1">{faq.question}</p>
                      <p className="text-xs text-[hsl(var(--adm-muted-foreground))] line-clamp-1 mt-0.5">{faq.answer}</p>
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge variant="secondary">{faq.category}</AdminBadge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--adm-muted)/0.6)] text-xs font-bold text-[hsl(var(--adm-foreground))]">
                        {faq.displayOrder}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusToggle faq={faq} onChanged={fetchFaqs} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/faqs/${faq._id}`}>
                          <button className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-primary))] transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(faq._id)}
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
          <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} itemLabel="FAQs" />
        </div>
      </AdminCard>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete FAQ"
      />
    </div>
  );
}

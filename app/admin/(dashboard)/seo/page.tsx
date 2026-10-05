"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Plus, Trash2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import {
  AdminCard, AdminCardHeader, AdminCardContent,
  AdminCardTitle, AdminCardDescription,
} from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

const EASE = [0.22, 1, 0.36, 1] as const;

const PAGES = ["home", "rooms", "gallery", "about-us", "contact-us", "chennai", "madurai", "faqs", "blog"];

interface SeoEntry {
  _id?: string; page: string; title?: string; description?: string;
  keywords?: string; ogImage?: string; jsonLd?: string;
  robots?: string; canonical?: string;
}

const EMPTY_FORM: SeoEntry = {
  page: "", title: "", description: "", keywords: "",
  ogImage: "", jsonLd: "", robots: "index, follow", canonical: "",
};

function SeoScore({ title, description }: { title?: string; description?: string }) {
  const titleOk = (title?.length ?? 0) >= 30 && (title?.length ?? 0) <= 60;
  const descOk = (description?.length ?? 0) >= 120 && (description?.length ?? 0) <= 160;
  const score = [titleOk, descOk].filter(Boolean).length;
  return (
    <div className="flex items-center gap-1.5">
      {score === 2 ? <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--adm-success))]" /> : <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--adm-warning))]" />}
      <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">{score}/2</span>
    </div>
  );
}

export default function SeoPage() {
  const [entries, setEntries] = useState<SeoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [form, setForm] = useState<SeoEntry>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo").then((r) => r.json());
      if (res.success) setEntries(res.data.entries);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingPage(null); setActiveTab("basic"); setIsModalOpen(true); };
  const openEdit = async (entry: SeoEntry) => {
    setForm({ ...entry });
    setEditingPage(entry.page);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (editingPage) {
        res = await fetch(`/api/admin/seo/${editingPage}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        }).then((r) => r.json());
      } else {
        res = await fetch("/api/admin/seo", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        }).then((r) => r.json());
      }
      if (res.success) { setIsModalOpen(false); fetchEntries(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/seo/${deleteId}`, { method: "DELETE" });
    setDeleteId(null); fetchEntries();
  };

  const missingPages = PAGES.filter((p) => !entries.find((e) => e.page === p));

  return (
    <div>
      <PageHeader title="SEO Manager" subtitle="Manage meta tags and SEO for each page">
        <AdminButton onClick={openAdd}><Plus className="h-4 w-4" /> Add Page SEO</AdminButton>
      </PageHeader>

      {/* Missing pages alert */}
      {missingPages.length > 0 && (
        <div className="mb-6 rounded-[8px] border border-[hsl(var(--adm-warning)/0.3)] bg-[hsl(var(--adm-warning)/0.08)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-[hsl(var(--adm-warning)/0.8)]" />
            <p className="text-sm font-semibold text-[hsl(var(--adm-warning)/0.8)]">{missingPages.length} pages missing SEO configuration</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingPages.map((p) => (
              <button key={p} onClick={() => { setForm({ ...EMPTY_FORM, page: p }); setEditingPage(null); setIsModalOpen(true); }}
                className="rounded-[8px] border border-[hsl(38_62%_40%/0.4)] px-3 py-1 text-xs font-medium text-[hsl(var(--adm-warning)/0.8)] hover:bg-[hsl(var(--adm-warning)/0.1)] transition-colors capitalize">
                {p} →
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-[8px] adm-skeleton" />)}</div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="space-y-3">
          {entries.map((entry) => (
            <motion.div key={entry._id ?? entry.page}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } } }}>
              <div className="cursor-pointer" onClick={() => openEdit(entry)}>
              <AdminCard className="!rounded-[8px] hover:border-[hsl(var(--adm-primary)/0.3)] transition-colors">
                <div className="flex items-center gap-4 p-4">
                  <div className="rounded-[8px] bg-[hsl(var(--adm-accent)/0.3)] p-2.5 shrink-0">
                    <Globe className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-[hsl(var(--adm-foreground))] capitalize">{entry.page}</p>
                      <AdminBadge variant="secondary">/{entry.page}</AdminBadge>
                    </div>
                    <p className="text-sm text-[hsl(var(--adm-muted-foreground))] truncate">{entry.title ?? "No title set"}</p>
                    {entry.description && (
                      <p className="text-xs text-[hsl(var(--adm-muted-foreground)/0.7)] truncate mt-0.5">{entry.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <SeoScore title={entry.title} description={entry.description} />
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(entry.page); }}
                      className="rounded-[8px] p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </AdminCard>
              </div>
            </motion.div>
          ))}
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--adm-border))] py-24">
              <Search className="h-16 w-16 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-4" />
              <p className="text-lg font-semibold">No SEO entries yet</p>
              <AdminButton onClick={openAdd} className="mt-4"><Plus className="h-4 w-4" /> Add First Page</AdminButton>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingPage ? `SEO: ${editingPage}` : "Add Page SEO"} size="lg">
        <div className="mb-6 flex gap-1 rounded-[8px] border border-[hsl(var(--adm-border))] p-1">
          {(["basic", "advanced"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setActiveTab(t)}
              className={`flex-1 rounded-[8px] py-2 text-xs font-semibold transition-colors ${activeTab === t ? "bg-[hsl(var(--adm-brand))] text-[hsl(var(--adm-brand-foreground))]" : "text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))]"}`}>
              {t === "basic" ? "Basic SEO" : "Advanced"}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {activeTab === "basic" && (
            <>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">Page Identifier *</label>
                {editingPage ? (
                  <div className="flex h-10 items-center rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-muted)/0.3)] px-3 text-sm text-[hsl(var(--adm-muted-foreground))]">
                    /{editingPage}
                  </div>
                ) : (
                  <select value={form.page} onChange={(e) => setForm((f) => ({ ...f, page: e.target.value }))}
                    className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]">
                    <option value="">Select a page</option>
                    {missingPages.map((p) => <option key={p} value={p}>{p}</option>)}
                    <option value="">— Custom —</option>
                  </select>
                )}
              </div>
              <div>
                <AdminInput label={`SEO Title (${(form.title?.length ?? 0)}/60)`}
                  value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Page Title · Kattil Hotels" />
                {(form.title?.length ?? 0) > 60 && <p className="mt-1 text-xs text-[hsl(var(--adm-destructive))]">Title too long</p>}
              </div>
              <div>
                <AdminTextarea label={`Meta Description (${(form.description?.length ?? 0)}/160)`}
                  value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description for search results (120-160 chars)" />
                {(form.description?.length ?? 0) > 160 && <p className="mt-1 text-xs text-[hsl(var(--adm-destructive))]">Description too long</p>}
              </div>
              <AdminInput label="Keywords" value={form.keywords ?? ""} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="hotel, luxury, kattil, chennai" />
              <AdminInput label="OG Image URL" value={form.ogImage ?? ""} onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))} placeholder="https://..." />
            </>
          )}
          {activeTab === "advanced" && (
            <>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">Robots</label>
                <select value={form.robots ?? "index, follow"} onChange={(e) => setForm((f) => ({ ...f, robots: e.target.value }))}
                  className="flex h-10 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]">
                  <option value="index, follow">index, follow (default)</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                </select>
              </div>
              <AdminInput label="Canonical URL" value={form.canonical ?? ""} onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value }))} placeholder="https://kattilhotels.com/rooms" />
              <AdminTextarea label="JSON-LD Schema" value={form.jsonLd ?? ""} onChange={(e) => setForm((f) => ({ ...f, jsonLd: e.target.value }))} placeholder='{"@context": "https://schema.org", "@type": "Hotel", ...}' />
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[hsl(var(--adm-border)/0.4)] pt-4">
          <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</AdminButton>
          <AdminButton onClick={handleSave} loading={saving}>{editingPage ? "Update SEO" : "Create SEO Entry"}</AdminButton>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete SEO Entry" message={`Remove SEO configuration for "${deleteId}"?`} variant="destructive" confirmLabel="Delete" />
    </div>
  );
}

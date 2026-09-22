"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, HelpCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FaqCategory { _id: string; name: string }
interface FaqForm {
  question:     string;
  answer:       string;
  category:     string;
  displayOrder: number;
  status:       "active" | "inactive";
}

// New FAQs start as a draft (inactive) — they only go live once explicitly
// published, so nothing typed here is publicly visible by accident.
const EMPTY: FaqForm = { question: "", answer: "", category: "", displayOrder: 0, status: "inactive" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--adm-muted-foreground))] border-b border-[hsl(var(--adm-border)/0.5)] pb-3 mb-5">
      {children}
    </h2>
  );
}

function FormField({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--adm-foreground))]">
        {label}{required && <span className="text-[hsl(var(--adm-destructive))]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">{hint}</p>}
    </div>
  );
}

const inputCls = "flex w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors";

export default function FaqFormPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew  = id === "new";

  const [form,       setForm]       = useState<FaqForm>(EMPTY);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading,    setLoading]    = useState(!isNew);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    fetch("/api/admin/faq-categories")
      .then((r) => r.json())
      .then((r) => { if (r.success) setCategories(r.data.categories); });
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/faqs/${id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          const d = r.data;
          setForm({
            question:     d.question     ?? "",
            answer:       d.answer       ?? "",
            category:     d.category     ?? "",
            displayOrder: d.displayOrder ?? 0,
            status:       d.status       ?? "inactive",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSave = async (statusOverride?: "active" | "inactive") => {
    setError("");
    if (!form.question.trim()) { setError("Question is required."); return; }
    if (!form.answer.trim())   { setError("Answer is required.");   return; }
    if (!form.category)        { setError("Please select a category."); return; }

    setSaving(true);
    try {
      const body = { ...form, status: statusOverride ?? form.status };
      const url    = isNew ? "/api/admin/faqs" : `/api/admin/faqs/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

      if (res.success) {
        router.push("/admin/faqs");
      } else {
        setError(res.error ?? res.message ?? "Failed to save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--adm-muted-foreground))]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2 px-1">
      <button onClick={() => router.push("/admin/faqs")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors mb-5 group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to FAQs
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="rounded-2xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[hsl(var(--adm-border)/0.5)]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-[hsl(var(--adm-primary)/0.1)]">
              <HelpCircle className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--adm-foreground))]">
                {isNew ? "Add FAQ" : "Edit FAQ"}
              </h1>
              <p className="text-sm text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                {isNew ? "Add a new frequently asked question." : "Update this FAQ entry."}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* Content */}
          <section>
            <SectionTitle>FAQ Content</SectionTitle>
            <div className="space-y-5">
              <FormField label="Question" required hint="The question a guest might ask. Be clear and specific.">
                <input type="text" value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. How do I make a reservation at Kattil?"
                  className={`${inputCls} h-10`} />
              </FormField>
              <FormField label="Answer" required hint="Provide a clear, helpful answer. Use plain language — no jargon.">
                <textarea value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  placeholder="Provide a clear, concise answer…"
                  rows={6}
                  className={`${inputCls} py-2.5 resize-y`} />
              </FormField>
            </div>
          </section>

          {/* Settings */}
          <section>
            <SectionTitle>Settings</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField label="Category" required>
                <div className="flex items-center gap-2">
                  <select value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={`${inputCls} h-10 flex-1`}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                  <a href="/admin/faq-categories" target="_blank" rel="noopener noreferrer"
                    className="h-10 flex items-center gap-1 rounded-lg border border-[hsl(var(--adm-border))] px-3 text-xs font-medium text-[hsl(var(--adm-primary))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors whitespace-nowrap">
                    <Plus className="h-3 w-3" /> Manage
                  </a>
                </div>
              </FormField>
              <FormField label="Display Order" hint="Lower numbers appear first (0 = top of category).">
                <input type="number" min={0} value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                  className={`${inputCls} h-10`} />
              </FormField>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-[hsl(var(--adm-destructive)/0.3)] bg-[hsl(var(--adm-destructive)/0.08)] px-4 py-3">
              <p className="text-sm text-[hsl(var(--adm-destructive))]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--adm-border)/0.4)]">
            <button type="button" onClick={() => router.push("/admin/faqs")}
              className="h-10 rounded-lg border border-[hsl(var(--adm-border))] bg-transparent px-5 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave("inactive")} disabled={saving}
              className="h-10 rounded-lg border border-[hsl(var(--adm-border))] bg-transparent px-5 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors disabled:opacity-60">
              Save as Draft
            </button>
            <button type="button" onClick={() => handleSave(isNew ? "active" : undefined)} disabled={saving}
              className="flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "hsl(var(--adm-primary))" }}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> {isNew ? "Publish FAQ" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

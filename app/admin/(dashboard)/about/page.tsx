"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, AlignLeft, Search } from "lucide-react";
import {
  AdminCard, AdminCardHeader, AdminCardContent,
  AdminCardTitle, AdminCardDescription,
} from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";

const EASE = [0.22, 1, 0.36, 1] as const;

interface AboutData {
  eyebrow?: string;
  heading?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  mainImage?: string;
  overlayImage?: string;
  seo?: { title?: string; description?: string; keywords?: string; ogImage?: string };
}

const EMPTY: AboutData = {
  eyebrow: "Our Story",
  heading: "Created for Productivity, Relaxation, and Community",
  paragraph1: "",
  paragraph2: "",
  paragraph3: "",
  mainImage: "",
  overlayImage: "",
  seo: { title: "", description: "", keywords: "", ogImage: "" },
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">{children}</p>;
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="rounded-lg p-1.5 bg-[hsl(var(--adm-primary)/0.1)]">
        <Icon className="h-4 w-4 text-[hsl(var(--adm-primary))]" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--adm-muted-foreground))]">{children}</span>
    </div>
  );
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data && Object.keys(r.data).length > 0) {
          setData({ ...EMPTY, ...r.data });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json());
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl adm-skeleton" />)}
    </div>
  );

  return (
    <div>
      <PageHeader title="About Us" subtitle="Manage the About Us page content and images">
        <AdminButton onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : "Save Changes"}
        </AdminButton>
      </PageHeader>

      <div className="space-y-6">

        {/* ── Content ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <AdminCard>
            <AdminCardHeader>
              <AdminCardDescription>About Us · Page Text</AdminCardDescription>
              <AdminCardTitle className="mt-1">Content</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <AdminInput
                      label="Eyebrow Label"
                      value={data.eyebrow ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, eyebrow: e.target.value }))}
                      placeholder="Our Story"
                    />
                    <FieldHint>Small uppercase text above the main heading. Keep it 2–4 words (e.g., "Our Story").</FieldHint>
                  </div>
                  <div>
                    <AdminInput
                      label="Main Heading"
                      value={data.heading ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, heading: e.target.value }))}
                      placeholder="Created for Productivity, Relaxation, and Community"
                    />
                    <FieldHint>The large H1 visitors read first. Make it compelling — ideally under 10 words.</FieldHint>
                  </div>
                </div>

                <div className="border-t border-[hsl(var(--adm-border)/0.4)] pt-5">
                  <SectionLabel icon={AlignLeft}>Description Paragraphs</SectionLabel>
                  <div className="space-y-5">
                    <div>
                      <AdminTextarea
                        label="First Paragraph"
                        value={data.paragraph1 ?? ""}
                        onChange={(e) => setData((d) => ({ ...d, paragraph1: e.target.value }))}
                        placeholder="Introduce Kattil — what it is and who it's for."
                      />
                      <FieldHint>Opening paragraph — introduce what Kattil is and who it's designed for (tech pros, digital nomads, backpackers).</FieldHint>
                    </div>
                    <div>
                      <AdminTextarea
                        label="Second Paragraph"
                        value={data.paragraph2 ?? ""}
                        onChange={(e) => setData((d) => ({ ...d, paragraph2: e.target.value }))}
                        placeholder="Describe the location advantage and key facilities."
                      />
                      <FieldHint>Highlight location and key facilities — what makes the stay practical and comfortable (AC pods, lockers, Wi-Fi).</FieldHint>
                    </div>
                    <div>
                      <AdminTextarea
                        label="Third Paragraph"
                        value={data.paragraph3 ?? ""}
                        onChange={(e) => setData((d) => ({ ...d, paragraph3: e.target.value }))}
                        placeholder="Describe the atmosphere, amenities, and community experience."
                      />
                      <FieldHint>Paint the experience — common areas, rooftop, kitchens, and the community vibe.</FieldHint>
                    </div>
                  </div>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* ── Images ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08, ease: EASE }}>
          <AdminCard>
            <AdminCardHeader>
              <AdminCardDescription>About Us · Media</AdminCardDescription>
              <AdminCardTitle className="mt-1">Page Images</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Main image */}
                <div>
                  <AdminDropzone
                    label="Main Image"
                    folder="about"
                    value={data.mainImage}
                    onChange={(url) => setData((d) => ({ ...d, mainImage: url }))}
                    aspectRatio="aspect-[3/1]"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-[hsl(var(--adm-accent)/0.6)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--adm-foreground))]">
                      Recommended: 900 × 600 px
                    </span>
                    <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">Landscape · 3:2 ratio</span>
                  </div>
                  <FieldHint>The large hero image on the left side of the About page. Use a high-quality landscape photo of the property.</FieldHint>
                </div>

                {/* Overlay image */}
                <div>
                  <AdminDropzone
                    label="Overlay Image"
                    folder="about"
                    value={data.overlayImage}
                    onChange={(url) => setData((d) => ({ ...d, overlayImage: url }))}
                    aspectRatio="aspect-[1/1]"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-[hsl(var(--adm-accent)/0.6)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--adm-foreground))]">
                      Recommended: 400 × 400 px
                    </span>
                    <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">Square · 1:1 ratio</span>
                  </div>
                  <FieldHint>Small accent image that floats over the bottom-right corner of the main image on the live page.</FieldHint>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* ── SEO ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16, ease: EASE }}>
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-1.5 bg-[hsl(var(--adm-primary)/0.1)]">
                  <Search className="h-4 w-4 text-[hsl(var(--adm-primary))]" />
                </div>
                <div>
                  <AdminCardDescription>About Us · Search Engine Optimisation</AdminCardDescription>
                  <AdminCardTitle className="mt-1">SEO Settings</AdminCardTitle>
                </div>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="rounded-xl bg-[hsl(var(--adm-accent)/0.35)] px-4 py-3 mb-5">
                <p className="text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">
                  Controls how the About Us page appears in Google results and social media previews. Leave blank to inherit site-wide defaults from <strong>Settings → Default SEO</strong>.
                </p>
              </div>
              <div className="space-y-5">
                <div>
                  <AdminInput
                    label={`SEO Title (${(data.seo?.title?.length ?? 0)}/60 chars)`}
                    value={data.seo?.title ?? ""}
                    onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, title: e.target.value } }))}
                    placeholder="About Kattil — Premium Heritage Hostel in Chennai & Madurai"
                  />
                  <FieldHint>Browser tab title and Google headline. Keep it 30–60 characters.</FieldHint>
                  {(data.seo?.title?.length ?? 0) > 60 && (
                    <p className="mt-1 text-xs text-[hsl(var(--adm-destructive))]">Too long — trim to under 60 characters.</p>
                  )}
                </div>
                <div>
                  <AdminTextarea
                    label={`Meta Description (${(data.seo?.description?.length ?? 0)}/160 chars)`}
                    value={data.seo?.description ?? ""}
                    onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, description: e.target.value } }))}
                    placeholder="Learn about Kattil — a premium heritage-inspired hostel in Chennai and Madurai."
                  />
                  <FieldHint>Summary shown under the title in Google results. Aim for 120–160 characters.</FieldHint>
                  {(data.seo?.description?.length ?? 0) > 160 && (
                    <p className="mt-1 text-xs text-[hsl(var(--adm-destructive))]">Too long — trim to under 160 characters.</p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <AdminInput
                      label="Keywords"
                      value={data.seo?.keywords ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, keywords: e.target.value } }))}
                      placeholder="kattil, hostel, co-living, chennai, madurai"
                    />
                    <FieldHint>Comma-separated keywords for this page.</FieldHint>
                  </div>
                  <div>
                    <AdminInput
                      label="OG Image URL"
                      value={data.seo?.ogImage ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, ogImage: e.target.value } }))}
                      placeholder="https://kattilhotels.com/assets/about-og.jpg"
                    />
                    <FieldHint>Preview image when shared on social media. Recommended: 1200 × 630 px.</FieldHint>
                  </div>
                </div>
                {data.seo?.ogImage && (
                  <img
                    src={data.seo.ogImage}
                    alt="OG preview"
                    className="mt-1 h-24 w-full rounded-xl object-cover border border-[hsl(var(--adm-border))]"
                  />
                )}
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

      </div>
    </div>
  );
}

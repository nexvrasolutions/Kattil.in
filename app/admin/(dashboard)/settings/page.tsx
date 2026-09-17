"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save, Hotel, Globe, Shield, ToggleRight,
  Link as LinkIcon,
  Sun, Moon, Monitor,
} from "lucide-react";
import {
  AdminCard, AdminCardHeader, AdminCardContent,
  AdminCardTitle, AdminCardDescription,
} from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import { safeFetchJson } from "@/lib/utils/safeFetch";

const EASE = [0.22, 1, 0.36, 1] as const;

interface SettingsData {
  hotelName?: string;
  logo?: string;
  favicon?: string;
  theme?: "light" | "dark" | "system";
  socialLinks?: { platform: string; url: string }[];
  features?: {
    gallery?: boolean;
    amenities?: boolean;
    rooms?: boolean;
    blog?: boolean;
    booking?: boolean;
    reviews?: boolean;
  };
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
  };
  seo?: {
    defaultTitle?: string;
    titleSuffix?: string;
    defaultDescription?: string;
    defaultOgImage?: string;
  };
  maintenance?: {
    enabled?: boolean;
    message?: string;
  };
}

const EMPTY: SettingsData = {
  hotelName: "Kattil Hotels",
  logo: "",
  favicon: "",
  theme: "system",
  socialLinks: [
    { platform: "Instagram", url: "" },
    { platform: "Facebook", url: "" },
    { platform: "Twitter", url: "" },
    { platform: "Youtube", url: "" },
  ],
  features: {
    gallery: true,
    amenities: true,
    rooms: true,
    blog: false,
    booking: true,
    reviews: false,
  },
  contact: { phone: "", email: "", address: "", whatsapp: "" },
  seo: { defaultTitle: "", titleSuffix: "| Kattil Hotels", defaultDescription: "", defaultOgImage: "" },
  maintenance: { enabled: false, message: "We'll be back shortly. Thank you for your patience." },
};

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Instagram: LinkIcon, Facebook: LinkIcon, Twitter: LinkIcon, Youtube: LinkIcon,
};

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const FEATURE_LABELS: Record<string, string> = {
  gallery: "Photo Gallery",
  amenities: "Amenities Section",
  rooms: "Rooms & Suites",
  blog: "Blog / News",
  booking: "Online Booking",
  reviews: "Guest Reviews",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[hsl(var(--adm-primary))]" : "bg-[hsl(var(--adm-muted))]"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "features" | "social" | "seo" | "advanced">("branding");

  useEffect(() => {
    safeFetchJson<{ success: boolean; data: any }>("/api/admin/settings").then((r) => {
      if (r?.success && r.data && Object.keys(r.data).length > 0) {
        setData((prev) => ({
          ...prev,
          ...r.data,
          features: { ...prev.features, ...r.data.features },
          contact: { ...prev.contact, ...r.data.contact },
          seo: { ...prev.seo, ...r.data.seo },
          maintenance: { ...prev.maintenance, ...r.data.maintenance },
          socialLinks: r.data.socialLinks?.length ? r.data.socialLinks : prev.socialLinks,
        }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await safeFetchJson<{ success: boolean }>("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res?.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  const updateSocial = (i: number, url: string) => {
    setData((d) => {
      const s = [...(d.socialLinks ?? [])];
      s[i] = { ...s[i], url };
      return { ...d, socialLinks: s };
    });
  };

  const tabs = [
    { key: "branding" as const, label: "Branding", icon: Hotel },
    { key: "features" as const, label: "Features", icon: ToggleRight },
    { key: "social" as const, label: "Social", icon: Globe },
    { key: "seo" as const, label: "Default SEO", icon: Globe },
    { key: "advanced" as const, label: "Advanced", icon: Shield },
  ];

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl adm-skeleton" />)}
    </div>
  );

  return (
    <div>
      <PageHeader title="Settings" subtitle="Global configuration for Kattil Hotels CMS">
        <AdminButton onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : "Save Changes"}
        </AdminButton>
      </PageHeader>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[hsl(var(--adm-border))] p-1 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex-1 whitespace-nowrap rounded-lg py-2 text-xs font-semibold transition-colors min-w-[80px] ${activeTab === key ? "bg-[hsl(var(--adm-primary))] text-white" : "text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))]"}`}>
            {label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE }}>

        {/* ── Branding ── */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardDescription>Identity</AdminCardDescription>
                <AdminCardTitle className="mt-2">Hotel Branding</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="space-y-4">
                  <AdminInput
                    label="Hotel Name"
                    value={data.hotelName ?? ""}
                    onChange={(e) => setData((d) => ({ ...d, hotelName: e.target.value }))}
                    placeholder="Kattil Hotels"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <AdminInput
                        label="Logo URL"
                        value={data.logo ?? ""}
                        onChange={(e) => setData((d) => ({ ...d, logo: e.target.value }))}
                        placeholder="https://..."
                      />
                      {data.logo && (
                        <img src={data.logo} alt="Logo" className="mt-2 h-12 rounded-lg border border-[hsl(var(--adm-border))] object-contain p-1 bg-white" />
                      )}
                    </div>
                    <div>
                      <AdminInput
                        label="Favicon URL"
                        value={data.favicon ?? ""}
                        onChange={(e) => setData((d) => ({ ...d, favicon: e.target.value }))}
                        placeholder="https://..."
                      />
                      {data.favicon && (
                        <img src={data.favicon} alt="Favicon" className="mt-2 h-8 w-8 rounded border border-[hsl(var(--adm-border))] object-contain p-0.5 bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              </AdminCardContent>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardDescription>Appearance</AdminCardDescription>
                <AdminCardTitle className="mt-2">Default Theme</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, theme: value }))}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${data.theme === value
                        ? "border-[hsl(var(--adm-primary))] bg-[hsl(var(--adm-primary)/0.08)]"
                        : "border-[hsl(var(--adm-border))] hover:border-[hsl(var(--adm-primary)/0.4)]"}`}
                    >
                      <Icon className={`h-6 w-6 ${data.theme === value ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-muted-foreground))]"}`} />
                      <span className={`text-sm font-semibold ${data.theme === value ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-foreground))]"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </AdminCardContent>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardDescription>General Contact</AdminCardDescription>
                <AdminCardTitle className="mt-2">Contact Details</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Phone" value={data.contact?.phone ?? ""} onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, phone: e.target.value } }))} placeholder="+91 XXXXX XXXXX" />
                  <AdminInput label="WhatsApp" value={data.contact?.whatsapp ?? ""} onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, whatsapp: e.target.value } }))} placeholder="+91 XXXXX XXXXX" />
                  <AdminInput label="Email" value={data.contact?.email ?? ""} onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, email: e.target.value } }))} placeholder="info@kattilhotels.com" />
                  <AdminInput label="Address" value={data.contact?.address ?? ""} onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, address: e.target.value } }))} placeholder="Full address" />
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        )}

        {/* ── Features ── */}
        {activeTab === "features" && (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardDescription>Module Visibility</AdminCardDescription>
              <AdminCardTitle className="mt-2">Feature Toggles</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-3">
                {Object.entries(data.features ?? {}).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--adm-border)/0.5)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))]">
                        {FEATURE_LABELS[key] ?? key}
                      </p>
                      <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">
                        {enabled ? "Visible on public site" : "Hidden from public site"}
                      </p>
                    </div>
                    <Toggle
                      checked={!!enabled}
                      onChange={(v) => setData((d) => ({ ...d, features: { ...d.features, [key]: v } }))}
                    />
                  </div>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        )}

        {/* ── Social ── */}
        {activeTab === "social" && (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardDescription>Profiles</AdminCardDescription>
              <AdminCardTitle className="mt-2">Social Media Links</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-4">
                {(data.socialLinks ?? []).map((social, i) => {
                  const Icon = SOCIAL_ICONS[social.platform] ?? LinkIcon;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--adm-border)/0.5)] p-4">
                      <div className="rounded-xl bg-[hsl(var(--adm-accent)/0.3)] p-2.5 shrink-0">
                        <Icon className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5">{social.platform}</p>
                        <AdminInput
                          value={social.url}
                          onChange={(e) => updateSocial(i, e.target.value)}
                          placeholder={`https://${social.platform.toLowerCase()}.com/kattilhotels`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminCardContent>
          </AdminCard>
        )}

        {/* ── Default SEO ── */}
        {activeTab === "seo" && (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardDescription>Fallback Metadata</AdminCardDescription>
              <AdminCardTitle className="mt-2">Default SEO Settings</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-4">
                <AdminInput
                  label="Default Site Title"
                  value={data.seo?.defaultTitle ?? ""}
                  onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, defaultTitle: e.target.value } }))}
                  placeholder="Kattil Hotels — Luxury Hospitality"
                />
                <AdminInput
                  label="Title Suffix"
                  value={data.seo?.titleSuffix ?? ""}
                  onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, titleSuffix: e.target.value } }))}
                  placeholder="| Kattil Hotels"
                />
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5 block">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={data.seo?.defaultDescription ?? ""}
                    onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, defaultDescription: e.target.value } }))}
                    placeholder="Fallback description used when no page-specific meta description is set (max 160 chars)"
                    className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 py-2 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] resize-none"
                  />
                  <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">
                    {(data.seo?.defaultDescription?.length ?? 0)}/160 characters
                  </p>
                </div>
                <AdminInput
                  label="Default OG Image URL"
                  value={data.seo?.defaultOgImage ?? ""}
                  onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, defaultOgImage: e.target.value } }))}
                  placeholder="https://..."
                />
                {data.seo?.defaultOgImage && (
                  <img src={data.seo.defaultOgImage} alt="OG Preview" className="h-40 w-full rounded-xl object-cover border border-[hsl(var(--adm-border))]" />
                )}
              </div>
            </AdminCardContent>
          </AdminCard>
        )}

        {/* ── Advanced ── */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardDescription>Maintenance Mode</AdminCardDescription>
                <AdminCardTitle className="mt-2">Site Availability</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--adm-border)/0.5)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))]">Maintenance Mode</p>
                      <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">
                        Shows a maintenance page to all visitors
                      </p>
                    </div>
                    <Toggle
                      checked={!!data.maintenance?.enabled}
                      onChange={(v) => setData((d) => ({ ...d, maintenance: { ...d.maintenance, enabled: v } }))}
                    />
                  </div>
                  {data.maintenance?.enabled && (
                    <div className="rounded-2xl border border-[hsl(var(--adm-warning)/0.3)] bg-[hsl(var(--adm-warning)/0.08)] p-4">
                      <p className="text-sm font-semibold text-[hsl(var(--adm-warning)/0.8)] mb-3">Site is currently in maintenance mode</p>
                      <AdminInput
                        label="Maintenance Message"
                        value={data.maintenance?.message ?? ""}
                        onChange={(e) => setData((d) => ({ ...d, maintenance: { ...d.maintenance, message: e.target.value } }))}
                        placeholder="We'll be back shortly..."
                      />
                    </div>
                  )}
                </div>
              </AdminCardContent>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardDescription>System</AdminCardDescription>
                <AdminCardTitle className="mt-2">CMS Information</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="space-y-3">
                  {[
                    { label: "CMS Version", value: "1.0.0" },
                    { label: "Framework", value: "Next.js 16 (App Router)" },
                    { label: "Database", value: "MongoDB (Mongoose)" },
                    { label: "Styling", value: "Tailwind CSS v4 + Framer Motion" },
                    { label: "Hotel", value: data.hotelName ?? "Kattil Hotels" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-accent)/0.12)] px-3 py-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">{label}</span>
                      <span className="text-sm font-semibold text-[hsl(var(--adm-foreground))]">{value}</span>
                    </div>
                  ))}
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        )}
      </motion.div>
    </div>
  );
}

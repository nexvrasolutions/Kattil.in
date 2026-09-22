"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Globe, Share2, Link as LinkIcon,
  GripVertical, Eye, EyeOff, Loader2, LayoutTemplate,
  Image as ImageIcon, Type, ExternalLink, Upload, ChevronDown, ChevronRight,
} from "lucide-react";
import {
  AdminCard, AdminCardHeader, AdminCardContent,
  AdminCardTitle, AdminCardDescription,
} from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FooterLink    { label: string; href: string; newTab: boolean; order: number }
interface FooterSection { section: string; order: number; links: FooterLink[] }
interface SocialLink    { label: string; url: string; iconName: string; iconImageUrl: string; bgColor: string; visible: boolean }
interface SidebarLoc    { label: string; url: string }
interface SidebarIcon   {
  label: string; tooltip: string; iconName: string; iconUrl: string;
  url: string; bgColor: string; iconColor: string;
  type: "link" | "multi"; pulse: boolean; order: number; visible: boolean;
  locations: SidebarLoc[];
}
interface FooterData {
  logo: string; headline: string; description: string; tagline: string; copyright: string;
  footerLinks: FooterSection[];
  socialLinks: SocialLink[];
  sidebarIcons: SidebarIcon[];
}

const EMPTY_DATA: FooterData = {
  logo: "/assets/logo.png", headline: "", description: "", tagline: "", copyright: "",
  footerLinks: [], socialLinks: [], sidebarIcons: [],
};

const BUILT_IN_ICONS = ["whatsapp", "instagram", "facebook", "googlemaps", "twitter", "linkedin", "youtube", "telegram", "phone", "mail", "custom"];
const ICON_LABELS: Record<string, string> = {
  whatsapp:"WhatsApp", instagram:"Instagram", facebook:"Facebook", googlemaps:"Google Maps",
  twitter:"X / Twitter", linkedin:"LinkedIn", youtube:"YouTube", telegram:"Telegram",
  phone:"Phone", mail:"Email", custom:"Custom",
};
const ICON_DEFAULTS: Record<string, { bg: string; color: string }> = {
  whatsapp:   { bg: "#25D366",  color: "#ffffff" },
  instagram:  { bg: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", color: "#ffffff" },
  facebook:   { bg: "#1877F2",  color: "#ffffff" },
  googlemaps: { bg: "#ffffff",  color: "#4285F4" },
  twitter:    { bg: "#000000",  color: "#ffffff" },
  linkedin:   { bg: "#0A66C2",  color: "#ffffff" },
  youtube:    { bg: "#FF0000",  color: "#ffffff" },
  telegram:   { bg: "#26A5E4",  color: "#ffffff" },
  phone:      { bg: "#34C759",  color: "#ffffff" },
  mail:       { bg: "#5B5BD6",  color: "#ffffff" },
  custom:     { bg: "#374151",  color: "#ffffff" },
};

const ic = "flex w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors h-10";

const TABS = [
  { id: "branding",  label: "Branding",      icon: ImageIcon    },
  { id: "links",     label: "Footer Links",  icon: LinkIcon     },
  { id: "social",    label: "Social Links",  icon: Share2       },
  { id: "sidebar",   label: "Sidebar Icons", icon: LayoutTemplate },
  { id: "general",   label: "General",       icon: Type         },
] as const;
type Tab = (typeof TABS)[number]["id"];

// ─────────────────────────────────────────────────────────────────────────────
export default function FooterPage() {
  const [data,         setData]         = useState<FooterData>(EMPTY_DATA);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [tab,          setTab]          = useState<Tab>("branding");
  const [logoUploading,setLogoUploading]= useState(false);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0, 1]));
  const logoInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (i: number) => setOpenSections((prev) => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "footer");
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) setData((d) => ({ ...d, logo: json.data.path }));
    } finally { setLogoUploading(false); e.target.value = ""; }
  };

  useEffect(() => {
    fetch("/api/admin/footer").then((r) => r.json()).then((r) => {
      if (r.success && r.data && Object.keys(r.data).length > 0) {
        setData({ ...EMPTY_DATA, ...r.data });
      }
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then((r) => r.json());
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  /* ── Footer Links helpers ─────────────────────────────────────────────── */
  const addSection = () => setData((d) => ({ ...d, footerLinks: [...d.footerLinks, { section: "New Section", order: d.footerLinks.length, links: [] }] }));
  const updSection = (i: number, f: string, v: unknown) => setData((d) => { const s = [...d.footerLinks]; s[i] = { ...s[i], [f]: v }; return { ...d, footerLinks: s }; });
  const delSection = (i: number) => setData((d) => ({ ...d, footerLinks: d.footerLinks.filter((_, x) => x !== i) }));
  const addLink    = (si: number) => setData((d) => { const s = [...d.footerLinks]; s[si].links = [...s[si].links, { label: "", href: "", newTab: false, order: s[si].links.length }]; return { ...d, footerLinks: s }; });
  const updLink    = (si: number, li: number, f: string, v: unknown) => setData((d) => { const s = [...d.footerLinks]; s[si].links = s[si].links.map((l, x) => x === li ? { ...l, [f]: v } : l); return { ...d, footerLinks: s }; });
  const delLink    = (si: number, li: number) => setData((d) => { const s = [...d.footerLinks]; s[si].links = s[si].links.filter((_, x) => x !== li); return { ...d, footerLinks: s }; });

  /* ── Social helpers ───────────────────────────────────────────────────── */
  const addSocial = (name = "custom") => {
    const def = ICON_DEFAULTS[name] ?? ICON_DEFAULTS.custom;
    setData((d) => ({ ...d, socialLinks: [...d.socialLinks, { label: ICON_LABELS[name] ?? "Custom", url: "", iconName: name, iconImageUrl: "", bgColor: def.bg, visible: true }] }));
  };
  const updSocial = (i: number, f: string, v: unknown) => setData((d) => { const s = [...d.socialLinks]; s[i] = { ...s[i], [f]: v }; return { ...d, socialLinks: s }; });
  const delSocial = (i: number) => setData((d) => ({ ...d, socialLinks: d.socialLinks.filter((_, x) => x !== i) }));

  const addSidebar = (name = "custom") => {
    const def = ICON_DEFAULTS[name] ?? ICON_DEFAULTS.custom;
    const defaultUrl =
      name === "whatsapp"
        ? "https://wa.me/917358127921"
        : name === "googlemaps"
        ? "https://maps.app.goo.gl/2wWHgndMue4Lnkzw8"
        : "";
    setData((d) => ({
      ...d,
      sidebarIcons: [
        ...d.sidebarIcons,
        {
          label: ICON_LABELS[name] ?? "New Icon",
          tooltip: ICON_LABELS[name] ?? "",
          iconName: name,
          iconUrl: "",
          url: defaultUrl,
          bgColor: def.bg,
          iconColor: def.color,
          type: "link",
          pulse: false,
          order: d.sidebarIcons.length,
          visible: true,
          locations: [],
        },
      ],
    }));
  };
  const updSidebar = (i: number, f: string, v: unknown) => setData((d) => { const s = [...d.sidebarIcons]; s[i] = { ...s[i], [f]: v }; return { ...d, sidebarIcons: s }; });
  const delSidebar = (i: number) => setData((d) => ({ ...d, sidebarIcons: d.sidebarIcons.filter((_, x) => x !== i) }));
  const addLoc     = (i: number) => setData((d) => { const s = [...d.sidebarIcons]; s[i].locations = [...(s[i].locations ?? []), { label: "", url: "" }]; return { ...d, sidebarIcons: s }; });
  const updLoc     = (si: number, li: number, f: string, v: string) => setData((d) => { const s = [...d.sidebarIcons]; s[si].locations = s[si].locations.map((l, x) => x === li ? { ...l, [f]: v } : l); return { ...d, sidebarIcons: s }; });
  const delLoc     = (si: number, li: number) => setData((d) => { const s = [...d.sidebarIcons]; s[si].locations = s[si].locations.filter((_, x) => x !== li); return { ...d, sidebarIcons: s }; });

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl adm-skeleton" />)}</div>;

  return (
    <div>
      <PageHeader title="Footer &amp; Sidebar" subtitle="Manage footer content, links, social icons, and floating sidebar">
        <AdminButton onClick={save} loading={saving}>
          <Save className="h-4 w-4" />{saved ? "Saved ✓" : "Save Changes"}
        </AdminButton>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => { const Icon = t.icon; return (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-[hsl(var(--adm-primary))] text-white" : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]"}`}>
            <Icon className="h-4 w-4" />{t.label}
          </button>
        ); })}
      </div>

      {/* ── BRANDING ── */}
      {tab === "branding" && (
        <motion.div key="branding" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-6">
          <AdminCard>
            <AdminCardHeader><AdminCardDescription>Footer · Branding</AdminCardDescription><AdminCardTitle className="mt-1">Logo &amp; Identity</AdminCardTitle></AdminCardHeader>
            <AdminCardContent className="space-y-5">
              {/* ── Compact logo widget ── */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Footer Logo</label>
                <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">PNG with transparent background recommended.</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-32 shrink-0 rounded-lg border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.4)] overflow-hidden flex items-center justify-center">
                    {data.logo
                      ? <img src={data.logo} alt="Logo" className="h-full w-full object-contain p-1.5" />
                      : <ImageIcon className="h-5 w-5 text-[hsl(var(--adm-muted-foreground)/0.4)]" />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <button type="button" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                      className="flex items-center gap-1.5 h-9 rounded-lg border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-background))] px-3 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors disabled:opacity-50">
                      {logoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {logoUploading ? "Uploading…" : "Change Logo"}
                    </button>
                    {data.logo && (
                      <button type="button" onClick={() => setData((d) => ({ ...d, logo: "" }))}
                        className="h-9 rounded-lg border border-[hsl(var(--adm-border))] px-3 text-sm text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-destructive))] hover:bg-[hsl(var(--adm-destructive)/0.06)] transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5">Footer Headline</label>
                <AdminTextarea value={data.headline} onChange={(e) => setData((d) => ({ ...d, headline: e.target.value }))} placeholder="Experience luxury hospitality…" rows={3} />
                <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Shown below the logo.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--adm-foreground))] mb-1.5">Description <span className="text-[hsl(var(--adm-muted-foreground))]">(optional)</span></label>
                <AdminTextarea value={data.description} onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))} placeholder="Additional footer description…" rows={2} />
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>
      )}

      {/* ── LINKS ── */}
      {tab === "links" && (
        <motion.div key="links" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">Add link sections (e.g. Navigation, Legal).</p>
            <AdminButton variant="outline" onClick={addSection}><Plus className="h-4 w-4" />Add Section</AdminButton>
          </div>
          {data.footerLinks.length === 0 && (
            <AdminCard><div className="flex flex-col items-center py-12 gap-3"><Globe className="h-10 w-10 text-[hsl(var(--adm-muted-foreground)/0.3)]" /><p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No link sections yet</p><AdminButton variant="outline" size="sm" onClick={addSection}><Plus className="h-3.5 w-3.5" />Add First Section</AdminButton></div></AdminCard>
          )}
          <AdminCard className="rounded-2xl! overflow-hidden">
            {data.footerLinks.map((section, si) => {
              const isOpen = openSections.has(si);
              return (
                <div key={si} className="border-b border-[hsl(var(--adm-border)/0.4)] last:border-0">
                  {/* ── Section header row ── */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button onClick={() => toggleSection(si)}
                      className="rounded p-0.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <input value={section.section} onChange={(e) => updSection(si, "section", e.target.value)}
                      className={`${ic.replace("h-10","h-8")} max-w-40 font-semibold`} placeholder="Section name" />
                    <span className="ml-auto text-xs text-[hsl(var(--adm-muted-foreground))]">{section.links.length} link{section.links.length !== 1 ? "s" : ""}</span>
                    <button onClick={() => delSection(si)}
                      className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* ── Collapsible links ── */}
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-1.5">
                      {section.links.map((link, li) => (
                        <div key={li} className="flex items-center gap-2">
                          <GripVertical className="h-3.5 w-3.5 text-[hsl(var(--adm-muted-foreground)/0.4)] shrink-0 cursor-grab" />
                          <input value={link.label} onChange={(e) => updLink(si, li, "label", e.target.value)} placeholder="Label"
                            className={`${ic.replace("h-10","h-7")} w-28 shrink-0 text-xs`} />
                          <input value={link.href} onChange={(e) => updLink(si, li, "href", e.target.value)} placeholder="/path or https://..."
                            className={`${ic.replace("h-10","h-7")} flex-1 text-xs`} />
                          <label className="flex items-center gap-1 shrink-0 cursor-pointer" title="Open in new tab">
                            <input type="checkbox" checked={link.newTab} onChange={(e) => updLink(si, li, "newTab", e.target.checked)}
                              className="h-3.5 w-3.5 accent-[hsl(var(--adm-primary))]" />
                            <ExternalLink className="h-3 w-3 text-[hsl(var(--adm-muted-foreground))]" />
                          </label>
                          <button onClick={() => delLink(si, li)}
                            className="rounded p-1 text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addLink(si)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--adm-primary))] hover:underline mt-2">
                        <Plus className="h-3.5 w-3.5" />Add Link
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </AdminCard>
        </motion.div>
      )}

      {/* ── SOCIAL ── */}
      {tab === "social" && (
        <motion.div key="social" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-4">
          <AdminCard>
            <AdminCardContent className="pt-4">
              <p className="text-sm font-medium text-[hsl(var(--adm-foreground))] mb-3">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                {BUILT_IN_ICONS.map((name) => (
                  <button key={name} onClick={() => addSocial(name)} className="rounded-full border border-[hsl(var(--adm-border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors">
                    + {ICON_LABELS[name]}
                  </button>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
          {data.socialLinks.length === 0 && (
            <AdminCard><div className="flex flex-col items-center py-10 gap-3"><Share2 className="h-8 w-8 text-[hsl(var(--adm-muted-foreground)/0.3)]" /><p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No social links yet — use Quick Add above</p></div></AdminCard>
          )}
          {data.socialLinks.length > 0 && (
            <AdminCard className="rounded-2xl! overflow-hidden">
              {data.socialLinks.map((social, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2.5 border-b border-[hsl(var(--adm-border)/0.4)] last:border-0 hover:bg-[hsl(var(--adm-accent)/0.2)] transition-colors">
                  {/* Colour swatch / custom icon preview */}
                  <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black text-white overflow-hidden border border-white/10"
                    style={{ background: social.bgColor }}>
                    {social.iconImageUrl
                      ? <img src={social.iconImageUrl} alt="" className="h-4 w-4 object-contain" />
                      : social.label[0]?.toUpperCase() ?? "?"}
                  </div>
                  <input value={social.label} onChange={(e) => updSocial(i, "label", e.target.value)}
                    placeholder="Platform" className={`${ic.replace("h-10","h-8")} w-28 shrink-0 text-xs`} />
                  <input value={social.url} onChange={(e) => updSocial(i, "url", e.target.value)}
                    placeholder="https://..." className={`${ic.replace("h-10","h-8")} flex-1 text-xs`} />
                  <input value={social.bgColor} onChange={(e) => updSocial(i, "bgColor", e.target.value)}
                    placeholder="bg-color" className={`${ic.replace("h-10","h-8")} w-44 text-xs hidden md:flex`} />
                  <button onClick={() => updSocial(i, "visible", !social.visible)}
                    className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors shrink-0">
                    {social.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => delSocial(i)}
                    className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </AdminCard>
          )}
        </motion.div>
      )}

      {/* ── SIDEBAR ── */}
      {tab === "sidebar" && (
        <motion.div key="sidebar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start gap-4 justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">Floating icons on the right side of your website.</p>
              <p className="text-xs text-[hsl(var(--adm-muted-foreground)/0.7)] mt-0.5">Multi-location icons show a sub-menu when clicked (e.g. WhatsApp → Madurai/Chennai).</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {BUILT_IN_ICONS.slice(0, 7).map((name) => (
                <button key={name} onClick={() => addSidebar(name)} className="rounded-full border border-[hsl(var(--adm-border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors whitespace-nowrap">
                  + {ICON_LABELS[name]}
                </button>
              ))}
            </div>
          </div>
          {data.sidebarIcons.length === 0 && (
            <AdminCard><div className="flex flex-col items-center py-10 gap-3"><LayoutTemplate className="h-8 w-8 text-[hsl(var(--adm-muted-foreground)/0.3)]" /><p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No sidebar icons yet — use Quick Add above</p></div></AdminCard>
          )}
          {data.sidebarIcons.length > 0 && (
            <AdminCard className="rounded-2xl! overflow-hidden">
              {data.sidebarIcons.map((icon, i) => (
                <div key={i} className="border-b border-[hsl(var(--adm-border)/0.4)] last:border-0">
                  {/* ── Compact main row ── */}
                  <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-[hsl(var(--adm-accent)/0.2)] transition-colors">
                    {/* Icon preview */}
                    <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black overflow-hidden border border-white/10"
                      style={{ background: icon.bgColor, color: icon.iconColor }}>
                      {icon.iconUrl
                        ? <img src={icon.iconUrl} alt="" className="h-4 w-4 object-contain" />
                        : icon.label[0]?.toUpperCase() ?? "?"}
                    </div>

                    <input value={icon.label} onChange={(e) => updSidebar(i, "label", e.target.value)}
                      placeholder="Label" className={`${ic.replace("h-10","h-8")} w-24 shrink-0 text-xs`} />
                    <input value={icon.tooltip} onChange={(e) => updSidebar(i, "tooltip", e.target.value)}
                      placeholder="Tooltip" className={`${ic.replace("h-10","h-8")} w-32 shrink-0 text-xs hidden sm:flex`} />

                    <select value={icon.type} onChange={(e) => updSidebar(i, "type", e.target.value as "link" | "multi")}
                      className={`${ic.replace("h-10","h-8")} w-32 shrink-0 text-xs hidden lg:flex`}>
                      <option value="link">Single link</option>
                      <option value="multi">Multi-location</option>
                    </select>

                    {icon.type === "link" && (
                      <input value={icon.url} onChange={(e) => updSidebar(i, "url", e.target.value)}
                        placeholder="https://..." className={`${ic.replace("h-10","h-8")} flex-1 text-xs`} />
                    )}
                    {icon.type === "multi" && (
                      <span className="flex-1 text-xs text-[hsl(var(--adm-muted-foreground))]">{icon.locations.length} location{icon.locations.length !== 1 ? "s" : ""} below ↓</span>
                    )}

                    <input value={icon.bgColor} onChange={(e) => updSidebar(i, "bgColor", e.target.value)}
                      placeholder="bg" className={`${ic.replace("h-10","h-8")} w-32 text-xs hidden xl:flex`} />

                    <label className="flex items-center gap-1 shrink-0 cursor-pointer" title="Pulse animation">
                      <input type="checkbox" checked={icon.pulse} onChange={(e) => updSidebar(i, "pulse", e.target.checked)}
                        className="h-3.5 w-3.5 accent-[hsl(var(--adm-primary))]" />
                      <span className="text-[10px] text-[hsl(var(--adm-muted-foreground))]">Pulse</span>
                    </label>

                    <button onClick={() => updSidebar(i, "visible", !icon.visible)}
                      className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))] transition-colors shrink-0">
                      {icon.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => delSidebar(i)}
                      className="rounded-lg p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-destructive)/0.1)] hover:text-[hsl(var(--adm-destructive))] transition-colors shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* ── Multi-location sub-rows ── */}
                  {icon.type === "multi" && (
                    <div className="px-4 pb-3 pt-1 bg-[hsl(var(--adm-muted)/0.2)] space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))] mb-1">Sub-menu locations</p>
                      {icon.locations.map((loc, li) => (
                        <div key={li} className="flex items-center gap-2">
                          <input value={loc.label} onChange={(e) => updLoc(i, li, "label", e.target.value)}
                            placeholder="e.g. Madurai" className={`${ic.replace("h-10","h-7")} w-28 shrink-0 text-xs`} />
                          <input value={loc.url} onChange={(e) => updLoc(i, li, "url", e.target.value)}
                            placeholder="https://wa.me/91..." className={`${ic.replace("h-10","h-7")} flex-1 text-xs`} />
                          <button onClick={() => delLoc(i, li)}
                            className="rounded p-1 text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-destructive))] transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addLoc(i)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--adm-primary))] hover:underline mt-1">
                        <Plus className="h-3.5 w-3.5" />Add Location
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </AdminCard>
          )}
        </motion.div>
      )}

      {/* ── GENERAL ── */}
      {tab === "general" && (
        <motion.div key="general" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-6">
          <AdminCard>
            <AdminCardHeader><AdminCardDescription>Footer · Text</AdminCardDescription><AdminCardTitle className="mt-1">General Settings</AdminCardTitle></AdminCardHeader>
            <AdminCardContent className="space-y-5">
              <AdminInput label="Tagline" value={data.tagline} onChange={(e) => setData((d) => ({ ...d, tagline: e.target.value }))} placeholder="The Homely Reset" />
              <AdminInput label="Copyright Text" value={data.copyright} onChange={(e) => setData((d) => ({ ...d, copyright: e.target.value }))} placeholder="© 2026 Kattil. All Rights Reserved." />
            </AdminCardContent>
          </AdminCard>
        </motion.div>
      )}

      <div className="mt-8 flex justify-end">
        <AdminButton onClick={save} loading={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : saved ? "Saved ✓" : <><Save className="h-4 w-4" />Save All Changes</>}
        </AdminButton>
      </div>
    </div>
  );
}

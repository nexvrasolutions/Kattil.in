"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, BedDouble, MapPin, Sparkles, Images,
  CheckCircle2, Hotel, Upload, FileText, Settings, ArrowRight,
  BookOpen, HelpCircle, MousePointerClick, Eye, Globe,
} from "lucide-react";
import {
  AdminCard, AdminCardHeader, AdminCardContent,
  AdminCardTitle, AdminCardDescription, StatRow, GradientCard,
} from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import PageHeader from "@/components/admin/ui/PageHeader";
import { SkeletonDashboard } from "@/components/admin/ui/SkeletonLoader";
import { safeFetchJson } from "@/lib/utils/safeFetch";

const EASE = [0.22, 1, 0.36, 1] as const;
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } };

// ── Types ─────────────────────────────────────────────────────────────────────
interface CMSData {
  totalProperties: number; activeProperties: number;
  totalCities: number; amenitiesCount: number;
  galleryCount: number; mediaCount: number;
  blogsCount: number; publishedBlogsCount: number; faqsCount: number;
  propertyCategories: Array<{ name: string; value: number }>;
  cmsModules: Array<{ module: string; count: number }>;
  recentProperties: Array<{ _id: string; name: string; status: string; city?: { name: string }; slug: string; category?: string; badge?: string }>;
  recentGallery: Array<{ _id: string; src: string; alt: string }>;
}

interface AnalyticsData {
  bookNowByDay: Array<{ date: string; clicks: number }>;
  branchData: Array<{ branch: string; clicks: number }>;
  pageData: Array<{ page: string; views: number }>;
  visitsByDay: Array<{ date: string; views: number }>;
  totalBookNow: number;
  totalPageViews: number;
}

// Brand palette — sage greens + navy derived from project colors
const PIE_COLORS = [
  "#9CAF88",   // sage green  — project secondary #9CAF88
  "#526442",   // dark sage   — project secondary-dark #526442
  "#b8c9a6",   // light sage  — project secondary-light #b8c9a6
  "#3d6080",   // mid navy    — lightened from project primary #0d1b2e
];

const TOOLTIP_STYLE = {
  background: "white",
  border: "1px solid hsl(100 14% 84%)",   // sage-tinted border
  borderRadius: "0.75rem",
  fontSize: 12,
};

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
};

const quickActions = [
  { icon: Hotel,    label: "Add Property", href: "/admin/properties/new", color: "#9CAF88" },   // sage
  { icon: Upload,   label: "Upload Media", href: "/admin/media",          color: "#7a9e6a" },   // sage mid
  { icon: Images,   label: "Gallery",      href: "/admin/gallery",        color: "#b8c9a6" },   // sage light
  { icon: FileText, label: "Edit About",   href: "/admin/about",          color: "#526442" },   // sage dark
  { icon: MapPin,   label: "Destinations", href: "/admin/destinations",   color: "#3d6080" },   // mid navy
  { icon: Settings, label: "Settings",     href: "/admin/settings",       color: "#5a7a6a" },   // sage-navy mix
];

const statusBadge = (s: string): "success" | "warning" | "destructive" =>
  s === "active" ? "success" : s === "maintenance" ? "warning" : "destructive";

const DEFAULT_CMS_DATA: CMSData = {
  totalProperties: 0,
  activeProperties: 0,
  totalCities: 0,
  amenitiesCount: 0,
  galleryCount: 0,
  mediaCount: 0,
  blogsCount: 0,
  publishedBlogsCount: 0,
  faqsCount: 0,
  propertyCategories: [],
  cmsModules: [],
  recentProperties: [],
  recentGallery: [],
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [cms, setCms] = useState<CMSData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7D" | "30D">("7D");

  useEffect(() => {
    Promise.all([
      safeFetchJson<{ success: boolean; data: CMSData }>("/api/admin/dashboard"),
      safeFetchJson<{ success: boolean; data: AnalyticsData }>("/api/admin/analytics"),
    ])
      .then(([cmsRes, aRes]) => {
        if (cmsRes?.success) setCms(cmsRes.data);
        if (aRes?.success) setAnalytics(aRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;

  const d = cms || DEFAULT_CMS_DATA;
  const a = analytics;
  const activePct = d.totalProperties > 0 ? Math.round((d.activeProperties / d.totalProperties) * 100) : 100;
  const weeklyClicks = a?.bookNowByDay.reduce((s, x) => s + x.clicks, 0) ?? 0;
  const weeklyViews  = a?.visitsByDay.reduce((s, x) => s + x.views, 0) ?? 0;

  // Combine clicks + views into one combined trend for the area chart
  const combinedTrend = (a?.bookNowByDay ?? []).map((c, i) => ({
    date: c.date,
    clicks: c.clicks,
    views: a?.visitsByDay[i]?.views ?? 0,
  }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back. Here's what's happening at Kattil Hotels." />

      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        {/* ── Row 1: Spotlight + 2 stat cards ── */}
        <motion.div variants={item} className="xl:col-span-6">
          <GradientCard className="h-full">
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/70">Kattil Hotels</p>
              <h2 className="mt-3 text-5xl font-bold text-white">{d.activeProperties}</h2>
              <p className="mt-1 text-sm text-white/70">Active properties across all locations</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-xs font-semibold text-white">Active since 2024</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 px-6 pb-6">
              {[
                { label: "Active Properties", value: d.activeProperties },
                { label: "Cities",            value: d.totalCities },
                { label: "Amenities",         value: d.amenitiesCount },
                { label: "Blog Posts",        value: d.blogsCount },
                { label: "Published",         value: d.publishedBlogsCount },
                { label: "FAQs",              value: d.faqsCount },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/70">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </GradientCard>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-3">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <AdminCardDescription>Properties</AdminCardDescription>
                  <AdminCardTitle className="mt-2">{d.activeProperties}/{d.totalProperties} Active</AdminCardTitle>
                  <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Currently active</p>
                </div>
                <span className="rounded-full bg-[hsl(var(--adm-accent)/0.24)] p-2 text-[hsl(var(--adm-primary))]">
                  <Hotel className="h-5 w-5" />
                </span>
              </div>
              <AdminBadge variant="default">
                <TrendingUp className="h-3.5 w-3.5" />
                {activePct}% active
              </AdminBadge>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--adm-muted))]">
                <div className="h-full rounded-full bg-[hsl(var(--adm-primary))] transition-all duration-700"
                  style={{ width: `${activePct}%` }} />
              </div>
              <div className="flex flex-col gap-3">
                <StatRow label="Gallery Items" value={d.galleryCount.toString()} helper="Uploaded images" />
                <StatRow label="Media Files"   value={d.mediaCount.toString()}   helper="Media Library (separate from Gallery)"  />
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-3">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <AdminCardDescription>CMS Status</AdminCardDescription>
                  <AdminCardTitle className="mt-2">All Systems</AdminCardTitle>
                  <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Running normally</p>
                </div>
                <span className="rounded-full bg-[hsl(var(--adm-success)/0.15)] p-2 text-[hsl(var(--adm-success))]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>
              <AdminBadge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Operational
              </AdminBadge>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Database",  status: "Online" },
                  { label: "Media CDN", status: "Online" },
                  { label: "API Routes",status: "Online" },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[hsl(var(--adm-success))]" />
                      <span className="text-xs font-medium text-[hsl(var(--adm-success))]">{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* ── Row 2: Book Now + Views trend (replaces fake Occupancy Trends) + Analytics stats ── */}
        <motion.div variants={item} className="xl:col-span-8">
          <AdminCard className="h-full">
            <div className="flex flex-col gap-4 rounded-t-3xl border-b border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-card)/0.8)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <AdminCardDescription>Live Analytics</AdminCardDescription>
                <AdminCardTitle>Book Now Clicks &amp; Page Views</AdminCardTitle>
                <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">
                  Real visitor data from your public website
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--adm-border))] p-1">
                {(["7D", "30D"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTimeRange(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      timeRange === t
                        ? "bg-[hsl(var(--adm-primary))] text-white"
                        : "text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))]"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {combinedTrend.every((d) => d.clicks === 0 && d.views === 0) ? (
                <div className="flex flex-col items-center justify-center h-[220px] gap-3 text-center">
                  <MousePointerClick className="h-10 w-10 text-[hsl(var(--adm-muted-foreground)/0.3)]" />
                  <p className="text-sm font-medium text-[hsl(var(--adm-muted-foreground))]">No visitor data yet</p>
                  <p className="text-xs text-[hsl(var(--adm-muted-foreground)/0.7)] max-w-xs">
                    Data will appear here once visitors browse the site and click Book Now
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={combinedTrend}>
                    <defs>
                      <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#9CAF88" stopOpacity={0.75} />
                        <stop offset="95%" stopColor="#9CAF88" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#526442" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#526442" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(v) => shortDate(String(v))}
                      tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE}
                      labelFormatter={(l) => shortDate(String(l))} />
                    <Area dataKey="clicks" type="natural" fill="url(#fillClicks)"
                      stroke="#9CAF88" strokeWidth={2} name="Book Now Clicks" />
                    <Area dataKey="views"  type="natural" fill="url(#fillViews)"
                      stroke="#526442" strokeWidth={2} name="Page Views" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </AdminCard>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-4">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <AdminCardDescription>Visitor Analytics</AdminCardDescription>
                  <AdminCardTitle className="mt-2">Branch &amp; Traffic</AdminCardTitle>
                </div>
                <span className="rounded-full bg-[hsl(var(--adm-accent)/0.24)] p-2 text-[hsl(var(--adm-primary))]">
                  <Eye className="h-5 w-5" />
                </span>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              {/* Analytics KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Total Clicks",     value: a?.totalBookNow ?? 0,   icon: MousePointerClick, color: "#9CAF88" },
                  { label: "Page Views",       value: a?.totalPageViews ?? 0, icon: Eye,               color: "#526442" },
                  { label: "This Week Clicks", value: weeklyClicks,           icon: TrendingUp,        color: "#b8c9a6" },
                  { label: "This Week Views",  value: weeklyViews,            icon: Globe,             color: "#3d6080" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-[hsl(var(--adm-border)/0.5)] p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">{label}</span>
                    </div>
                    <p className="text-xl font-bold text-[hsl(var(--adm-foreground))]">{value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {/* Branch breakdown */}
              {a?.branchData.length ? (
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">
                    Book Now by Branch
                  </p>
                  {a.branchData.map(({ branch, clicks }, i) => {
                    const total = a.branchData.reduce((s, x) => s + x.clicks, 0);
                    const pct   = total > 0 ? Math.round((clicks / total) * 100) : 0;
                    return (
                      <div key={branch} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[hsl(var(--adm-foreground))]">{branch}</span>
                          <span className="text-xs font-bold text-[hsl(var(--adm-foreground))]">{clicks} <span className="font-normal text-[hsl(var(--adm-muted-foreground))]">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[hsl(var(--adm-muted))]">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">Branch data appears after first Book Now clicks</p>
                </div>
              )}
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* ── Row 3: Pie (property categories) + Recent Properties ── */}
        <motion.div variants={item} className="xl:col-span-4">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <AdminCardDescription>Inventory</AdminCardDescription>
              <AdminCardTitle className="mt-2">Property Categories</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {d.propertyCategories.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={d.propertyCategories} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value">
                        {d.propertyCategories.map((_: { name: string; value: number }, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {d.propertyCategories.map(({ name, value }: { name: string; value: number }, i: number) => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">{name}</span>
                        <span className="ml-auto text-xs font-bold text-[hsl(var(--adm-foreground))]">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-10 text-center text-sm text-[hsl(var(--adm-muted-foreground))]">No active properties yet</p>
              )}
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-8">
          <AdminCard className="h-full">
            <div className="flex items-center justify-between px-6 pt-6 pb-0">
              <div>
                <AdminCardDescription>Inventory</AdminCardDescription>
                <AdminCardTitle className="mt-2">Recent Properties</AdminCardTitle>
              </div>
              <Link href="/admin/properties" className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--adm-primary))] hover:underline">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <AdminCardContent className="pt-4">
              <div className="w-full overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--adm-border)/0.5)]">
                      {["Property Name", "City", "Category", "Status"].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--adm-muted-foreground))]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentProperties.map((property) => (
                      <tr key={property._id} className="border-b border-[hsl(var(--adm-border)/0.3)] transition-colors hover:bg-[hsl(var(--adm-accent)/0.2)]">
                        <td className="py-3 pr-4 font-medium text-[hsl(var(--adm-foreground))]">
                          <Link href={`/admin/properties/${property._id}`} className="hover:text-[hsl(var(--adm-primary))] hover:underline">
                            {property.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-[hsl(var(--adm-muted-foreground))]">{property.city?.name ?? "—"}</td>
                        <td className="py-3 pr-4 text-[hsl(var(--adm-muted-foreground))] capitalize">{property.category ?? property.badge ?? "Homestay"}</td>
                        <td className="py-3"><AdminBadge variant={statusBadge(property.status)}>{property.status}</AdminBadge></td>
                      </tr>
                    ))}
                    {d.recentProperties.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-sm text-[hsl(var(--adm-muted-foreground))]">
                        No properties yet — <Link href="/admin/properties/new" className="text-[hsl(var(--adm-primary))] hover:underline">add your first property</Link>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* ── Row 4: Top pages timeline-style + Quick Actions + Content Summary ── */}
        <motion.div variants={item} className="xl:col-span-5">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <AdminCardDescription>Last 30 Days</AdminCardDescription>
              <AdminCardTitle className="mt-2">Top Pages by Views</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {a?.pageData.length ? (
                <div className="relative flex flex-col gap-0">
                  <div className="absolute left-[11px] top-0 h-full w-px bg-[hsl(var(--adm-border)/0.5)]" />
                  {a.pageData.slice(0, 6).map(({ page, views }, i) => {
                    const pageName = page === "/" ? "Home" : page.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    const iconColor = PIE_COLORS[i % PIE_COLORS.length];
                    const Icon = [Images, BookOpen, HelpCircle, MapPin, Sparkles, Eye][i % 6];
                    return (
                      <div key={page} className="relative flex items-start gap-4 pb-5 last:pb-0">
                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${iconColor}20` }}>
                          <Icon className="h-3 w-3" style={{ color: iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm text-[hsl(var(--adm-foreground))]">{pageName}</p>
                          <p className="mt-0.5 text-xs text-[hsl(var(--adm-muted-foreground))]">{views.toLocaleString()} views</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <Eye className="h-8 w-8 text-[hsl(var(--adm-muted-foreground)/0.3)]" />
                  <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">No page view data yet</p>
                  <p className="text-xs text-[hsl(var(--adm-muted-foreground)/0.6)]">Data appears once visitors browse the site</p>
                </div>
              )}
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-3">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <AdminCardDescription>Navigation</AdminCardDescription>
              <AdminCardTitle className="mt-2">Quick Actions</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map(({ icon: Icon, label, href, color }) => (
                  <Link key={label} href={href}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-[hsl(var(--adm-border)/0.6)] p-3 text-center transition-all hover:border-[hsl(var(--adm-primary)/0.3)] hover:bg-[hsl(var(--adm-primary)/0.05)]">
                    <div className="rounded-xl p-2" style={{ background: `${color}15` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-xs font-medium text-[hsl(var(--adm-foreground))] group-hover:text-[hsl(var(--adm-primary))] transition-colors">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-4">
          <AdminCard className="h-full">
            <AdminCardHeader>
              <AdminCardDescription>Overview</AdminCardDescription>
              <AdminCardTitle className="mt-2">Content Summary</AdminCardTitle>
              <p className="mt-1 text-sm text-[hsl(var(--adm-muted-foreground))]">Items per CMS module</p>
            </AdminCardHeader>
            <AdminCardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={d.cmsModules} barSize={28}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="module" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]}>
                    {d.cmsModules.map((_: { module: string; count: number }, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">
                  {d.totalProperties + d.galleryCount + d.mediaCount + d.amenitiesCount + d.blogsCount + d.faqsCount} total items managed
                </span>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

      </motion.div>
    </div>
  );
}

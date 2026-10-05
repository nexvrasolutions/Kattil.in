"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Home, Sparkles, Images } from "lucide-react";
import { AdminCard, AdminCardHeader, AdminCardContent, AdminCardTitle, AdminCardDescription } from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";

const EASE = [0.22, 1, 0.36, 1] as const;

interface HomeData {
  hero: { eyebrow: string; headlineLine1: string; headlineLine2: string };
  amenities: { eyebrow: string; heading: string };
  galleryPreview: { eyebrow: string; heading: string; ctaText: string };
}

const DEFAULT: HomeData = {
  hero: { eyebrow: "The Homely Reset", headlineLine1: "Find Your Perfect Stay", headlineLine2: "Experience" },
  amenities: { eyebrow: "The Experience", heading: "Premium Amenities" },
  galleryPreview: { eyebrow: "Our Spaces", heading: "Moments Captured", ctaText: "View All Moments" },
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">{children}</p>;
}

function SectionIcon({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-[8px] p-2.5 shrink-0" style={{ background: `${color}18` }}>
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}

export default function AdminHomePage() {
  const [data, setData] = useState<HomeData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/home")
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data) {
          setData({
            hero: { ...DEFAULT.hero, ...r.data.hero },
            amenities: { ...DEFAULT.amenities, ...r.data.amenities },
            galleryPreview: { ...DEFAULT.galleryPreview, ...r.data.galleryPreview },
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json());
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-[8px] adm-skeleton" />)}
    </div>
  );

  return (
    <div>
      <PageHeader title="Home Page" subtitle="Edit all text shown on the public home page">
        <AdminButton onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : "Save Changes"}
        </AdminButton>
      </PageHeader>

      <div className="space-y-6">

        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center gap-3">
                <SectionIcon icon={Home} color="hsl(var(--adm-primary))" />
                <div>
                  <AdminCardDescription>Home · Hero Section</AdminCardDescription>
                  <AdminCardTitle className="mt-1">Hero Banner</AdminCardTitle>
                </div>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mb-5 leading-relaxed rounded-[8px] bg-[hsl(var(--adm-accent)/0.4)] px-4 py-3">
                This is the full-screen hero section guests see when they first open the website. It contains the big animated headline and the booking widget.
              </p>
              <div className="space-y-5">
                <div>
                  <AdminInput
                    label="Eyebrow Text"
                    value={data.hero.eyebrow}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, eyebrow: e.target.value } }))}
                    placeholder="The Homely Reset"
                  />
                  <FieldHint>Small uppercase tag shown above the headline. Keep it short — 2 to 4 words (e.g., "The Homely Reset", "Welcome Home").</FieldHint>
                </div>
                <div>
                  <AdminInput
                    label="Headline — First Line"
                    value={data.hero.headlineLine1}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, headlineLine1: e.target.value } }))}
                    placeholder="Find Your Perfect Stay"
                  />
                  <FieldHint>The main animated headline, first line. This is the largest text on the page — make it impactful and concise (e.g., "Find Your Perfect Stay").</FieldHint>
                </div>
                <div>
                  <AdminInput
                    label="Headline — Second Line"
                    value={data.hero.headlineLine2}
                    onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, headlineLine2: e.target.value } }))}
                    placeholder="Experience"
                  />
                  <FieldHint>Second line of the hero headline. Typically one impactful word like "Experience" or "Comfort". Appears below line one with the same animation.</FieldHint>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* Amenities Section */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08, ease: EASE }}>
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center gap-3">
                <SectionIcon icon={Sparkles} color="hsl(var(--adm-warning))" />
                <div>
                  <AdminCardDescription>Home · Amenities Section</AdminCardDescription>
                  <AdminCardTitle className="mt-1">Amenities Section</AdminCardTitle>
                </div>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mb-5 leading-relaxed rounded-[8px] bg-[hsl(var(--adm-accent)/0.4)] px-4 py-3">
                Appears below the hero — shows the amenity icons grid. To add or remove amenity icons, go to <strong>Content → Amenities</strong>.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <AdminInput
                    label="Eyebrow Text"
                    value={data.amenities.eyebrow}
                    onChange={(e) => setData((d) => ({ ...d, amenities: { ...d.amenities, eyebrow: e.target.value } }))}
                    placeholder="The Experience"
                  />
                  <FieldHint>Small label above the section heading (e.g., "The Experience", "What We Offer").</FieldHint>
                </div>
                <div>
                  <AdminInput
                    label="Section Heading"
                    value={data.amenities.heading}
                    onChange={(e) => setData((d) => ({ ...d, amenities: { ...d.amenities, heading: e.target.value } }))}
                    placeholder="Premium Amenities"
                  />
                  <FieldHint>The large heading above the amenity icons (e.g., "Premium Amenities", "Everything You Need").</FieldHint>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

        {/* Gallery Preview Section */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16, ease: EASE }}>
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center gap-3">
                <SectionIcon icon={Images} color="hsl(var(--adm-success))" />
                <div>
                  <AdminCardDescription>Home · Gallery Preview Section</AdminCardDescription>
                  <AdminCardTitle className="mt-1">Gallery Preview</AdminCardTitle>
                </div>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mb-5 leading-relaxed rounded-[8px] bg-[hsl(var(--adm-accent)/0.4)] px-4 py-3">
                Appears at the bottom of the home page — shows a preview of gallery images with a "View All" link. To manage the actual images, go to <strong>Content → Gallery</strong>.
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <AdminInput
                    label="Eyebrow Text"
                    value={data.galleryPreview.eyebrow}
                    onChange={(e) => setData((d) => ({ ...d, galleryPreview: { ...d.galleryPreview, eyebrow: e.target.value } }))}
                    placeholder="Our Spaces"
                  />
                  <FieldHint>Small label above the gallery heading (e.g., "Our Spaces", "Take a Look").</FieldHint>
                </div>
                <div>
                  <AdminInput
                    label="Section Heading"
                    value={data.galleryPreview.heading}
                    onChange={(e) => setData((d) => ({ ...d, galleryPreview: { ...d.galleryPreview, heading: e.target.value } }))}
                    placeholder="Moments Captured"
                  />
                  <FieldHint>The heading shown above the gallery grid (e.g., "Moments Captured", "Our Gallery").</FieldHint>
                </div>
                <div>
                  <AdminInput
                    label="CTA Button Text"
                    value={data.galleryPreview.ctaText}
                    onChange={(e) => setData((d) => ({ ...d, galleryPreview: { ...d.galleryPreview, ctaText: e.target.value } }))}
                    placeholder="View All Moments"
                  />
                  <FieldHint>Text on the "View All" button that links to the full gallery page.</FieldHint>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>
        </motion.div>

      </div>
    </div>
  );
}

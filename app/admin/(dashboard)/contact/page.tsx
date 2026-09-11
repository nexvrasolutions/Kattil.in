"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, MapPin, Phone, Mail, Map, AlertCircle } from "lucide-react";
import {
  AdminCard, AdminCardHeader, AdminCardContent,
  AdminCardTitle, AdminCardDescription,
} from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/AdminInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Location {
  _id: string;
  id: string;
  label: string;
  address: string;
  phone: string;
  email: string;
  mapSrc: string;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">{children}</p>;
}

export default function ContactPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeLocId, setActiveLocId] = useState<string>("");
  const [mapPreviewId, setMapPreviewId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cities?limit=100")
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data?.cities?.length) {
          const locs: Location[] = r.data.cities.map((c: {
            _id: string; slug: string; label?: string; name: string;
            address?: string; phone?: string; email?: string; mapSrc?: string;
          }) => ({
            _id: c._id,
            id: c.slug,
            label: (c.label && c.label.trim()) || c.name,
            address: c.address ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
            mapSrc: c.mapSrc ?? "",
          }));
          setLocations(locs);
          setActiveLocId(locs[0]?.id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        locations.map((loc) =>
          fetch(`/api/admin/cities/${loc._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: loc.label,
              address: loc.address,
              phone: loc.phone,
              email: loc.email,
              mapSrc: loc.mapSrc,
            }),
          })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const updateLocation = (id: string, field: keyof Location, value: string) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc))
    );
  };

  const activeLoc = locations.find((l) => l.id === activeLocId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl adm-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Contact Us" subtitle="Manage location details shown on the Contact page">
        <AdminButton onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : "Save Changes"}
        </AdminButton>
      </PageHeader>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[hsl(var(--adm-border)/0.5)] bg-[hsl(var(--adm-accent)/0.15)] p-4">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(var(--adm-primary))]" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))]">How the Contact page works</p>
          <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mt-0.5 leading-relaxed">
            Each tab on the Contact page corresponds to a city. Edit contact details below. To add or remove cities, go to{" "}
            <Link href="/admin/cities" className="text-[hsl(var(--adm-primary))] hover:underline font-medium">
              Cities
            </Link>.
          </p>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[hsl(var(--adm-border))] py-24">
          <MapPin className="h-12 w-12 text-[hsl(var(--adm-muted-foreground)/0.3)] mb-3" />
          <p className="text-sm text-[hsl(var(--adm-muted-foreground))] mb-1">No cities found</p>
          <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">
            Add cities first in the{" "}
            <Link href="/admin/cities" className="text-[hsl(var(--adm-primary))] hover:underline">
              Cities
            </Link>{" "}
            section.
          </p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Location tabs sidebar */}
          <div className="w-44 shrink-0">
            <AdminCard className="rounded-2xl! overflow-hidden">
              <div className="p-3 space-y-1">
                <p className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--adm-muted-foreground))]">
                  Locations
                </p>
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setActiveLocId(loc.id)}
                    className={[
                      "w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-left transition-colors",
                      activeLocId === loc.id
                        ? "bg-[hsl(var(--adm-primary)/0.1)] text-[hsl(var(--adm-primary))] font-semibold border-l-2 border-[hsl(var(--adm-primary))]"
                        : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-accent))]",
                    ].join(" ")}
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{loc.label || "Unnamed"}</span>
                  </button>
                ))}
              </div>
            </AdminCard>
          </div>

          {/* Location form */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeLoc && (
                <motion.div
                  key={activeLoc.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="space-y-4"
                >
                  <AdminCard>
                    <AdminCardHeader>
                      <AdminCardDescription>Location Details</AdminCardDescription>
                      <AdminCardTitle className="mt-2">{activeLoc.label || "Unnamed Location"}</AdminCardTitle>
                    </AdminCardHeader>
                    <AdminCardContent>
                      <div className="space-y-5">

                        {/* Label */}
                        <div>
                          <AdminInput
                            label="City Label"
                            value={activeLoc.label}
                            onChange={(e) => updateLocation(activeLoc.id, "label", e.target.value)}
                            placeholder="Chennai"
                          />
                          <FieldHint>Shown as the tab name on the Contact page (e.g., "Chennai", "Madurai").</FieldHint>
                        </div>

                        {/* Contact info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Phone className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Phone Number</label>
                            </div>
                            <AdminInput
                              value={activeLoc.phone}
                              onChange={(e) => updateLocation(activeLoc.id, "phone", e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                            />
                            <FieldHint>Include country code (+91). Shown as a tappable link on mobile.</FieldHint>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Mail className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Email Address</label>
                            </div>
                            <AdminInput
                              value={activeLoc.email}
                              onChange={(e) => updateLocation(activeLoc.id, "email", e.target.value)}
                              placeholder="chennai@kattilhotels.com"
                            />
                            <FieldHint>Visitors can click to open their mail app.</FieldHint>
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                            <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Full Address</label>
                          </div>
                          <AdminTextarea
                            value={activeLoc.address}
                            onChange={(e) => updateLocation(activeLoc.id, "address", e.target.value)}
                            placeholder="274, 1st Main Road, Secretariat Colony, Thoraipakkam, Chennai, Tamil Nadu 600097"
                          />
                          <FieldHint>Include street, area, city, state, and PIN code.</FieldHint>
                        </div>

                        {/* Map embed */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Map className="h-3.5 w-3.5 text-[hsl(var(--adm-primary))]" />
                              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Google Maps Embed URL</label>
                            </div>
                            {activeLoc.mapSrc && (
                              <button
                                type="button"
                                onClick={() => setMapPreviewId(mapPreviewId === activeLoc.id ? null : activeLoc.id)}
                                className="text-xs font-medium text-[hsl(var(--adm-primary))] hover:underline"
                              >
                                {mapPreviewId === activeLoc.id ? "Hide preview" : "Preview map"}
                              </button>
                            )}
                          </div>
                          <AdminInput
                            value={activeLoc.mapSrc}
                            onChange={(e) => updateLocation(activeLoc.id, "mapSrc", e.target.value)}
                            placeholder="https://maps.google.com/maps?q=...&output=embed"
                          />
                          <FieldHint>
                            Google Maps → Share → Embed a map → copy the{" "}
                            <code className="rounded bg-[hsl(var(--adm-accent))] px-1 py-0.5 text-[10px]">src</code> URL.
                          </FieldHint>

                          <AnimatePresence>
                            {mapPreviewId === activeLoc.id && activeLoc.mapSrc && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="mt-3 overflow-hidden"
                              >
                                <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--adm-border))]" style={{ height: 280 }}>
                                  <iframe
                                    src={activeLoc.mapSrc}
                                    width="100%"
                                    height="280"
                                    style={{ border: 0, display: "block" }}
                                    allowFullScreen
                                    loading="lazy"
                                    title={`${activeLoc.label} map preview`}
                                  />
                                </div>
                                <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">Live preview of the embedded map.</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </AdminCardContent>
                  </AdminCard>

                  {/* Completeness check */}
                  {(() => {
                    const missing: string[] = [];
                    if (!activeLoc.address) missing.push("Address");
                    if (!activeLoc.phone) missing.push("Phone number");
                    if (!activeLoc.email) missing.push("Email");
                    if (!activeLoc.mapSrc) missing.push("Map embed URL");
                    if (missing.length === 0) return null;
                    return (
                      <div className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--adm-warning)/0.3)] bg-[hsl(var(--adm-warning)/0.08)] p-4">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(var(--adm-warning)/0.8)]" />
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--adm-warning)/0.8)]">Incomplete location</p>
                          <p className="text-xs text-[hsl(var(--adm-warning)/0.8)] mt-0.5 opacity-80">
                            Still needed: {missing.join(", ")}.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

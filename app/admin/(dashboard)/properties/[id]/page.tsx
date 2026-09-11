"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, Building2, Plus, X, Check, BedDouble, MapPin, ExternalLink, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";

const EASE = [0.22, 1, 0.36, 1] as const;

interface City {
  _id: string;
  name: string;
  slug: string;
}

interface RoomItem {
  _id: string;
  name: string;
  slug: string;
  badge?: string;
  category?: string;
  images: string[];
  status: string;
}

interface PropertyForm {
  name: string;
  slug: string;
  city: string;
  badge: string;
  category: "hotel" | "homestay" | "resort" | "hostel" | "deluxe" | "suite" | "standard";
  tagline: string;
  description: string;
  images: string[];
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  mapSrc: string;
  amenities: string[];
  directions: {
    railway: string;
    busStand: string;
    landmark: string;
    byCar: string;
    important: string;
    helpText: string;
  };
  hotelCode: string;
  bookingEngineUrl: string;
  featured: boolean;
  status: "active" | "inactive" | "maintenance";
}

const EMPTY: PropertyForm = {
  name: "",
  slug: "",
  city: "",
  badge: "Private room",
  category: "homestay",
  tagline: "",
  description: "",
  images: [],
  address: "",
  phone: "",
  email: "",
  whatsapp: "",
  mapSrc: "",
  amenities: ["Free Wifi", "Restaurant", "Air Conditioning", "24/7 Butler"],
  directions: {
    railway: "",
    busStand: "",
    landmark: "",
    byCar: "",
    important: "",
    helpText: "",
  },
  hotelCode: "",
  bookingEngineUrl: "",
  featured: false,
  status: "active",
};

const BADGE_PRESETS = [
  "Private room",
  "Homestay",
  "Hotel",
  "Boutique Stay",
  "Executive Stay",
  "Heritage Stay",
  "Resort & Spa",
  "Hostel & Co-living",
];

const POPULAR_AMENITIES = [
  "Free Wifi",
  "Restaurant",
  "Air Conditioning",
  "Swimming Pool",
  "Wellness Spa",
  "24/7 Butler",
  "Room Service",
  "Free Parking",
  "Meeting Lounge",
  "Locker",
  "Gym",
  "Breakfast Included",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--adm-muted-foreground))] border-b border-[hsl(var(--adm-border)/0.5)] pb-3 mb-5">
      {children}
    </h2>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs text-[hsl(var(--adm-muted-foreground))] leading-relaxed">
      {children}
    </p>
  );
}

function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--adm-foreground))]">
        {label}
        {required && <span className="text-[hsl(var(--adm-destructive))]">*</span>}
      </label>
      {children}
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

export default function PropertyFormPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [form, setForm] = useState<PropertyForm>(EMPTY);
  const [cities, setCities] = useState<City[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  useEffect(() => {
    fetch("/api/admin/cities?limit=100")
      .then((r) => r.json())
      .then((r) => r.success && setCities(r.data.cities));
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/properties/${id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          const d = r.data;
          setForm({
            name: d.name ?? "",
            slug: d.slug ?? "",
            city: d.city?._id ?? d.city ?? "",
            badge: d.badge ?? "Private room",
            category: d.category ?? "homestay",
            tagline: d.tagline ?? "",
            description: d.description ?? "",
            images: Array.isArray(d.images) ? d.images : [],
            address: d.address ?? "",
            phone: d.phone ?? "",
            email: d.email ?? "",
            whatsapp: d.whatsapp ?? "",
            mapSrc: d.mapSrc ?? "",
            amenities: Array.isArray(d.amenities) && d.amenities.length > 0 ? d.amenities : ["Free Wifi", "Restaurant"],
            directions: {
              railway: d.directions?.railway ?? "",
              busStand: d.directions?.busStand ?? "",
              landmark: d.directions?.landmark ?? "",
              byCar: d.directions?.byCar ?? "",
              important: d.directions?.important ?? "",
              helpText: d.directions?.helpText ?? "",
            },
            hotelCode: d.hotelCode ?? "",
            bookingEngineUrl: d.bookingEngineUrl ?? "",
            featured: Boolean(d.featured),
            status: d.status ?? "active",
          });
          if (Array.isArray(d.rooms)) {
            setRooms(d.rooms);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !form.amenities.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
      setCustomAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const addGalleryImage = (url: string) => {
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Property name is required.");
      return;
    }
    if (!form.city) {
      setError("Please select a destination / city.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        cityId: form.city,
        badge: form.badge.trim() || "Private room",
        category: form.category,
        tagline: form.tagline.trim() || undefined,
        description: form.description.trim() || undefined,
        images: form.images,
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        mapSrc: form.mapSrc.trim() || undefined,
        amenities: form.amenities,
        directions: form.directions,
        hotelCode: form.hotelCode.trim() || undefined,
        bookingEngineUrl: form.bookingEngineUrl.trim() || undefined,
        featured: form.featured,
        status: form.status,
      };

      const url = isNew ? "/api/admin/properties" : `/api/admin/properties/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

      if (res.success) {
        router.push("/admin/properties");
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
    <div className="max-w-4xl mx-auto py-2 px-1">
      {/* Back nav */}
      <button
        onClick={() => router.push("/admin/properties")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors mb-5 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Properties
      </button>

      {/* Page Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="rounded-2xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[hsl(var(--adm-border)/0.5)]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-[hsl(var(--adm-primary)/0.1)]">
              <Building2 className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--adm-foreground))]">
                {isNew ? "Add New Property" : "Edit Property"}
              </h1>
              <p className="text-sm text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                {isNew
                  ? "Create a property located under a destination (e.g. Chennai, Madurai, Coimbatore)."
                  : "Update property details, address, contact info, amenities, and photos."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-6 py-6 space-y-8">
          {/* Section 1: Basic Info */}
          <section>
            <SectionTitle>Property Overview</SectionTitle>
            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                label="Property Name"
                required
                hint="e.g. 'Kattil Executive Stay', 'Kattil The Sparrow', 'Kattil OMR'"
              >
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Kattil Executive Stay"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField
                label="Destination / City"
                required
                hint="Which destination does this property belong to?"
              >
                <select
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                >
                  <option value="">Select a destination…</option>
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Stay Type / Badge */}
            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">
                Property Type / Badge
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {BADGE_PRESETS.map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, badge }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.badge === badge
                        ? "bg-[hsl(var(--adm-primary))] text-white border-[hsl(var(--adm-primary))]"
                        : "bg-[hsl(var(--adm-background))] border-[hsl(var(--adm-border))] text-[hsl(var(--adm-foreground))] hover:border-[hsl(var(--adm-primary)/0.5)]"
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                placeholder="Or type custom badge, e.g. Boutique Stay, Homestay"
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
              />
              <FieldHint>
                Displayed above the property name on destination cards (e.g. <em>Homestay</em>, <em>Executive Stay</em>).
              </FieldHint>
            </div>

            {/* Description & Tagline */}
            <div className="mt-5 space-y-4">
              <FormField label="Tagline / Short Intro" hint="e.g. 'Your Peaceful Sanctuary in Chennai'">
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="e.g. Your Peaceful Sanctuary in Chennai"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField label="Property Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the property, atmosphere, and standout features…"
                  className="flex w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] p-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>
            </div>
          </section>

          {/* Section 2: Location & Contact */}
          <section>
            <SectionTitle>Location & Contact</SectionTitle>
            <div className="space-y-4">
              <FormField label="Full Address" hint="e.g. 274, 1st Main Road, Secretariat Colony, Thoraipakkam, Chennai">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Property street address, area, city, pin code"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField label="Phone Number">
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 63851 97921"
                    className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                </FormField>
                <FormField label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="contact@kattil.in"
                    className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                </FormField>
                <FormField label="WhatsApp Number">
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="+916385197921"
                    className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                </FormField>
              </div>

              <FormField label="Google Maps Embed URL / Link" hint="Paste Google Maps embed or search URL for the interactive map">
                <input
                  type="text"
                  value={form.mapSrc}
                  onChange={(e) => setForm((f) => ({ ...f, mapSrc: e.target.value }))}
                  placeholder="https://maps.google.com/maps?q=..."
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>
            </div>
          </section>

          {/* Section: Booking Engine API & Let's Book Link */}
          <section>
            <SectionTitle>Booking API & Let's Book Links</SectionTitle>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Hotel PMS / API Code"
                  hint="The unique hotel value used by eZee / IPMS247 booking bar (e.g. kattilchennai, kattil, kattilcoimbatore)"
                >
                  <input
                    type="text"
                    value={form.hotelCode}
                    onChange={(e) => setForm((f) => ({ ...f, hotelCode: e.target.value }))}
                    placeholder="e.g. kattilchennai"
                    className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                </FormField>

                <FormField
                  label="Custom Let's Book URL (Optional Override)"
                  hint="Full direct Let's Book / Booking Engine URL for this property if different from base URL"
                >
                  <input
                    type="text"
                    value={form.bookingEngineUrl}
                    onChange={(e) => setForm((f) => ({ ...f, bookingEngineUrl: e.target.value }))}
                    placeholder="https://live.ipms247.com/booking/book-rooms-..."
                    className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                  />
                </FormField>
              </div>
            </div>
          </section>

          {/* Section 3: Photos & Gallery */}
          <section>
            <SectionTitle>Property Photos</SectionTitle>
            <div className="space-y-4">
              <AdminDropzone
                label="Primary Cover Photo"
                hint="Main hero photo shown on destination cards and property banner (1200×800px recommended)."
                value={form.images[0] ?? ""}
                onChange={(url) =>
                  setForm((f) => ({
                    ...f,
                    images: url ? [url, ...f.images.slice(1)] : f.images.slice(1),
                  }))
                }
              />

              {/* Gallery List */}
              <div className="pt-2">
                <label className="text-sm font-medium text-[hsl(var(--adm-foreground))] block mb-2">
                  Additional Gallery Photos
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[hsl(var(--adm-border))] h-24 bg-[hsl(var(--adm-muted))]">
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx === 0 && (
                          <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-bold">Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1 rounded bg-[hsl(var(--adm-destructive))] text-white hover:opacity-90"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <AdminDropzone
                  label="Add Gallery Photo"
                  hint="Upload additional photos of amenities, suites, lounges, and surrounds."
                  value=""
                  onChange={addGalleryImage}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section>
            <SectionTitle>Amenities & Facilities</SectionTitle>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {POPULAR_AMENITIES.map((amenity) => {
                  const selected = form.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-[hsl(var(--adm-primary)/0.15)] text-[hsl(var(--adm-primary))] border-[hsl(var(--adm-primary)/0.4)]"
                          : "bg-[hsl(var(--adm-background))] border-[hsl(var(--adm-border))] text-[hsl(var(--adm-muted-foreground))] hover:border-[hsl(var(--adm-primary)/0.4)]"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {amenity}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                  placeholder="Add custom amenity (press Enter)..."
                  className="flex h-9 flex-1 rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-xs text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  className="px-3.5 py-1.5 rounded-lg bg-[hsl(var(--adm-primary))] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {form.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[hsl(var(--adm-accent))] text-xs font-medium text-[hsl(var(--adm-foreground))]"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="hover:text-[hsl(var(--adm-destructive))] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Directions / How to Reach */}
          <section>
            <SectionTitle>Directions & How to Reach</SectionTitle>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Railway Station Distance" hint="e.g. 'Chennai Central — 18 km'">
                <input
                  type="text"
                  value={form.directions.railway}
                  onChange={(e) => setForm((f) => ({ ...f, directions: { ...f.directions, railway: e.target.value } }))}
                  placeholder="e.g. Central Station — 18 km"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField label="Bus Stand Distance" hint="e.g. 'Thoraipakkam Bus Stop — 500m'">
                <input
                  type="text"
                  value={form.directions.busStand}
                  onChange={(e) => setForm((f) => ({ ...f, directions: { ...f.directions, busStand: e.target.value } }))}
                  placeholder="e.g. Thoraipakkam Stop — 500 meters"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField label="Nearby Landmark" hint="e.g. 'Opposite Secretariat Colony Park'">
                <input
                  type="text"
                  value={form.directions.landmark}
                  onChange={(e) => setForm((f) => ({ ...f, directions: { ...f.directions, landmark: e.target.value } }))}
                  placeholder="e.g. Opposite Secretariat Park"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField label="By Car Directions" hint="e.g. 'Direct access via OMR expressway'">
                <input
                  type="text"
                  value={form.directions.byCar}
                  onChange={(e) => setForm((f) => ({ ...f, directions: { ...f.directions, byCar: e.target.value } }))}
                  placeholder="e.g. Direct access via OMR"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>
            </div>
          </section>

          {/* Section 6: Booking API & Let's Book Links */}
          <section className="space-y-4">
            <SectionTitle>Booking API & Let's Book Links</SectionTitle>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Hotel Code / Booking Slug"
                hint="e.g. 'kattilchennai', 'kattilcoimbatore', or 'kattil' used by eZee / IPMS247 booking engine."
              >
                <input
                  type="text"
                  value={form.hotelCode}
                  onChange={(e) => setForm((f) => ({ ...f, hotelCode: e.target.value }))}
                  placeholder="e.g. kattilchennai"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField
                label="Direct Property Let's Book URL"
                hint="Full direct URL to this property's booking engine page (overrides global base URL if set)."
              >
                <input
                  type="url"
                  value={form.bookingEngineUrl}
                  onChange={(e) => setForm((f) => ({ ...f, bookingEngineUrl: e.target.value }))}
                  placeholder="https://live.ipms247.com/booking/book-rooms-kattilchennai"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>
            </div>
          </section>

          {/* Section 7: Rooms in this Property (if editing) */}
          {!isNew && (
            <section>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[hsl(var(--adm-border)/0.5)]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--adm-muted-foreground))]">
                  Rooms in this Property ({rooms.length})
                </h2>
                <Link
                  href={`/admin/rooms/new?property=${id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--adm-primary))] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Room to this Property
                </Link>
              </div>

              {rooms.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-[hsl(var(--adm-muted)/0.5)] border border-[hsl(var(--adm-border)/0.5)]">
                  <BedDouble className="mx-auto h-8 w-8 text-[hsl(var(--adm-muted-foreground))] mb-2 opacity-50" />
                  <p className="text-sm font-medium text-[hsl(var(--adm-foreground))]">No rooms assigned yet</p>
                  <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                    Add rooms like Dormitory, AC Double Room, or Suites for this property.
                  </p>
                  <Link
                    href={`/admin/rooms/new?property=${id}`}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--adm-primary))] text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Room
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-background))] hover:border-[hsl(var(--adm-primary)/0.5)] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[hsl(var(--adm-muted))] overflow-hidden shrink-0">
                        {room.images[0] ? (
                          <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <BedDouble className="w-full h-full p-3 text-[hsl(var(--adm-muted-foreground))]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[hsl(var(--adm-foreground))] truncate">{room.name}</p>
                        <p className="text-[11px] text-[hsl(var(--adm-muted-foreground))]">{room.badge || "Private room"}</p>
                      </div>
                      <Link
                        href={`/admin/rooms/${room._id}`}
                        className="p-1.5 text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))]"
                      >
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Section 7: Status */}
          <section>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    status: f.status === "active" ? "inactive" : "active",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.status === "active" ? "bg-[hsl(var(--adm-primary))]" : "bg-[hsl(var(--adm-muted))]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    form.status === "active" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-[hsl(var(--adm-foreground))]">
                {form.status === "active"
                  ? "Active (Visible on destination page)"
                  : "Inactive (Hidden)"}
              </span>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-[hsl(var(--adm-destructive)/0.3)] bg-[hsl(var(--adm-destructive)/0.08)] px-4 py-3">
              <p className="text-sm text-[hsl(var(--adm-destructive))]">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--adm-border)/0.4)]">
            <button
              type="button"
              onClick={() => router.push("/admin/properties")}
              className="h-10 rounded-lg border border-[hsl(var(--adm-border))] bg-transparent px-5 text-sm font-medium text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-accent)/0.4)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "hsl(var(--adm-primary))" }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {isNew ? "Create Property" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, Save, BedDouble, Plus, X, Check, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import AdminDropzone from "@/components/admin/ui/AdminDropzone";

const EASE = [0.22, 1, 0.36, 1] as const;

interface PropertySummary {
  _id: string;
  name: string;
  slug: string;
  city?: { _id: string; name: string; slug: string } | string;
}

interface RoomForm {
  name: string;
  property: string;
  badge: string;
  category: "deluxe" | "suite" | "standard" | "premium" | "dormitory";
  price: string;
  occupancy: string;
  amenities: string[];
  images: string[];
  description: string;
  status: "active" | "inactive" | "maintenance";
  link: string;
  roomCode: string;
}

const EMPTY: RoomForm = {
  name: "",
  property: "",
  badge: "Private room",
  category: "deluxe",
  price: "1800",
  occupancy: "2 Guests",
  amenities: ["Free Wifi", "Restaurant", "Air Conditioning"],
  images: [],
  description: "",
  status: "active",
  link: "",
  roomCode: "",
};

const BADGE_PRESETS = [
  "Private room",
  "Dormitory",
  "Deluxe Suite",
  "Standard Room",
  "Luxury Suite",
  "Shared Dorm",
  "Executive Room",
];

const POPULAR_AMENITIES = [
  "Free Wifi",
  "Restaurant",
  "Air Conditioning",
  "Private Bathroom",
  "Lockers",
  "Study Desk",
  "Room Service",
  "Swimming Pool",
  "Balcony",
  "Smart TV",
  "Individual Pod Cooling",
  "Ceiling Fan",
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

function RoomFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const propertyFromQuery = searchParams.get("property") || "";

  const [form, setForm] = useState<RoomForm>({
    ...EMPTY,
    property: propertyFromQuery,
  });
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  useEffect(() => {
    fetch("/api/admin/properties?limit=100")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setProperties(r.data.properties);
          if (isNew && propertyFromQuery && !form.property) {
            setForm((f) => ({ ...f, property: propertyFromQuery }));
          }
        }
      });
  }, [isNew, propertyFromQuery]);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/rooms/${id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          const d = r.data;
          setForm({
            name: d.name ?? "",
            property: d.property?._id ?? d.property ?? "",
            badge: d.badge ?? "Private room",
            category: d.category ?? "deluxe",
            price: d.pricing?.[0]?.value?.replace(/[^0-9.]/g, "") ?? "",
            occupancy: d.occupancy ?? "2 Guests",
            amenities: Array.isArray(d.amenities) && d.amenities.length > 0 ? d.amenities : ["Free Wifi", "Restaurant"],
            images: Array.isArray(d.images) ? d.images : [],
            description: d.description ?? "",
            status: d.status ?? "active",
            link: d.link ?? d.cta?.url ?? "",
            roomCode: d.roomCode ?? "",
          });
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
      setError("Room name is required.");
      return;
    }
    if (!form.property) {
      setError("Please select a Property for this room.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        propertyId: form.property,
        badge: form.badge.trim() || "Private room",
        category: form.category,
        price: form.price ? Number(form.price) : undefined,
        occupancy: form.occupancy.trim() || undefined,
        amenities: form.amenities,
        images: form.images,
        description: form.description.trim() || undefined,
        status: form.status,
        link: form.link.trim() || undefined,
        roomCode: form.roomCode.trim() || undefined,
      };
      const url = isNew ? "/api/admin/rooms" : `/api/admin/rooms/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

      if (res.success) {
        router.push(form.property ? `/admin/rooms?property=${form.property}` : "/admin/rooms");
      } else {
        setError(res.error ?? res.message ?? "Failed to save room. Please try again.");
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
    <div className="max-w-3xl mx-auto py-2 px-1">
      {/* Back nav */}
      <button
        onClick={() => router.push("/admin/rooms")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors mb-5 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Rooms
      </button>

      {/* Page card */}
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
              <BedDouble className="h-5 w-5 text-[hsl(var(--adm-primary))]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--adm-foreground))]">
                {isNew ? "Add New Room" : "Edit Room"}
              </h1>
              <p className="text-sm text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                {isNew
                  ? "Create a room type (e.g. 6-Bed Dorm, AC Double Room) under a specific property."
                  : "Update room details, pricing, photos, and direct booking URL."}
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="px-6 py-6 space-y-8">
          {/* Section 1: Property & Room Name */}
          <section>
            <SectionTitle>Room Details</SectionTitle>
            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                label="Select Property"
                required
                hint="Which property does this room belong to?"
              >
                <select
                  value={form.property}
                  onChange={(e) => setForm((f) => ({ ...f, property: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors"
                >
                  <option value="">Select a property…</option>
                  {properties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Room Name"
                required
                hint="e.g. '6 Bed Mixed Dormitory', 'AC Double Room', 'Deluxe Suite'"
              >
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. AC Double Room"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors"
                />
              </FormField>
            </div>

            {/* Price & Occupancy */}
            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <FormField label="Price per Night (₹)" hint="e.g. 1800, 682.50">
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="1800"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>

              <FormField label="Capacity / Occupancy" hint="e.g. '2 Guests', '6 Beds', '3 Guests'">
                <input
                  type="text"
                  value={form.occupancy}
                  onChange={(e) => setForm((f) => ({ ...f, occupancy: e.target.value }))}
                  placeholder="2 Guests"
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>
            </div>

            {/* Room Type / Badge */}
            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">
                Room Badge / Type
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
                placeholder="Or type custom, e.g. Private room, Dormitory"
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
              />
            </div>

            {/* Room Description */}
            <div className="mt-5">
              <FormField label="Room Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Spacious room with modern amenities, pod cooling, and quiet atmosphere…"
                  className="flex w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] p-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
                />
              </FormField>
            </div>
          </section>

          {/* Section 2: Amenities */}
          <section>
            <SectionTitle>Room Amenities</SectionTitle>
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

          {/* Section 3: Room Photos */}
          <section>
            <SectionTitle>Room Photos</SectionTitle>
            <div className="space-y-4">
              <AdminDropzone
                label="Main Room Image"
                hint="Upload the main bedroom/bed photo for this room type."
                value={form.images[0] ?? ""}
                onChange={(url) =>
                  setForm((f) => ({
                    ...f,
                    images: url ? [url, ...f.images.slice(1)] : f.images.slice(1),
                  }))
                }
              />

              {form.images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[hsl(var(--adm-border))] h-20 bg-[hsl(var(--adm-muted))]">
                      <img src={img} alt={`Room ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded bg-[hsl(var(--adm-destructive))] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <AdminDropzone
                label="Add Additional Room Photo"
                hint="Upload bathroom, workspace, or interior angle photos."
                value=""
                onChange={addGalleryImage}
              />
            </div>
          </section>

          {/* Section 4: Booking API & Let's Book Links */}
          <section className="space-y-4">
            <SectionTitle>Booking API & Let's Book Links</SectionTitle>
            
            <FormField
              label="Let's Book / Direct Room Booking URL"
              hint="Direct URL for this specific room on eZee / PMS booking engine. When guests click 'Book Now' on this room card, they will be navigated to this link."
            >
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://live.ipms247.com/booking/book-rooms-kattilchennai?roomtypeunkid=..."
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors"
              />
            </FormField>

            <FormField
              label="Room Type ID / Code (API)"
              hint="The room identifier used by booking engines or eZee (e.g. roomtypeunkid code like '3921829' or 'DORM_01')."
            >
              <input
                type="text"
                value={form.roomCode}
                onChange={(e) => setForm((f) => ({ ...f, roomCode: e.target.value }))}
                placeholder="e.g. 3921829 or DELUXE_ROOM"
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors"
              />
            </FormField>
          </section>

          {/* Section 5: Status */}
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
                  form.status === "active"
                    ? "bg-[hsl(var(--adm-primary))]"
                    : "bg-[hsl(var(--adm-muted))]"
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
                  ? "Active (Visible under property room selection)"
                  : "Inactive (Hidden)"}
              </span>
            </div>
          </section>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-[hsl(var(--adm-destructive)/0.3)] bg-[hsl(var(--adm-destructive)/0.08)] px-4 py-3">
              <p className="text-sm text-[hsl(var(--adm-destructive))]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--adm-border)/0.4)]">
            <button
              type="button"
              onClick={() => router.push("/admin/rooms")}
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
                  <Save className="h-4 w-4" /> {isNew ? "Create Room" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RoomFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[hsl(var(--adm-muted-foreground))]">Loading room form…</div>}>
      <RoomFormContent />
    </Suspense>
  );
}

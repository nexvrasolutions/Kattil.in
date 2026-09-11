"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Globe,
  ExternalLink,
  Save,
  Check,
  Building2,
  BedDouble,
  Link as LinkIcon,
  Shield,
  Code,
  Sparkles,
  Copy,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/admin/ui/PageHeader";
import {
  AdminCard,
  AdminCardHeader,
  AdminCardContent,
  AdminCardTitle,
  AdminCardDescription,
} from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";

const EASE = [0.22, 1, 0.36, 1] as const;

interface BookingEngineSettings {
  provider: string;
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  defaultHotelCode: string;
  globalBookingUrl: string;
}

interface PropertyItem {
  _id: string;
  name: string;
  slug: string;
  city?: { _id: string; name: string; slug: string };
  hotelCode?: string;
  bookingEngineUrl?: string;
  status: string;
}

interface RoomItem {
  _id: string;
  name: string;
  slug: string;
  property?: { _id: string; name: string; slug: string };
  city?: { _id: string; name: string; slug: string };
  link?: string;
  roomCode?: string;
  category: string;
  price?: string;
  status: string;
}

export default function BookingApiAdminPage() {
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingPropertyId, setSavingPropertyId] = useState<string | null>(null);
  const [savingRoomId, setSavingRoomId] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"global" | "properties" | "rooms" | "docs">("global");

  const [settings, setSettings] = useState<BookingEngineSettings>({
    provider: "eZee / IPMS247",
    baseUrl: "https://live.ipms247.com/booking/book-rooms-",
    apiKey: "",
    apiSecret: "",
    defaultHotelCode: "kattil",
    globalBookingUrl: "https://live.ipms247.com/booking/book-rooms-kattil",
  });

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);

  // Fetch all Booking API data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/booking-api");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.bookingEngine) {
          setSettings((prev) => ({ ...prev, ...json.data.bookingEngine }));
        }
        setProperties(json.data.properties || []);
        setRooms(json.data.rooms || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load booking API configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Global Engine Settings
  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingGlobal(true);
      const res = await fetch("/api/admin/booking-api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingEngine: settings }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Global booking engine settings saved successfully");
      } else {
        toast.error(json.error || "Failed to save settings");
      }
    } catch (err) {
      toast.error("Error saving global settings");
    } finally {
      setSavingGlobal(false);
    }
  };

  // Save specific property hotelCode & bookingEngineUrl
  const handleSaveProperty = async (prop: PropertyItem) => {
    try {
      setSavingPropertyId(prop._id);
      const res = await fetch("/api/admin/booking-api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: prop._id,
          hotelCode: prop.hotelCode || "",
          bookingEngineUrl: prop.bookingEngineUrl || "",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Booking details for "${prop.name}" updated`);
      } else {
        toast.error(json.error || "Failed to update property");
      }
    } catch {
      toast.error("Failed to save property booking info");
    } finally {
      setSavingPropertyId(null);
    }
  };

  // Save specific room link & roomCode
  const handleSaveRoom = async (room: RoomItem) => {
    try {
      setSavingRoomId(room._id);
      const res = await fetch("/api/admin/booking-api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room._id,
          link: room.link || "",
          roomCode: room.roomCode || "",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Let's Book link for "${room.name}" updated`);
      } else {
        toast.error(json.error || "Failed to update room");
      }
    } catch {
      toast.error("Failed to save room booking link");
    } finally {
      setSavingRoomId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    toast.success("Endpoint URL copied to clipboard");
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getEffectivePropertyUrl = (prop: PropertyItem) => {
    if (prop.bookingEngineUrl && prop.bookingEngineUrl.startsWith("http")) {
      return prop.bookingEngineUrl;
    }
    const code = prop.hotelCode || `kattil${prop.slug || ""}`;
    const base = settings.baseUrl || "https://live.ipms247.com/booking/book-rooms-";
    return `${base}${code}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--adm-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <PageHeader
        title="Booking API & Let's Book Links"
        subtitle="Configure your Booking Engine API integrations, PMS hotel codes, and Let's Book URLs across all properties and rooms."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--adm-border)/0.6)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "global"
              ? "bg-[hsl(var(--adm-primary))] text-white shadow-xs"
              : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-muted)/0.5)]"
          }`}
        >
          <Key className="w-4 h-4" />
          Global Engine & API
        </button>
        <button
          onClick={() => setActiveTab("properties")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "properties"
              ? "bg-[hsl(var(--adm-primary))] text-white shadow-xs"
              : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-muted)/0.5)]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Properties Let's Book Links ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "rooms"
              ? "bg-[hsl(var(--adm-primary))] text-white shadow-xs"
              : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-muted)/0.5)]"
          }`}
        >
          <BedDouble className="w-4 h-4" />
          Room Direct Links ({rooms.length})
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "docs"
              ? "bg-[hsl(var(--adm-primary))] text-white shadow-xs"
              : "text-[hsl(var(--adm-muted-foreground))] hover:bg-[hsl(var(--adm-muted)/0.5)]"
          }`}
        >
          <Code className="w-4 h-4" />
          API Reference
        </button>
      </div>

      {/* ── TAB 1: Global Engine & API Settings ── */}
      {activeTab === "global" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="space-y-6"
        >
          <form onSubmit={handleSaveGlobal} className="space-y-6">
            <AdminCard>
              <AdminCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--adm-primary)/0.1)] flex items-center justify-center text-[hsl(var(--adm-primary))]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <AdminCardTitle>Booking Engine Provider Configuration</AdminCardTitle>
                    <AdminCardDescription>
                      Default booking engine provider and base URL for all dynamic booking bars.
                    </AdminCardDescription>
                  </div>
                </div>
              </AdminCardHeader>
              <AdminCardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--adm-foreground))] mb-1.5">
                      Booking Engine Provider
                    </label>
                    <select
                      value={settings.provider}
                      onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] text-sm font-medium text-[hsl(var(--adm-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--adm-primary))]"
                    >
                      <option value="eZee / IPMS247">eZee / IPMS247</option>
                      <option value="LetsBook">LetsBook</option>
                      <option value="STAAH">STAAH</option>
                      <option value="Cloudbeds">Cloudbeds</option>
                      <option value="Custom">Custom Booking Engine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--adm-foreground))] mb-1.5">
                      Default Fallback Hotel Code
                    </label>
                    <AdminInput
                      value={settings.defaultHotelCode}
                      onChange={(e) => setSettings({ ...settings, defaultHotelCode: e.target.value })}
                      placeholder="e.g. kattil"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--adm-foreground))] mb-1.5">
                    Base Booking Engine URL Prefix
                  </label>
                  <AdminInput
                    value={settings.baseUrl}
                    onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                    placeholder="https://live.ipms247.com/booking/book-rooms-"
                  />
                  <p className="text-[11.5px] text-[hsl(var(--adm-muted-foreground))] mt-1">
                    The property hotel code is appended to this URL when a guest clicks "Check Availability" (e.g. <code className="bg-[hsl(var(--adm-muted)/0.5)] px-1 py-0.5 rounded">https://live.ipms247.com/booking/book-rooms-kattilchennai</code>).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--adm-foreground))] mb-1.5">
                    Global Let's Book Link (Header "Book Now" Button)
                  </label>
                  <div className="flex gap-2">
                    <AdminInput
                      value={settings.globalBookingUrl}
                      onChange={(e) => setSettings({ ...settings, globalBookingUrl: e.target.value })}
                      placeholder="https://live.ipms247.com/booking/book-rooms-kattil"
                    />
                    {settings.globalBookingUrl && (
                      <a
                        href={settings.globalBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 h-10 rounded-lg border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.5)] hover:bg-[hsl(var(--adm-muted))] flex items-center justify-center text-[hsl(var(--adm-foreground))] transition-colors shrink-0"
                        title="Test global link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </AdminCardContent>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--adm-primary)/0.1)] flex items-center justify-center text-[hsl(var(--adm-primary))]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <AdminCardTitle>Booking API Credentials (Optional)</AdminCardTitle>
                    <AdminCardDescription>
                      For automated availability queries, channel manager sync, or custom webhook integrations.
                    </AdminCardDescription>
                  </div>
                </div>
              </AdminCardHeader>
              <AdminCardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--adm-foreground))] mb-1.5">
                      API Key / Account ID
                    </label>
                    <AdminInput
                      value={settings.apiKey}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                      placeholder="Enter API Key or Channel ID"
                      type="password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--adm-foreground))] mb-1.5">
                      API Secret Token
                    </label>
                    <AdminInput
                      value={settings.apiSecret}
                      onChange={(e) => setSettings({ ...settings, apiSecret: e.target.value })}
                      placeholder="Enter API Secret Token"
                      type="password"
                    />
                  </div>
                </div>
              </AdminCardContent>
            </AdminCard>

            <div className="flex justify-end">
              <AdminButton type="submit" disabled={savingGlobal}>
                {savingGlobal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Global Configuration
                  </>
                )}
              </AdminButton>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── TAB 2: Properties Booking API & Let's Book Links ── */}
      {activeTab === "properties" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">
              Configure the <strong>Hotel PMS Code</strong> and direct <strong>Let's Book URL</strong> for each individual property.
            </p>
          </div>

          <div className="space-y-4">
            {properties.map((prop, idx) => {
              const effectiveUrl = getEffectivePropertyUrl(prop);
              const isSaving = savingPropertyId === prop._id;

              return (
                <AdminCard key={prop._id}>
                  <AdminCardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Property Info */}
                      <div className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[hsl(var(--adm-primary)/0.1)] text-[hsl(var(--adm-primary))] text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-[15px] font-bold text-[hsl(var(--adm-foreground))]">
                            {prop.name}
                          </h4>
                        </div>
                        <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mt-1 flex items-center gap-1.5">
                          <span className="font-semibold text-[hsl(var(--adm-foreground))]">
                            {prop.city?.name || "Destination"}
                          </span>
                          <span>•</span>
                          <span>Slug: /{prop.slug}</span>
                        </p>
                      </div>

                      {/* Hotel Code & Custom URL Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div>
                          <label className="block text-[11px] font-bold text-[hsl(var(--adm-muted-foreground))] uppercase mb-1">
                            Hotel API Code (e.g. kattilchennai)
                          </label>
                          <AdminInput
                            value={prop.hotelCode || ""}
                            onChange={(e) => {
                              const updated = [...properties];
                              updated[idx] = { ...prop, hotelCode: e.target.value };
                              setProperties(updated);
                            }}
                            placeholder={`e.g. kattil${prop.slug || ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[hsl(var(--adm-muted-foreground))] uppercase mb-1">
                            Custom Let's Book Link (Optional Override)
                          </label>
                          <AdminInput
                            value={prop.bookingEngineUrl || ""}
                            onChange={(e) => {
                              const updated = [...properties];
                              updated[idx] = { ...prop, bookingEngineUrl: e.target.value };
                              setProperties(updated);
                            }}
                            placeholder={effectiveUrl}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <a
                          href={effectiveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-3.5 rounded-lg border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] hover:bg-[hsl(var(--adm-muted)/0.5)] flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--adm-foreground))] transition-colors"
                          title="Open and test booking engine link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test Link</span>
                        </a>

                        <AdminButton
                          onClick={() => handleSaveProperty(prop)}
                          disabled={isSaving}
                          size="sm"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5 mr-1" /> Save
                            </>
                          )}
                        </AdminButton>
                      </div>
                    </div>
                  </AdminCardContent>
                </AdminCard>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: Rooms Direct Booking Links ── */}
      {activeTab === "rooms" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--adm-muted-foreground))]">
              Manage room-specific Let's Book URLs and Room Type IDs (e.g., for direct category booking).
            </p>
          </div>

          <div className="space-y-3">
            {rooms.map((room, idx) => {
              const isSaving = savingRoomId === room._id;
              const hasUrl = Boolean(room.link);

              return (
                <AdminCard key={room._id}>
                  <AdminCardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Room info */}
                      <div className="min-w-[200px]">
                        <h4 className="text-[14.5px] font-bold text-[hsl(var(--adm-foreground))]">
                          {room.name}
                        </h4>
                        <p className="text-xs text-[hsl(var(--adm-muted-foreground))] mt-0.5">
                          {room.property?.name ? (
                            <span className="font-medium text-[hsl(var(--adm-foreground))]">
                              {room.property.name}
                            </span>
                          ) : (
                            <span>{room.city?.name || "General"}</span>
                          )}
                          {room.price && <span> • ₹{room.price}/night</span>}
                        </p>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div>
                          <label className="block text-[11px] font-bold text-[hsl(var(--adm-muted-foreground))] uppercase mb-1">
                            Direct Let's Book URL
                          </label>
                          <AdminInput
                            value={room.link || ""}
                            onChange={(e) => {
                              const updated = [...rooms];
                              updated[idx] = { ...room, link: e.target.value };
                              setRooms(updated);
                            }}
                            placeholder="https://live.ipms247.com/booking/book-rooms-kattil..."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[hsl(var(--adm-muted-foreground))] uppercase mb-1">
                            Room Type ID / Code (Optional)
                          </label>
                          <AdminInput
                            value={room.roomCode || ""}
                            onChange={(e) => {
                              const updated = [...rooms];
                              updated[idx] = { ...room, roomCode: e.target.value };
                              setRooms(updated);
                            }}
                            placeholder="e.g. roomtypeunkid code"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        {hasUrl && (
                          <a
                            href={room.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 rounded-lg border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] hover:bg-[hsl(var(--adm-muted)/0.5)] flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--adm-foreground))] transition-colors"
                            title="Test room booking link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test</span>
                          </a>
                        )}

                        <AdminButton
                          onClick={() => handleSaveRoom(room)}
                          disabled={isSaving}
                          size="sm"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5 mr-1" /> Save
                            </>
                          )}
                        </AdminButton>
                      </div>
                    </div>
                  </AdminCardContent>
                </AdminCard>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TAB 4: API Reference Documentation ── */}
      {activeTab === "docs" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="space-y-6"
        >
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--adm-primary)/0.1)] flex items-center justify-center text-[hsl(var(--adm-primary))]">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <AdminCardTitle>Public REST API Endpoints</AdminCardTitle>
                  <AdminCardDescription>
                    These public endpoints provide live destinations, properties, rooms, and booking links for mobile apps or external integrations.
                  </AdminCardDescription>
                </div>
              </div>
            </AdminCardHeader>
            <AdminCardContent className="space-y-4">
              {[
                {
                  method: "GET",
                  path: "/api/destinations",
                  desc: "Fetch all active destinations with associated property count",
                },
                {
                  method: "GET",
                  path: "/api/properties",
                  desc: "Fetch all active properties, optionally filtered by ?city=slug",
                },
                {
                  method: "GET",
                  path: "/api/rooms",
                  desc: "Fetch all active rooms with Let's Book links, filtered by ?city=slug or ?property=slug",
                },
                {
                  method: "GET",
                  path: "/api/admin/booking-api",
                  desc: "Admin endpoint to fetch and update booking engine configuration",
                },
              ].map((api, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[hsl(var(--adm-primary)/0.12)] text-[hsl(var(--adm-primary))]">
                      {api.method}
                    </span>
                    <code className="text-xs font-mono font-bold text-[hsl(var(--adm-foreground))]">
                      {api.path}
                    </code>
                    <span className="text-xs text-[hsl(var(--adm-muted-foreground))] hidden sm:inline">
                      — {api.desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(api.path, api.path)}
                    className="h-8 px-2.5 rounded-lg border border-[hsl(var(--adm-border))] text-xs font-semibold text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] hover:bg-[hsl(var(--adm-muted)/0.5)] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedEndpoint === api.path ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </AdminCardContent>
          </AdminCard>
        </motion.div>
      )}
    </div>
  );
}

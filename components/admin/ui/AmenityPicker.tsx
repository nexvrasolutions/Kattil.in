"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AmenityIcon } from "@/components/admin/ui/AmenityIcon";
import { guessAmenityIcon } from "@/lib/amenities";

interface AmenityOption {
  _id: string;
  name: string;
  icon: string;
}

// Amenity selector for the Room / Property forms. Options come from the
// Amenity catalog managed at Admin → Amenities; the selected names are what
// gets stored on the room / property.
export default function AmenityPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [options, setOptions] = useState<AmenityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");
  const [adding, setAdding] = useState(false);

  // Resolves to the catalog, or null when it couldn't be loaded.
  const loadOptions = useCallback(async (): Promise<AmenityOption[] | null> => {
    try {
      const response = await fetch("/api/admin/amenities?limit=500");
      const r = await response.json().catch(() => null);
      return response.ok && r?.success ? r.data.amenities : null;
    } catch {
      return null;
    }
  }, []);

  const applyOptions = useCallback((result: AmenityOption[] | null) => {
    if (result) setOptions(result);
    setLoadError(!result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOptions().then(applyOptions);
  }, [loadOptions, applyOptions]);

  const retryFetch = () => {
    setLoading(true);
    setLoadError(false);
    loadOptions().then(applyOptions);
  };

  const toggleAmenity = (amenity: string) => {
    onChange(value.includes(amenity) ? value.filter((a) => a !== amenity) : [...value, amenity]);
  };

  const removeAmenity = (amenity: string) => {
    onChange(value.filter((a) => a !== amenity));
  };

  // A new amenity typed here is added to the shared catalog (not just this
  // form), so it's immediately available everywhere else too.
  const addCustomAmenity = async () => {
    const trimmed = customAmenity.trim();
    if (!trimmed || adding) return;

    const existing = options.find((o) => o.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!value.includes(existing.name)) onChange([...value, existing.name]);
      setCustomAmenity("");
      return;
    }

    setAdding(true);
    try {
      const response = await fetch("/api/admin/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          icon: guessAmenityIcon(trimmed),
          visible: true,
          order: options.length,
        }),
      });
      const r = await response.json().catch(() => null);
      if (!response.ok || !r?.success) {
        toast.error(r?.error || "Failed to add amenity.");
        return;
      }
      setOptions((prev) => [...prev, r.data]);
      if (!value.includes(r.data.name)) onChange([...value, r.data.name]);
      setCustomAmenity("");
    } catch {
      toast.error("Failed to add amenity.");
    } finally {
      setAdding(false);
    }
  };

  const catalogNames = new Set(options.map((o) => o.name));

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--adm-muted-foreground))]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading amenities…
        </div>
      ) : loadError ? (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--adm-destructive))]">
          Couldn&apos;t load amenities.
          <button
            type="button"
            onClick={retryFetch}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : options.length === 0 ? (
        <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">
          No amenities yet. Add one below or from Admin → Amenities.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((amenity) => {
            const selected = value.includes(amenity.name);
            return (
              <button
                key={amenity._id}
                type="button"
                onClick={() => toggleAmenity(amenity.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-colors ${
                  selected
                    ? "bg-[hsl(var(--adm-primary)/0.15)] text-[hsl(var(--adm-primary))] border-[hsl(var(--adm-primary)/0.4)]"
                    : "bg-[hsl(var(--adm-background))] border-[hsl(var(--adm-border))] text-[hsl(var(--adm-muted-foreground))] hover:border-[hsl(var(--adm-primary)/0.4)]"
                }`}
              >
                {selected ? <Check className="w-3.5 h-3.5" /> : <AmenityIcon name={amenity.icon} className="w-3.5 h-3.5" />}
                {amenity.name}
              </button>
            );
          })}
        </div>
      )}

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
          placeholder="Add new amenity (press Enter)..."
          className="flex h-9 flex-1 rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-xs text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
        />
        <button
          type="button"
          onClick={addCustomAmenity}
          disabled={adding}
          className="px-3.5 py-1.5 rounded-[8px] bg-[#D2E6BC] text-[#0E2E4E] text-xs font-semibold flex items-center gap-1 disabled:opacity-60"
        >
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {value.map((amenity) => {
            // Names saved before the catalog existed (or since removed from it)
            // stay visible so they can be kept or removed explicitly.
            const inCatalog = loading || loadError || catalogNames.has(amenity);
            return (
              <span
                key={amenity}
                title={inCatalog ? undefined : "Not in the Amenities list"}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[hsl(var(--adm-accent))] text-xs font-medium text-[hsl(var(--adm-foreground))] ${
                  inCatalog ? "" : "border border-dashed border-[hsl(var(--adm-destructive)/0.5)]"
                }`}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

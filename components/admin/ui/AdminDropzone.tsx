"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminDropzoneProps {
  label: string;
  hint?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;           // upload sub-folder: gallery | blog | rooms | ...
  aspectRatio?: string;
  className?: string;
  required?: boolean;
}

export default function AdminDropzone({
  label,
  hint,
  value,
  onChange,
  folder = "general",
  aspectRatio = "aspect-[4/1]",
  className = "",
  required = false,
}: AdminDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging,   setDragging]   = useState(false);
  const [urlMode,    setUrlMode]    = useState(false);
  const [urlInput,   setUrlInput]   = useState("");
  const [error,      setError]      = useState("");
  const [uploading,  setUploading]  = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setError("");
      const isImage =
        (file.type && file.type.startsWith("image/")) ||
        /\.(jpe?g|png|webp|gif|svg|avif|bmp)$/i.test(file.name);

      if (!isImage) {
        setError("Please select a valid image file (JPG, PNG, WebP, GIF, SVG, AVIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5 MB");
        return;
      }

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);

        const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();

        if (json.success) {
          onChange(json.data.path);
        } else {
          setError(json.error ?? "Upload failed. Please try again.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed. Please check your connection and try again.";
        setError(msg);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const file = e.clipboardData.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setError("Please enter a valid URL"); return; }
    onChange(trimmed);
    setUrlInput("");
    setUrlMode(false);
    setError("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">
            {label}{required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        <button
          type="button"
          onClick={() => { setUrlMode((v) => !v); setError(""); }}
          className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--adm-primary))] hover:underline"
        >
          <LinkIcon className="h-3 w-3" />
          {urlMode ? "Use file upload" : "Use URL instead"}
        </button>
      </div>

      {hint && <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">{hint}</p>}

      {/* URL input mode */}
      <AnimatePresence>
        {urlMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && applyUrl()}
                placeholder="https://example.com/image.jpg"
                className="flex h-10 flex-1 rounded-md border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))]"
              />
              <button
                type="button"
                onClick={applyUrl}
                className="h-10 rounded-md px-4 text-sm font-semibold text-[hsl(var(--adm-primary-foreground))] transition-colors"
                style={{ background: "hsl(var(--adm-primary))" }}
              >
                Set
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      {!urlMode && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => !value && !uploading && inputRef.current?.click()}
          className={[
            `relative ${aspectRatio} w-full rounded-xl border-2 transition-all overflow-hidden max-h-48`,
            dragging
              ? "border-[hsl(var(--adm-primary))] bg-[hsl(var(--adm-primary)/0.05)] scale-[1.01]"
              : value
              ? "border-[hsl(var(--adm-border))] cursor-default"
              : uploading
              ? "border-[hsl(var(--adm-primary)/0.4)] bg-[hsl(var(--adm-accent)/0.2)]"
              : "border-dashed border-[hsl(var(--adm-border))] hover:border-[hsl(var(--adm-primary)/0.6)] hover:bg-[hsl(var(--adm-accent)/0.3)] cursor-pointer",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
          />

          {uploading ? (
            /* Upload progress */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--adm-primary))]" />
              <p className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Uploading…</p>
            </div>
          ) : value ? (
            /* Preview */
            <div className="group absolute inset-0">
              <img src={value} alt={label} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/0 transition-all group-hover:bg-black/50 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-white transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  className="flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Placeholder */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
              <div className={`rounded-2xl p-4 transition-colors ${dragging ? "bg-[hsl(var(--adm-primary)/0.15)]" : "bg-[hsl(var(--adm-accent)/0.5)]"}`}>
                <ImageIcon className={`h-7 w-7 transition-colors ${dragging ? "text-[hsl(var(--adm-primary))]" : "text-[hsl(var(--adm-muted-foreground))]"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[hsl(var(--adm-foreground))]">
                  {dragging ? "Drop to upload" : "Drag & drop or click to upload"}
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--adm-muted-foreground))]">
                  JPG, PNG, WebP, GIF — max 5 MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL preview */}
      {urlMode && value && (
        <div className={`relative ${aspectRatio} w-full overflow-hidden rounded-xl border border-[hsl(var(--adm-border))] max-h-48`}>
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-[hsl(var(--adm-destructive))]">{error}</p>}
    </div>
  );
}

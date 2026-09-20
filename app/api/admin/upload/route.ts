import { NextRequest } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/x-png",
  "image/webp", "image/gif", "image/svg+xml", "image/avif", "image/bmp",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const VALID_FOLDERS = new Set([
  "gallery", "blog", "rooms", "footer", "sidebar", "social", "faq", "general",
  "destinations", "cities", "madurai-gallery", "chennai-gallery", "properties", "about",
]);

// Gallery subfolders go to /public/images/ — everything else to /public/uploads/
const GALLERY_FOLDERS = new Set(["madurai-gallery", "chennai-gallery"]);

/** POST /api/admin/upload */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "general";

    if (!file) {
      return Response.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const hasValidMime = !!(file.type && (file.type.startsWith("image/") || ALLOWED_TYPES.has(file.type)));
    const hasValidExt = /\.(jpe?g|png|webp|gif|svg|avif|bmp)$/i.test(file.name);

    if (!hasValidMime && !hasValidExt) {
      return Response.json({ success: false, error: "Invalid file type. Only images (JPG, PNG, WebP, GIF, SVG, AVIF) are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ success: false, error: "File too large. Maximum size is 5 MB." }, { status: 400 });
    }

    const safeFolder = VALID_FOLDERS.has(folder) ? folder : "general";
    const ext = extname(file.name).toLowerCase() || `.${file.type.split("/")[1] || "jpg"}`;
    const filename = `${Date.now()}_${randomUUID().split("-")[0]}${ext}`;

    // ── Vercel Blob (production / when token is configured) ────────────────────
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`${safeFolder}/${filename}`, file, { access: "public" });
        return Response.json({ success: true, data: { path: blob.url, filename: blob.pathname } });
      } catch (blobError) {
        console.warn("[POST /api/admin/upload] Vercel Blob upload failed:", blobError);
        const errMsg = blobError instanceof Error ? blobError.message : "Vercel Blob upload failed";

        // In local development, gracefully fall back to local disk so you're not blocked
        if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
          console.info("[POST /api/admin/upload] Development mode: smoothly falling back to local filesystem storage");
        } else {
          if (errMsg.includes("private store")) {
            return Response.json(
              {
                success: false,
                error: "Your Vercel Blob store is configured as 'Private'. Website images need public access. Please create/reconnect a 'Public' Blob store in your Vercel Dashboard → Storage.",
              },
              { status: 500 }
            );
          }
          return Response.json({ success: false, error: `Cloud upload failed: ${errMsg}` }, { status: 500 });
        }
      }
    } else if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return Response.json(
        {
          success: false,
          error: "Vercel Blob storage token (BLOB_READ_WRITE_TOKEN) is not configured in Vercel environment variables. Please add Vercel Blob store or use the 'Use URL instead' option.",
        },
        { status: 500 }
      );
    }

    // ── Local filesystem (development / fallback) ─────────────────────────────
    let uploadDir: string;
    let publicPath: string;

    if (GALLERY_FOLDERS.has(safeFolder)) {
      uploadDir = join(process.cwd(), "public", "images", safeFolder);
      publicPath = `/images/${safeFolder}/${filename}`;
    } else {
      uploadDir = join(process.cwd(), "public", "uploads", safeFolder);
      publicPath = `/uploads/${safeFolder}/${filename}`;
    }

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    return Response.json({ success: true, data: { path: publicPath, filename } });
  } catch (error) {
    console.error("[POST /api/admin/upload]", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

/** DELETE /api/admin/upload */
export async function DELETE(request: NextRequest) {
  try {
    const { path } = await request.json() as { path?: string };

    if (!path) {
      return Response.json({ success: false, error: "No path provided" }, { status: 400 });
    }

    // Blob URL
    if ((path.startsWith("https://") || path.startsWith("http://")) && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(path);
        return Response.json({ success: true, data: { deleted: path } });
      } catch (blobErr) {
        console.warn("[DELETE /api/admin/upload] Blob delete failed:", blobErr);
      }
    }

    // Relative path — filesystem (dev only)
    if (path.startsWith("/uploads/") || path.startsWith("/images/madurai-gallery/") || path.startsWith("/images/chennai-gallery/")) {
      if (!path.includes("..")) {
        const fullPath = join(process.cwd(), "public", path);
        if (existsSync(fullPath)) await unlink(fullPath);
      }
    }

    return Response.json({ success: true, data: { deleted: path } });
  } catch (error) {
    console.error("[DELETE /api/admin/upload]", error);
    const message = error instanceof Error ? error.message : "Delete failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}


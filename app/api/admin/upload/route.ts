import { NextRequest } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/gif", "image/svg+xml", "image/avif",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const VALID_FOLDERS = new Set([
  "gallery", "blog", "rooms", "footer", "sidebar", "social", "faq", "general",
  "destinations", "cities", "madurai-gallery", "chennai-gallery",
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
    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json({ success: false, error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ success: false, error: "File too large. Maximum size is 5 MB." }, { status: 400 });
    }

    const safeFolder = VALID_FOLDERS.has(folder) ? folder : "general";
    const ext = extname(file.name).toLowerCase() || `.${file.type.split("/")[1]}`;
    const filename = `${Date.now()}_${randomUUID().split("-")[0]}${ext}`;

    // ── Vercel Blob (production) ──────────────────────────────────────────────
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`${safeFolder}/${filename}`, file, { access: "public" });
      return Response.json({ success: true, data: { path: blob.url, filename: blob.pathname } });
    }

    // ── Local filesystem (development) ───────────────────────────────────────
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
    return Response.json({ success: false, error: "Upload failed" }, { status: 500 });
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
      await del(path);
      return Response.json({ success: true, data: { deleted: path } });
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
    return Response.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}

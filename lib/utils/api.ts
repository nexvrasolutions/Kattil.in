// Utility helpers for API routes

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Converts any caught error into a proper API response.
 * - Mongoose ValidationError  → 400 with field messages
 * - MongoDB duplicate key     → 409
 * - Everything else           → 500
 *
 * The caller is responsible for logging before invoking this.
 */
export function handleApiError(error: unknown): Response {
  if (typeof error !== "object" || error === null) {
    return apiError("An unexpected error occurred", 500);
  }

  // Use type assertion via unknown to satisfy TS strict narrowing
  const err = error as Record<string, unknown>;

  // Mongoose ValidationError — extract all field-level messages
  if (err["name"] === "ValidationError" && typeof err["errors"] === "object" && err["errors"] !== null) {
    const errors = err["errors"] as Record<string, { message: string }>;
    const msg = Object.values(errors).map((e) => e.message).join(", ");
    return apiError(msg || "Validation failed", 400);
  }

  // MongoDB duplicate key (code 11000) — identify the conflicting business
  // identifier from the index's key pattern so the message is actionable
  // instead of a generic Mongo error.
  if (err["code"] === 11000) {
    const keyPattern = (err["keyPattern"] as Record<string, unknown>) || {};
    const keys = Object.keys(keyPattern);
    const isScopedToProperty = keys.includes("property");

    if (keys.includes("hotelCode")) {
      return apiError("A property with this hotel code already exists.", 409);
    }
    if (keys.includes("roomCode")) {
      return apiError("A room with this room code already exists in this property.", 409);
    }
    if (keys.includes("name")) {
      return apiError(
        isScopedToProperty
          ? "A room with this name already exists in this property."
          : "A property with this name already exists.",
        409
      );
    }
    if (keys.includes("slug")) {
      return apiError(
        isScopedToProperty
          ? "A room with this name already exists in this property."
          : "A property with this slug already exists.",
        409
      );
    }
    return apiError("A record with this value already exists", 409);
  }

  return apiError("An unexpected server error occurred", 500);
}

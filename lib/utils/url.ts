// Single, shared HTTPS URL rule used by both the admin client forms and the
// server-side Zod/Mongoose validation, so "valid booking URL" means the same
// thing everywhere it's checked. Framework-agnostic (safe to import from "use
// client" components, API routes, and Mongoose model files alike).
export function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

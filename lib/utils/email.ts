// Single, shared email-format rule used by both the admin client forms and the
// server-side Zod/Mongoose validation, so "valid email" means the same thing
// everywhere it's checked. Framework-agnostic (safe to import from "use client"
// components, API routes, and Mongoose model files alike).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

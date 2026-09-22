"use client";

import { useEffect } from "react";

/**
 * Defense-in-depth against the browser's back/forward cache (bfcache)
 * restoring a protected admin page verbatim after logout, with no network
 * request and no React re-render to intercept. `pageshow` with
 * `event.persisted` is the only signal that fires on a genuine bfcache
 * restore; a hard reload forces a real navigation back through proxy.ts,
 * which re-validates the admin session server-side.
 */
export default function AdminBfcacheGuard() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}

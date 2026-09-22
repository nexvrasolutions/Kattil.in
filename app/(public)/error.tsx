"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * Route-segment error boundary for the public site. Catches errors thrown while
 * rendering any (public) page or layout (e.g. a failed data fetch) and shows a
 * distinguishable, branded error state instead of Next's generic fallback —
 * distinct from a loading state and from a genuine empty result.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public route error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20 bg-[#FAF8F5]">
      <div className="py-16 px-6 text-center bg-white rounded-[8px] border border-gray-100 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        <h2 className="font-sans text-xl font-semibold text-[#111827] mb-2">
          Something went wrong
        </h2>

        <p className="font-sans text-sm text-[#6b7280] leading-relaxed mb-6">
          We couldn&apos;t load this page right now. Please try again, or head back home.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-2.5 rounded-[8px] bg-[#0d1b2e] text-white text-sm font-medium hover:bg-[#162840] transition-colors shadow-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 rounded-[8px] border border-gray-200 text-[#111827] text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

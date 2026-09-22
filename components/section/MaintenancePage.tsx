import { Construction } from "lucide-react";

/**
 * Full-page replacement rendered by the public layout when
 * Settings.maintenance.enabled is true. Deliberately standalone — no navbar,
 * footer, or links to other public pages, since the whole site is down.
 */
export default function MaintenancePage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#FAF8F5]">
      <div className="py-16 px-6 text-center bg-white rounded-[8px] border border-gray-100 max-w-xl mx-auto">
        <img src="/assets/logo.png" alt="Kattil" className="h-10 object-contain mx-auto mb-8" />

        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-6 h-6 text-amber-600" />
        </div>

        <h1 className="font-sans text-xl font-semibold text-[#111827] mb-2">
          We&apos;re currently down for maintenance
        </h1>

        <p className="font-sans text-sm text-[#6b7280] leading-relaxed">
          {message || "We'll be back shortly. Thank you for your patience."}
        </p>
      </div>
    </div>
  );
}

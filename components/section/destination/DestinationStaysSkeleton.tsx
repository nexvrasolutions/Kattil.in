import Navbar from "@/components/layout/Navbar";

/**
 * Structural loading fallback for the destination-stays pages (chennai, madurai,
 * coimbatore, colachel, kaniyakumari, kanyakumari, destinations/[slug]).
 *
 * Rendered instantly by <Suspense> while the page's data fetch is in flight, so
 * navigation gets immediate, distinguishable feedback instead of a frozen shell.
 * Mirrors DestinationStaysView's real layout (navbar, hero band, property grid)
 * so there's no layout shift when the real content swaps in.
 */
export default function DestinationStaysSkeleton({ cityName }: { cityName: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]" role="status" aria-live="polite">
      <span className="sr-only">Loading stays in {cityName}…</span>

      <Navbar />

      {/* Hero band */}
      <section
        className="relative w-full bg-[#8E9F78] overflow-hidden min-h-[280px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-34 lg:pt-36 pb-12 sm:pb-14 md:pb-16"
      >
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15 max-w-3xl">
            <div className="h-3 w-40 rounded bg-white/25 animate-pulse mb-4" />
            <div className="h-7 sm:h-9 md:h-10 w-64 sm:w-80 md:w-96 rounded bg-white/25 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Property grid */}
      <main className="relative z-20 flex-1 py-12 md:py-16 lg:py-20 bg-[#FAF8F5] rounded-t-[20px] md:rounded-t-[24px] overflow-hidden -mt-3 md:-mt-4">
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-5">
          <div className="px-5 md:px-8 lg:px-15">
            <div className="mb-8 md:mb-10 h-5 w-56 rounded bg-gray-200 animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 md:gap-8 justify-items-center lg:justify-items-start">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full max-w-[413px] bg-white rounded-[8px] overflow-hidden border border-gray-100"
                >
                  <div className="w-full h-[300px] min-[400px]:h-[320px] sm:h-[300px] md:h-[279px] bg-gray-200 animate-pulse" />
                  <div className="w-full px-4 pt-[16px] pb-4 flex flex-col gap-[10px]">
                    <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

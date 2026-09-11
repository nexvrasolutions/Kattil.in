import { CSSProperties } from "react";

// ── Skeleton ──────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width, height, className = "", style }: SkeletonProps) {
  return (
    <div
      className={["adm-skeleton rounded", className].join(" ")}
      style={{ width, height, ...style }}
    />
  );
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-card))] p-6",
        className,
      ].join(" ")}
      style={{ boxShadow: "var(--adm-shadow-sm)" }}
    >
      {/* Card header skeleton */}
      <div className="mb-4 space-y-2">
        <Skeleton height={10} width="40%" />
        <Skeleton height={28} width="60%" />
      </div>
      {/* Card body lines */}
      <div className="space-y-3">
        <Skeleton height={12} width="100%" />
        <Skeleton height={12} width="85%" />
        <Skeleton height={12} width="70%" />
      </div>
      {/* Footer stat row */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-accent)/0.12)] px-3 py-3">
        <Skeleton height={10} width={80} />
        <Skeleton height={14} width={50} />
      </div>
    </div>
  );
}

// ── SkeletonTable ─────────────────────────────────────────────────────────────

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, cols, columns, className = "" }: SkeletonTableProps) {
  const colCount = cols ?? columns ?? 4;
  return (
    <div
      className={[
        "rounded-xl border border-[hsl(var(--adm-border))] overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="border-b border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.5)] px-4 py-3 flex gap-6">
        {Array.from({ length: colCount }).map((_, i) => (
          <Skeleton key={i} height={10} width={`${60 + i * 5}px`} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="border-b border-[hsl(var(--adm-border)/0.5)] px-4 py-3 flex items-center gap-6"
        >
          {Array.from({ length: colCount }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height={12}
              style={{ width: `${50 + ((rowIdx + colIdx) * 17) % 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── SkeletonDashboard ─────────────────────────────────────────────────────────

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={12} width={120} />
          <Skeleton height={32} width={220} />
        </div>
        <Skeleton height={40} width={120} className="rounded-md" />
      </div>

      {/* 6 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-card))] p-5"
            style={{ boxShadow: "var(--adm-shadow-sm)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1.5">
                <Skeleton height={10} width={80} />
                <Skeleton height={28} width={100} />
              </div>
              <Skeleton height={36} width={36} className="rounded-xl" />
            </div>
            <Skeleton height={8} width="60%" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div
        className="rounded-3xl border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-card))] p-6"
        style={{ boxShadow: "var(--adm-shadow-sm)" }}
      >
        <div className="mb-6 space-y-2">
          <Skeleton height={10} width={100} />
          <Skeleton height={24} width={180} />
        </div>
        <Skeleton height={200} width="100%" className="rounded-xl" />
      </div>
    </div>
  );
}

import { CSSProperties, ReactNode } from "react";

// ── AdminCard ────────────────────────────────────────────────────────────────

interface AdminCardProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export function AdminCard({ className = "", children, style }: AdminCardProps) {
  return (
    <div
      className={[
        "rounded-[8px] border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-card))] text-[hsl(var(--adm-card-foreground))]",
        className,
      ].join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

// ── AdminCardHeader ──────────────────────────────────────────────────────────

interface AdminCardHeaderProps {
  className?: string;
  children?: ReactNode;
}

export function AdminCardHeader({ className = "", children }: AdminCardHeaderProps) {
  return (
    <div className={["p-6 pb-0 space-y-4", className].join(" ")}>
      {children}
    </div>
  );
}

// ── AdminCardContent ─────────────────────────────────────────────────────────

interface AdminCardContentProps {
  className?: string;
  children?: ReactNode;
}

export function AdminCardContent({ className = "", children }: AdminCardContentProps) {
  return (
    <div className={["p-6 pt-0", className].join(" ")}>
      {children}
    </div>
  );
}

// ── AdminCardTitle ───────────────────────────────────────────────────────────

interface AdminCardTitleProps {
  className?: string;
  children?: ReactNode;
}

export function AdminCardTitle({ className = "", children }: AdminCardTitleProps) {
  return (
    <h3
      className={[
        "text-2xl font-bold text-[hsl(var(--adm-card-foreground))]",
        className,
      ].join(" ")}
    >
      {children}
    </h3>
  );
}

// ── AdminCardDescription ─────────────────────────────────────────────────────

interface AdminCardDescriptionProps {
  className?: string;
  children?: ReactNode;
}

export function AdminCardDescription({ className = "", children }: AdminCardDescriptionProps) {
  return (
    <p
      className={[
        "text-xs font-semibold uppercase text-[hsl(var(--adm-muted-foreground))]",
        className,
      ].join(" ")}
    >
      {children}
    </p>
  );
}

// ── StatRow ──────────────────────────────────────────────────────────────────

interface StatRowProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  className?: string;
}

export function StatRow({ label, value, helper, className = "" }: StatRowProps) {
  return (
    <div
      className={[
        "flex items-start justify-between rounded-[8px] border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-accent)/0.12)] px-3 py-3",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-bold uppercase text-[hsl(var(--adm-muted-foreground))]">
          {label}
        </span>
        {helper && (
          <span className="text-[11px] text-[hsl(var(--adm-muted-foreground)/0.7)]">
            {helper}
          </span>
        )}
      </div>
      <span className="text-sm font-bold text-[hsl(var(--adm-card-foreground))]">
        {value}
      </span>
    </div>
  );
}

// ── GradientCard ─────────────────────────────────────────────────────────────

interface GradientCardProps {
  className?: string;
  children?: ReactNode;
}

export function GradientCard({ className = "", children }: GradientCardProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[8px] border-none",
        className,
      ].join(" ")}
      style={{ background: "#0E2E4E" }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

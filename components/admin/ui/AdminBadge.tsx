import { ReactNode } from "react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

interface AdminBadgeProps {
  variant?: BadgeVariant;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[hsl(var(--adm-primary)/0.15)] text-[hsl(var(--adm-primary))]",
  secondary:
    "bg-[hsl(var(--adm-secondary))] text-[hsl(var(--adm-secondary-foreground))]",
  success:
    "bg-[hsl(var(--adm-success)/0.15)] text-[hsl(var(--adm-success))]",
  warning:
    "bg-[hsl(var(--adm-warning)/0.15)] text-[hsl(var(--adm-warning))]",
  destructive:
    "bg-[hsl(var(--adm-destructive)/0.15)] text-[hsl(var(--adm-destructive))]",
  outline:
    "border border-[hsl(var(--adm-border))] text-[hsl(var(--adm-foreground))]",
};

export function AdminBadge({
  variant = "default",
  children,
  className = "",
}: AdminBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default AdminBadge;

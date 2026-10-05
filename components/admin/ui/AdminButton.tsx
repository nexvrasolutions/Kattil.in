import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "secondary" | "destructive" | "ghost" | "outline" | "link";
type ButtonSize = "sm" | "default" | "lg" | "icon";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border-none bg-[#D2E6BC] text-[#202020] hover:bg-[#D2E6BC] active:bg-[#D2E6BC] focus:bg-[#D2E6BC]",
  secondary:
    "bg-[hsl(var(--adm-secondary))] text-[hsl(var(--adm-secondary-foreground))] hover:bg-[hsl(var(--adm-secondary)/0.75)] active:scale-[0.98]",
  destructive:
    "bg-[hsl(var(--adm-destructive))] text-white hover:bg-[hsl(var(--adm-destructive)/0.88)] active:scale-[0.98]",
  ghost:
    "hover:bg-[hsl(var(--adm-accent))] hover:text-[hsl(var(--adm-accent-foreground))] active:scale-[0.98]",
  outline:
    "border border-[hsl(var(--adm-border))] bg-transparent hover:bg-[hsl(var(--adm-accent))] hover:border-[hsl(var(--adm-primary)/0.4)] text-[hsl(var(--adm-foreground))] active:scale-[0.98]",
  link: "text-[hsl(var(--adm-primary))] underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs rounded-[8px] gap-1.5",
  default: "h-10 px-5 text-sm rounded-[8px] gap-2",
  lg: "h-11 px-7 text-sm rounded-[8px] gap-2",
  icon: "h-10 w-10 rounded-[8px]",
};

export function AdminButton({
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: AdminButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {loading ? (
        <>
          <span
            className="h-3.5 w-3.5 rounded-[8px] border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AdminButton;

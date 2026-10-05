import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

// ── Shared base class ─────────────────────────────────────────────────────────

const inputBase =
  "flex w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] px-3.5 py-2.5 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] focus-visible:ring-offset-0 focus-visible:border-[hsl(var(--adm-ring)/0.6)] hover:border-[hsl(var(--adm-border)/0.8)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150";

const labelClass =
  "mb-2 block text-sm font-semibold text-[hsl(var(--adm-foreground))]";

const errorClass =
  "mt-1.5 text-xs font-medium text-[hsl(var(--adm-destructive))]";

// ── AdminInput ────────────────────────────────────────────────────────────────

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  required?: boolean;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, hint, error, className = "", id, required, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}{required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[inputBase, "h-11", className].join(" ")}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[hsl(var(--adm-muted-foreground)/0.7)]">{hint}</p>
        )}
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }
);
AdminInput.displayName = "AdminInput";

// ── AdminTextarea ─────────────────────────────────────────────────────────────

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className={labelClass}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[inputBase, "h-auto min-h-22 resize-y", className].join(" ")}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[hsl(var(--adm-muted-foreground)/0.7)]">{hint}</p>
        )}
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }
);
AdminTextarea.displayName = "AdminTextarea";

// ── AdminSelect ───────────────────────────────────────────────────────────────

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, hint, error, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className={labelClass}>
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            className={[
              inputBase,
              "h-11 appearance-none pr-10 cursor-pointer",
              className,
            ].join(" ")}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--adm-muted-foreground))]"
            aria-hidden="true"
          />
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[hsl(var(--adm-muted-foreground)/0.7)]">{hint}</p>
        )}
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }
);
AdminSelect.displayName = "AdminSelect";

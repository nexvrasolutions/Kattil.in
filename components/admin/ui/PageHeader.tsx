import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div className="flex items-start gap-3.5">
        <div
          className="mt-1 h-7 w-1 rounded-[8px] shrink-0"
          style={{ background: "hsl(var(--adm-brand))" }}
          aria-hidden="true"
        />
        <div>
          <h1 className="text-2xl font-medium text-[hsl(var(--adm-foreground))]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-[hsl(var(--adm-muted-foreground))]">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0 pt-0.5">{children}</div>
      )}
    </div>
  );
}

export default PageHeader;

"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: AdminModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const portal = typeof document !== "undefined" ? document.body : null;
  if (!portal) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        /* Wrap in admin-root so all --adm-* CSS variables resolve correctly */
        <div className="admin-root">
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              className={[
                "relative z-10 w-full overflow-hidden rounded-[8px] border border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-card))]",
                sizeClasses[size],
              ].join(" ")}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[hsl(var(--adm-border)/0.5)] px-6 py-4">
                <div>
                  <h2
                    id="modal-title"
                    className="text-base font-bold text-[hsl(var(--adm-card-foreground))]"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-0.5 text-xs text-[hsl(var(--adm-muted-foreground))]">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] hover:bg-[hsl(var(--adm-accent))] text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-5">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    portal
  );
}

export default AdminModal;

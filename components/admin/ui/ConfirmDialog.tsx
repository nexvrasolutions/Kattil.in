"use client";

import { AlertTriangle, Info } from "lucide-react";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";

type ConfirmVariant = "destructive" | "default";

interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => any;
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  variant?: ConfirmVariant;
}

export function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  description,
  confirmLabel = "Confirm",
  variant = "destructive",
}: ConfirmDialogProps) {
  const isDialogVisible = Boolean(isOpen ?? open);
  const handleClose = onClose ?? onCancel ?? (() => {});
  const msg = message ?? description ?? "";

  const handleConfirm = async () => {
    await onConfirm();
    handleClose();
  };

  return (
    <AdminModal isOpen={isDialogVisible} onClose={handleClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        {/* Icon + message */}
        <div className="flex items-start gap-3">
          <div
            className={[
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
              variant === "destructive"
                ? "bg-[hsl(var(--adm-destructive)/0.12)] text-[hsl(var(--adm-destructive))]"
                : "bg-[hsl(var(--adm-primary)/0.12)] text-[hsl(var(--adm-primary))]",
            ].join(" ")}
          >
            {variant === "destructive" ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--adm-muted-foreground))]">
            {msg}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <AdminButton variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}

export default ConfirmDialog;

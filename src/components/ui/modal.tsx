"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card max-h-[90vh] w-full max-w-lg overflow-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" aria-label="Close" className="rounded-full p-2 hover:bg-brand-light" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BottomSheet(props: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  return <Modal {...props} />;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
  pending,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  pending?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-muted">{body}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" className="min-h-touch flex-1 rounded-2xl border border-line" onClick={onClose}>
          Cancel
        </button>
        <button type="button" disabled={pending} className="min-h-touch flex-1 rounded-2xl bg-danger font-semibold text-white disabled:opacity-60" onClick={onConfirm}>
          {pending ? "Saving..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

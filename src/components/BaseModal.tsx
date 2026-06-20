"use client";

import { PropsWithChildren } from "react";

type BaseModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  width?: number | string;
}>;

export default function BaseModal({
  open,
  title,
  subtitle,
  onClose,
  width = 760,
  children,
}: BaseModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop app-modal-backdrop" role="presentation">
      <section
        aria-modal="true"
        className="modal-panel app-modal-panel"
        role="dialog"
        style={{ width }}
      >
        <header className="app-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="flyout-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="app-modal-body">{children}</div>
      </section>
    </div>
  );
}

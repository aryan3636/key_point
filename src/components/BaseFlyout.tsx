"use client";

import { PropsWithChildren } from "react";

type BaseFlyoutProps = PropsWithChildren<{
  open: boolean;
  title?: string;
  onClose: () => void;
  width?: number | string;
  zIndex?: number;
  headerAction?: React.ReactNode;
}>;

export default function BaseFlyout({
  open,
  title,
  onClose,
  width = 650,
  zIndex,
  headerAction,
  children,
}: BaseFlyoutProps) {
  return (
    <div
      className={`flyout-root ${open ? "is-open" : ""}`}
      style={zIndex ? { zIndex } : undefined}
      aria-hidden={!open}
    >
      <button className="flyout-backdrop" type="button" onClick={onClose} aria-label="Close flyout" />
      <aside className="flyout-panel" style={{ width }}>
        <div className="flyout-header">
          <h2>{title}</h2>
          <div className="flyout-header-actions">
            {headerAction}
            <button className="flyout-close" type="button" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>
        <div className="flyout-body">{children}</div>
      </aside>
    </div>
  );
}

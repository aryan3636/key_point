"use client";

import BaseModal from "@/components/BaseModal";

export type ConfirmationDialogConfig = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export default function ConfirmationDialog({
  config,
  onClose,
}: {
  config: ConfirmationDialogConfig | null;
  onClose: () => void;
}) {
  if (!config) return null;

  const confirm = () => {
    config.onConfirm();
    onClose();
  };

  return (
    <BaseModal open title={config.title} onClose={onClose} width={420}>
      <div className="confirmation-dialog-content">
        <p>{config.description}</p>
      </div>
      <div className="confirmation-dialog-actions">
        <button className="secondary-button" onClick={onClose} type="button">
          No
        </button>
        <button className="danger-button" onClick={confirm} type="button">
          {config.confirmLabel ?? "Yes"}
        </button>
      </div>
    </BaseModal>
  );
}

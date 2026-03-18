import React from "react";

export default function ConfirmModal({
  open,
  title = "알림",
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onClose,
  confirmDisabled = false,
  cancelDisabled = false,
}) {
  if (!open) return null;

  return (
    <div className="my-notice-modal-backdrop" onClick={onClose}>
      <div
        className="my-notice-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h4 className="my-notice-title">{title}</h4>
        <p className="my-notice-message">{message}</p>
        <div className="my-notice-actions">
          <button className="login-btn ghost" type="button" onClick={onClose} disabled={cancelDisabled}>
            {cancelLabel}
          </button>
          <button className="login-btn primary" type="button" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

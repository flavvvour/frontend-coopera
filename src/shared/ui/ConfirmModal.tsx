import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './confirm-modal.css';

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="cmodal-overlay" onClick={onCancel}>
      <div className="cmodal" onClick={e => e.stopPropagation()}>
        <div className="cmodal-icon-wrap">
          <AlertTriangle size={22} />
        </div>
        <button className="cmodal-close" onClick={onCancel}>
          <X size={15} />
        </button>
        <h3 className="cmodal-title">{title}</h3>
        {description && <p className="cmodal-desc">{description}</p>}
        <div className="cmodal-actions">
          <button className="cmodal-btn cmodal-btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="cmodal-btn cmodal-btn--confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

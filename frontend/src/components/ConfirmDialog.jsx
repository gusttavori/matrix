import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Tem certeza que deseja realizar esta ação?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmação"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm-dialog__icon confirm-dialog__icon--danger">
        <AlertTriangle size={24} />
      </div>
      <div className="confirm-dialog__text">
        <h4 className="confirm-dialog__title">{title}</h4>
        <p className="confirm-dialog__description">{description}</p>
      </div>
    </Modal>
  );
}

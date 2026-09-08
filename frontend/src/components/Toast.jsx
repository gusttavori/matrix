import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const iconColors = {
  success: 'var(--success-500)',
  error: 'var(--danger-500)',
  warning: 'var(--warning-500)',
  info: 'var(--primary-500)'
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast__icon">
              <Icon size={20} color={iconColors[toast.type]} />
            </span>
            <div className="toast__content">
              {toast.title && <div className="toast__title">{toast.title}</div>}
              {toast.message && <div className="toast__message">{toast.message}</div>}
            </div>
            <button className="toast__close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

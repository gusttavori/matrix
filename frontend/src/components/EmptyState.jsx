import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ 
  icon: Icon = Inbox,
  title = 'Nenhum registro encontrado',
  description,
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

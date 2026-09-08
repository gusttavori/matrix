import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Badge from './Badge';

export default function Header({ onMenuClick, breadcrumb }) {
  const { subscription } = useAuth();

  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    const badges = {
      TRIAL: { variant: 'warning', label: 'Período de teste' },
      ACTIVE: { variant: 'success', label: 'Ativo' },
      PAST_DUE: { variant: 'danger', label: 'Inadimplente' },
      CANCELED: { variant: 'danger', label: 'Cancelado' },
      EXPIRED: { variant: 'neutral', label: 'Expirado' }
    };
    const badge = badges[subscription.status];
    if (!badge) return null;
    if (subscription.status === 'ACTIVE') return null;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        {breadcrumb && (
          <span className="header__breadcrumb">{breadcrumb}</span>
        )}
      </div>
      <div className="header__right">
        {getSubscriptionBadge()}
      </div>
    </header>
  );
}

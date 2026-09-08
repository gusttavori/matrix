import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import logoMatrixBranco from '../assets/MATRIX.png';

export default function Sidebar({ links = [], sectionLabel = '' }) {
  const { user, institution, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Administrador',
      SECRETARY: 'Secretaria',
      TEACHER: 'Professor',
      STUDENT: 'Aluno'
    };
    return labels[role] || role;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.25rem 1rem', gap: '0.25rem' }}>
        <img 
          src={logoMatrixBranco} 
          alt="Educação Matrix" 
          style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
        />
        <div className="sidebar__brand-sub" style={{ fontSize: '0.75rem' }}>
          {institution?.tradeName || institution?.name || ''}
        </div>
      </div>

      <nav className="sidebar__nav">
        {sectionLabel && (
          <div className="sidebar__section-label">{sectionLabel}</div>
        )}
        {links.map((link, i) => {
          if (link.section) {
            return (
              <div key={i} className="sidebar__section-label">{link.section}</div>
            );
          }
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              {Icon && <Icon size={20} className="sidebar__link-icon" />}
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user" onClick={handleLogout} title="Sair">
          <div className="sidebar__avatar">
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar__user-name truncate">{user?.name}</div>
            <div className="sidebar__user-role">{getRoleLabel(user?.role)}</div>
          </div>
          <LogOut size={18} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
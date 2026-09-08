import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Building2,
  BarChart3,
  Settings,
  CreditCard
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth(); 

  // VERIFICAÇÃO À PROVA DE BALAS: Checa o e-mail do dono da plataforma
  const isSuperAdmin = user?.email === 'mestre@educacaomatrix.com.br';

  const superAdminLinks = [
    { section: 'Gestão do Sistema' },
    { to: '/admin', label: 'Dashboard SaaS', icon: LayoutDashboard, exact: true },
    { to: '/admin/institutions', label: 'Escolas Clientes', icon: Building2 },
    { to: '/admin/plans', label: 'Planos e Preços', icon: CreditCard },
  ];

  const schoolAdminLinks = [
    { section: 'Menu Principal' },
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { section: 'Gestão Acadêmica' },
    { to: '/admin/alunos', label: 'Alunos', icon: Users },
    { to: '/admin/professores', label: 'Professores', icon: GraduationCap },
    { to: '/admin/turmas', label: 'Turmas', icon: School },
    { to: '/admin/disciplinas', label: 'Disciplinas', icon: BookOpen },
    { section: 'Relatórios' },
    { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
    { section: 'Configurações' },
    { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
    { to: '/admin/assinatura', label: 'Assinatura', icon: CreditCard }
  ];

  const currentLinks = isSuperAdmin ? superAdminLinks : schoolAdminLinks;

  return (
    <div className="app-layout">
      <div className={`app-layout__sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar links={currentLinks} />
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-layout__main">
        <div className="app-layout__header">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <div className="app-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
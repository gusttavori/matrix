import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  BookOpen,
  History,
  FileText,
  User
} from 'lucide-react';

const studentLinks = [
  { section: 'Menu Principal' },
  { to: '/aluno', label: 'Início', icon: LayoutDashboard, exact: true },
  { section: 'Acadêmico' },
  { to: '/aluno/notas', label: 'Minhas Notas', icon: ClipboardList },
  { to: '/aluno/frequencia', label: 'Minha Frequência', icon: CalendarCheck },
  { to: '/aluno/disciplinas', label: 'Minhas Disciplinas', icon: BookOpen },
  { to: '/aluno/historico', label: 'Histórico', icon: History },
  { to: '/aluno/boletim', label: 'Boletim', icon: FileText },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className={`app-layout__sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar links={studentLinks} />
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

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { LayoutDashboard, Building, PlusCircle } from 'lucide-react';

export default function NetworkLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const networkLinks = [
    { section: 'Gestão B2G' },
    { to: '/rede', label: 'Visão Geral (Rede)', icon: LayoutDashboard, exact: true },
    { to: '/rede/nova-escola', label: 'Cadastrar Escola', icon: PlusCircle },
  ];

  return (
    <div className="app-layout">
      <div className={`app-layout__sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar links={networkLinks} />
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
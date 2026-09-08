import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { LayoutDashboard } from 'lucide-react';

// Menu do Professor Enxuto (Minimalismo)
const teacherLinks = [
  { section: 'Menu Principal' },
  { to: '/professor', label: 'Dashboard', icon: LayoutDashboard, exact: true }
];

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className={`app-layout__sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar links={teacherLinks} />
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
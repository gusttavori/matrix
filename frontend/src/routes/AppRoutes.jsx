import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';

// Pages - Public
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PlansPage from '../pages/PlansPage';

// Pages - Admin / Super Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import InstitutionsPage from '../pages/superadmin/InstitutionsPage'; // Adicione aqui
import PlansAdminPage from '../pages/superadmin/PlansAdminPage'; // Adicione aqui
import StudentsPage from '../pages/admin/StudentsPage';
import TeachersPage from '../pages/admin/TeachersPage';
import ClassesPage from '../pages/admin/ClassesPage';
import SubjectsPage from '../pages/admin/SubjectsPage';
import AcademicReportPage from '../pages/admin/AcademicReportPage';
import SettingsPage from '../pages/admin/SettingsPage';
import SubscriptionPage from '../pages/admin/SubscriptionPage';

// Pages - Teacher
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import CadernetaPage from '../pages/teacher/CadernetaPage';

// Pages - Student
import StudentDashboard from '../pages/student/StudentDashboard';
import ReportCardPage from '../pages/student/ReportCardPage';
import StudentHistoryPage from '../pages/student/StudentHistoryPage';
import StudentGradesPage from '../pages/student/StudentGradesPage';
import StudentAttendancePage from '../pages/student/StudentAttendancePage';
import StudentSubjectsPage from '../pages/student/StudentSubjectsPage';

function LoginRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const dashboards = {
    ADMIN: '/admin',
    SECRETARY: '/admin',
    TEACHER: '/professor',
    STUDENT: '/aluno'
  };

  return <Navigate to={dashboards[user.role] || '/admin'} replace />;
}

// Componente que decide qual Dashboard exibir
function AdminHome() {
  const { user } = useAuth();
  
  // VERIFICAÇÃO À PROVA DE BALAS: Checa o e-mail
  if (user?.email === 'mestre@educacaomatrix.com.br') {
    return <SuperAdminDashboard />;
  }
  return <AdminDashboard />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/planos" element={<PlansPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SECRETARY']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="institutions" element={<InstitutionsPage />} />
          <Route path="plans" element={<PlansAdminPage />} />
          <Route path="alunos" element={<StudentsPage />} />
          <Route path="professores" element={<TeachersPage />} />
          <Route path="turmas" element={<ClassesPage />} />
          <Route path="disciplinas" element={<SubjectsPage />} />
          
          <Route path="relatorios" element={<Navigate to="academico" replace />} />
          <Route path="relatorios/academico" element={<AcademicReportPage />} />
          
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="assinatura" element={<SubscriptionPage />} />
        </Route>

        <Route
          path="/professor"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="caderneta/:classId/:subjectId" element={<CadernetaPage />} />
        </Route>

        <Route
          path="/aluno"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="boletim" element={<ReportCardPage />} />
          <Route path="historico" element={<StudentHistoryPage />} />
          <Route path="notas" element={<StudentGradesPage />} />
          <Route path="frequencia" element={<StudentAttendancePage />} />
          <Route path="disciplinas" element={<StudentSubjectsPage />} />
        </Route>

        <Route path="/dashboard" element={<LoginRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
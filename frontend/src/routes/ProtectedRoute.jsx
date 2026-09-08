import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading text="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirecionar para o dashboard correto do role
    const dashboards = {
      ADMIN: '/admin',
      SECRETARY: '/admin',
      TEACHER: '/professor',
      STUDENT: '/aluno'
    };
    return <Navigate to={dashboards[user.role] || '/login'} replace />;
  }

  return children;
}

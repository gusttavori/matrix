import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
        <Toast />
      </AuthProvider>
    </ToastProvider>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import Input from '../components/Input';
import { LogIn, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Preencha e-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      const dashboards = {
        ADMIN: '/admin',
        SECRETARY: '/admin',
        TEACHER: '/professor',
        STUDENT: '/aluno'
      };
      navigate(dashboards[user.role] || '/login');
    } catch (err) {
      error(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="auth-container" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '1rem' 
      }}
    >
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '2.5rem', 
          margin: '0 auto' 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-100)', padding: '1rem', borderRadius: '50%' }}>
              <GraduationCap size={40} color="var(--primary-600)" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bem-vindo de volta</h1>
          <p className="text-secondary">Faça login para acessar o Educação Matrix</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          
          <Button 
            type="submit" 
            block 
            icon={LogIn} 
            loading={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            Entrar
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
          <p className="text-secondary">
            Sua instituição ainda não tem conta?{' '}
            <Link to="/planos" style={{ color: 'var(--primary-600)', fontWeight: 'bold', textDecoration: 'none' }}>
              Veja nossos planos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
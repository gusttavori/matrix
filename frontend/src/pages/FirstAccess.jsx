import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import Input from '../components/Input';
import { KeyRound, GraduationCap } from 'lucide-react';

export default function FirstAccess() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/change-first-password', { newPassword });
      
      // Limpa as credenciais temporárias para forçar o login com a nova senha
      localStorage.removeItem('matrix_token');
      localStorage.removeItem('matrix_user');
      
      success('Senha atualizada com sucesso! Faça login.');
      navigate('/login');
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao atualizar a senha. Tente novamente.');
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
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crie sua nova senha</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
            Por questões de segurança, você precisa definir uma senha pessoal antes de acessar o sistema Educação Matrix.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            required
          />
          <Input
            label="Confirme a Nova Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            required
          />
          
          <Button 
            type="submit" 
            block 
            icon={KeyRound} 
            loading={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            Atualizar Senha e Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Ajuste o caminho do seu axios

export default function FirstAccess() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      return setError('A nova senha deve ter no mínimo 6 caracteres.');
    }
    if (newPassword !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-first-password', { newPassword });
      
      // Limpa o token temporário por segurança e obriga um novo login
      localStorage.removeItem('matrix_token');
      localStorage.removeItem('matrix_user');
      
      alert('Senha atualizada com sucesso! Faça login com a sua nova senha.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Crie sua nova senha</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Por questões de segurança, você precisa definir uma senha pessoal antes de acessar o sistema.
        </p>

        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirme a Nova Senha</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Atualizar Senha e Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
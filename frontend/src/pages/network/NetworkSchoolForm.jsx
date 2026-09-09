import { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Building, User, Save } from 'lucide-react';

export default function NetworkForm() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    networkName: '', city: '', state: '', 
    adminName: '', adminEmail: '', adminPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica no front-end para garantir campos preenchidos
    if (!formData.networkName || !formData.city || !formData.state || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
      error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/super-admin/networks', formData);
      success('Rede de Ensino e Secretário criados com sucesso!');
      setFormData({
        networkName: '', city: '', state: '', 
        adminName: '', adminEmail: '', adminPassword: ''
      });
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao criar a rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-header__title">Cadastrar Rede de Ensino (B2G)</h1>
        <p className="page-header__subtitle">Adicione Prefeituras ou Mantenedoras e crie o acesso do Secretário</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Dados da Rede / Prefeitura" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-600)' }}>
            <Building size={20} /> <span style={{ fontWeight: 'bold' }}>Informações Institucionais</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input 
                id="networkName" 
                label="Nome da Rede (Ex: Prefeitura Municipal de Vitória da Conquista) *" 
                value={formData.networkName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <Input 
              id="city" 
              label="Cidade *" 
              value={formData.city} 
              onChange={handleChange} 
              required 
            />
            <Input 
              id="state" 
              label="Estado (UF) *" 
              value={formData.state} 
              onChange={handleChange} 
              maxLength={2} 
              required 
            />
          </div>
        </Card>

        <Card title="Acesso do Secretário (Gestor da Rede)" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-600)' }}>
            <User size={20} /> <span style={{ fontWeight: 'bold' }}>Credenciais de Acesso</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input 
                id="adminName" 
                label="Nome Completo do Gestor *" 
                value={formData.adminName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <Input 
              id="adminEmail" 
              type="email" 
              label="E-mail de Acesso *" 
              value={formData.adminEmail} 
              onChange={handleChange} 
              required 
            />
            <Input 
              id="adminPassword" 
              type="password" 
              label="Senha Inicial *" 
              value={formData.adminPassword} 
              onChange={handleChange} 
              required 
            />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            * O Secretário será forçado a trocar esta senha no primeiro login por questões de segurança. Todos os campos acima são obrigatórios.
          </p>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" icon={Save} loading={loading} size="lg">Salvar e Criar Rede</Button>
        </div>
      </form>
    </div>
  );
}
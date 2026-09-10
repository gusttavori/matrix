import { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Building2, UserPlus, Save } from 'lucide-react';

export default function NetworkSchoolForm() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', tradeName: '', document: '', email: '', phone: '', city: '', state: '',
    adminName: '', adminEmail: '', adminPassword: ''
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/network/institutions', formData);
      success('Unidade Escolar e Diretor criados com sucesso!');
      setFormData({
        name: '', tradeName: '', document: '', email: '', phone: '', city: '', state: '',
        adminName: '', adminEmail: '', adminPassword: ''
      });
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao criar a unidade escolar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-header__title">Cadastrar Nova Unidade Escolar</h1>
        <p className="page-header__subtitle">Adicione uma escola à sua rede e crie o acesso do Diretor local</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Dados da Escola" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input id="name" label="Razão Social / Nome Oficial *" value={formData.name} onChange={handleChange} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input id="tradeName" label="Nome Fantasia (Como a escola é conhecida) *" value={formData.tradeName} onChange={handleChange} required />
            </div>
            <Input id="document" label="CNPJ / INEP" value={formData.document} onChange={handleChange} />
            <Input id="email" type="email" label="E-mail Institucional *" value={formData.email} onChange={handleChange} required />
            <Input id="phone" label="Telefone" value={formData.phone} onChange={handleChange} />
            <Input id="city" label="Cidade *" value={formData.city} onChange={handleChange} required />
            <Input id="state" label="Estado (UF) *" value={formData.state} onChange={handleChange} maxLength={2} required />
          </div>
        </Card>

        <Card title="Credenciais do Diretor" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input id="adminName" label="Nome Completo do Diretor *" value={formData.adminName} onChange={handleChange} required />
            </div>
            <Input id="adminEmail" type="email" label="E-mail de Acesso do Diretor *" value={formData.adminEmail} onChange={handleChange} required />
            <Input id="adminPassword" type="password" label="Senha Inicial *" value={formData.adminPassword} onChange={handleChange} required />
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" icon={Save} loading={loading} size="lg">Salvar Escola</Button>
        </div>
      </form>
    </div>
  );
}
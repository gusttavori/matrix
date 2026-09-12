import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Save, ArrowLeft } from 'lucide-react';

export default function NetworkSchoolForm() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);

  // 1. ADICIONE O CAMPO type AQUI NO ESTADO INICIAL
  const [form, setForm] = useState({
    name: '',
    tradeName: '',
    document: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    type: 'PUBLIC', // Padrão: Pública
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/network/institutions', form);
      success('Escola criada com sucesso!');
      navigate('/rede');
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao criar escola.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/rede')} />
        <h1 className="page-header__title" style={{ margin: 0 }}>Nova Unidade Escolar</h1>
      </div>

      <form onSubmit={handleSave}>
        <Card title="Dados da Instituição" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Input label="Nome Oficial da Escola" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Nome Fantasia (Opcional)" value={form.tradeName} onChange={e => setForm({...form, tradeName: e.target.value})} />
            <Input label="CNPJ / Documento (Opcional)" value={form.document} onChange={e => setForm({...form, document: e.target.value})} />
            <Input label="E-mail Institucional" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Telefone / WhatsApp" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <Input label="Cidade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
            <Input label="Estado (UF)" value={form.state} onChange={e => setForm({...form, state: e.target.value})} maxLength={2} required />
            
            {/* 2. ADICIONE O SELETOR DE TIPO AQUI NO FORMULÁRIO */}
            <div className="form-group">
              <label className="form-group__label">Tipo de Instituição *</label>
              <select 
                className="input" 
                value={form.type} 
                onChange={(e) => setForm({...form, type: e.target.value})}
                required
              >
                <option value="PUBLIC">Pública</option>
                <option value="PRIVATE">Privada</option>
              </select>
            </div>

          </div>
        </Card>

        <Card title="Acesso do Diretor / Gestor" style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Crie a conta de acesso principal para a administração desta unidade.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Input label="Nome do Diretor" value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} required />
            <Input label="E-mail de Login" type="email" value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} required />
            <Input label="Senha Provisória" type="password" value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} required />
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/rede')}>Cancelar</Button>
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? 'Criando Escola...' : 'Confirmar Criação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
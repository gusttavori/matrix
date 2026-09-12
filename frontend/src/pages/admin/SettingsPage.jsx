import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import { AlertTriangle, Building, BookOpen, Calendar, Lock, Unlock } from 'lucide-react';

export default function SettingsPage() {
  const { institution, user, fetchInstitutionData } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('institution');
  const [periods, setPeriods] = useState([]);

  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    name: '', tradeName: '', phone: '', address: '', city: '', state: ''
  });

  const [academicData, setAcademicData] = useState({
    minAverage: '6.0', minAttendance: '75', pointsPerPeriod: '25', unitsCount: '4'
  });

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        tradeName: institution.tradeName || '',
        phone: institution.phone || '',
        address: institution.address || '',
        city: institution.city || '',
        state: institution.state || ''
      });
    }
  }, [institution]);

  useEffect(() => {
    const fetchAcademicSettings = async () => {
      try {
        const res = await api.get('/api/institutions/academic-settings');
        if (res.data?.data) {
          setAcademicData({
            minAverage: res.data.data.minAverage || '6.0',
            minAttendance: res.data.data.minAttendance || '75',
            pointsPerPeriod: res.data.data.pointsPerPeriod || '25',
            unitsCount: res.data.data.unitsCount ? String(res.data.data.unitsCount) : '4'
          });
        }
      } catch (err) {
        console.log('Regras acadêmicas padrão em uso.');
      }
    };

    const fetchPeriods = async () => {
      try {
        const res = await api.get('/api/institutions/academic-periods');
        if (res.data?.data) {
          setPeriods(res.data.data);
        }
      } catch (err) {
        console.log('Nenhum período encontrado.');
      }
    };

    if (isAdmin) {
      fetchAcademicSettings();
      fetchPeriods();
    }
  }, [isAdmin]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  const handleAcademicChange = (e) => setAcademicData(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 
    setLoading(true);
    try {
      await api.put('/api/institutions', formData);
      await fetchInstitutionData(); 
      success('Configurações atualizadas com sucesso.');
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao atualizar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcademicSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 
    setLoading(true);
    try {
      await api.put('/api/institutions/academic-settings', academicData);
      success('Regras acadêmicas atualizadas com sucesso.');
      // Atualiza a lista de períodos após gerar os novos
      const res = await api.get('/api/institutions/academic-periods');
      if (res.data?.data) setPeriods(res.data.data);
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar regras acadêmicas.');
    } finally {
      setLoading(false);
    }
  };

  const togglePeriod = async (periodId, currentStatus) => {
    if (!isAdmin) return;
    try {
      await api.patch(`/api/institutions/academic-periods/${periodId}/status`, {
        isClosed: !currentStatus
      });
      success(`Período ${!currentStatus ? 'fechado' : 'reaberto'} com sucesso.`);
      
      const res = await api.get('/api/institutions/academic-periods');
      if (res.data?.data) setPeriods(res.data.data);
    } catch (err) {
      error('Erro ao alterar status do período.');
    }
  };

  if (!institution) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Configurações</h1>
          <p className="page-header__subtitle">Gerencie os dados e regras da sua instituição</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {!isAdmin && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-50)', color: 'var(--warning-800)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontWeight: '500' }}>
            <AlertTriangle size={24} />
            <div>
              <strong>Acesso Restrito:</strong> Seu perfil permite apenas visualização.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('institution')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeTab === 'institution' ? '2px solid var(--primary-600)' : '2px solid transparent', color: activeTab === 'institution' ? 'var(--primary-700)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Building size={18} /> Dados da Instituição
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('academic')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeTab === 'academic' ? '2px solid var(--primary-600)' : '2px solid transparent', color: activeTab === 'academic' ? 'var(--primary-700)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <BookOpen size={18} /> Regras Acadêmicas
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('periods')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeTab === 'periods' ? '2px solid var(--primary-600)' : '2px solid transparent', color: activeTab === 'periods' ? 'var(--primary-700)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Calendar size={18} /> Períodos Letivos
            </button>
          )}
        </div>

        {activeTab === 'institution' && (
          <Card>
            <form onSubmit={handleInstitutionSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}><Input id="name" label="Razão Social" value={formData.name} onChange={handleChange} required disabled={!isAdmin} /></div>
              <div style={{ gridColumn: '1 / -1' }}><Input id="tradeName" label="Nome Fantasia" value={formData.tradeName} onChange={handleChange} required disabled={!isAdmin} /></div>
              <Input id="phone" label="Telefone" value={formData.phone} onChange={handleChange} disabled={!isAdmin} />
              <Input id="state" label="Estado (UF)" value={formData.state} onChange={handleChange} maxLength={2} disabled={!isAdmin} />
              <div style={{ gridColumn: '1 / -1' }}><Input id="city" label="Cidade" value={formData.city} onChange={handleChange} disabled={!isAdmin} /></div>
              <div style={{ gridColumn: '1 / -1' }}><Input id="address" label="Endereço Completo" value={formData.address} onChange={handleChange} disabled={!isAdmin} /></div>
              
              {isAdmin && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button type="submit" loading={loading}>Salvar Alterações</Button>
                </div>
              )}
            </form>
          </Card>
        )}

        {activeTab === 'academic' && isAdmin && (
          <Card title="Parâmetros de Avaliação (Ano Letivo Atual)">
            <form onSubmit={handleAcademicSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Input id="minAverage" type="number" step="0.1" label="Média Mínima para Aprovação" value={academicData.minAverage} onChange={handleAcademicChange} required />
              <Input id="minAttendance" type="number" label="Frequência Mínima Exigida (%)" value={academicData.minAttendance} onChange={handleAcademicChange} required />
              <Input id="pointsPerPeriod" type="number" label="Total de Pontos por Unidade/Período" value={academicData.pointsPerPeriod} onChange={handleAcademicChange} required />
              <Input id="unitsCount" type="number" min="1" max="6" label="Quantidade de Unidades / Períodos no Ano" value={academicData.unitsCount} onChange={handleAcademicChange} required />
              
              <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--primary-800)' }}>
                <strong>Atenção:</strong> Alterar a média ou a distribuição de pontos no meio do ano letivo recalculará automaticamente a situação de todos os alunos.
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="submit" loading={loading}>Atualizar Regras</Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'periods' && isAdmin && (
          <Card title="Gerenciamento de Períodos Letivos">
            {periods.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Nenhum período gerado. Por favor, atualize as "Regras Acadêmicas" primeiro.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {periods.map(period => (
                  <div key={period.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    backgroundColor: period.isClosed ? 'var(--bg-color-alt)' : 'white'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{period.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Status: <strong style={{ color: period.isClosed ? 'var(--danger-600)' : 'var(--success-600)' }}>
                          {period.isClosed ? 'Fechado' : 'Aberto'}
                        </strong>
                      </p>
                    </div>
                    <Button 
                      variant={period.isClosed ? "primary" : "danger"} 
                      icon={period.isClosed ? Unlock : Lock}
                      onClick={() => togglePeriod(period.id, period.isClosed)}
                    >
                      {period.isClosed ? "Reabrir Período" : "Fechar Período"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
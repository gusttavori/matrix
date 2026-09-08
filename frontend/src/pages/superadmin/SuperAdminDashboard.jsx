import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { Building2, DollarSign, Users, GraduationCap } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.get('/api/super-admin/metrics');
        setMetrics(res.data.data);
      } catch (err) {
        console.error('Erro ao carregar métricas da plataforma', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading || !metrics) return <Loading text="Carregando métricas da plataforma..." />;

  // Formata moeda (R$)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard Matrix</h1>
          <p className="page-header__subtitle">Visão geral e faturamento da plataforma (SaaS)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card de Faturamento */}
        <Card style={{ borderLeft: '4px solid var(--primary-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={24} style={{ color: 'var(--primary-600)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receita Mensal (MRR)</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(metrics.mrr)}</h3>
            </div>
          </div>
        </Card>

        {/* Card de Escolas */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--accent-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <Building2 size={24} style={{ color: 'var(--accent-600)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Escolas Ativas</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalInstitutions}</h3>
            </div>
          </div>
        </Card>

        {/* Card de Alunos Totais */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--gray-100)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} style={{ color: 'var(--gray-600)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total de Alunos (Global)</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalStudents}</h3>
            </div>
          </div>
        </Card>

        {/* Card de Professores Totais */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--gray-100)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <GraduationCap size={24} style={{ color: 'var(--gray-600)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Professores na Plataforma</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalTeachers}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Bem-vindo ao Centro de Comando</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Este é o painel de administração global do Educação Matrix. A partir daqui, você pode monitorar a saúde financeira do seu negócio (MRR), adicionar novas escolas parceiras, configurar as limitações dos planos de assinatura e dar suporte técnico para as secretarias.
        </p>
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import { Building, Users, BookOpen } from 'lucide-react';

export default function NetworkDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/api/network/dashboard');
        if (res.data && res.data.data) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error('Erro ao buscar dashboard da rede:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <Loading text="Consolidando dados da rede municipal..." />;
  
  // TRAVA DE SEGURANÇA: Se a API falhou, não tenta desestruturar
  if (!dashboardData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Não foi possível carregar os dados da Secretaria.</h2>
        <p>Verifique sua conexão ou contate o suporte da Educação Matrix.</p>
      </div>
    );
  }

  const { overview, schools } = dashboardData;

  const columns = [
    { header: 'Unidade Escolar', accessor: 'name', width: '40%' },
    { header: 'Cidade', render: (row) => `${row.city} / ${row.state}`, width: '30%' },
    { header: 'Total de Alunos', accessor: 'totalStudents', width: '15%' },
    { header: 'Professores', accessor: 'totalTeachers', width: '15%' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-header__title">Painel da Secretaria de Educação</h1>
        <p className="page-header__subtitle">Visão unificada e indicadores globais de todas as escolas da sua rede</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--primary-600)' }}>
            <Building size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Escolas Vinculadas</p>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>{overview.totalInstitutions}</h2>
          </div>
        </Card>

        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--success-50)', borderRadius: 'var(--radius-md)', color: 'var(--success-600)' }}>
            <Users size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Alunos Ativos (Rede)</p>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>{overview.totalStudents}</h2>
          </div>
        </Card>

        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', color: 'var(--warning-600)' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Corpo Docente</p>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>{overview.totalTeachers}</h2>
          </div>
        </Card>
      </div>

      <Card title="Relação de Unidades Escolares">
        <Table columns={columns} data={schools} />
      </Card>
    </div>
  );
}
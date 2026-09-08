import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await api.get('/api/student-panel/attendance');
        setAttendance(res.data.data || []);
      } catch (err) {
        console.error('Erro ao carregar frequência', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT': return <Badge variant="success">Presente</Badge>;
      case 'ABSENT': return <Badge variant="danger">Falta</Badge>;
      case 'JUSTIFIED': return <Badge variant="warning">Justificada</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { header: 'Data', render: (row) => new Date(row.lesson?.date).toLocaleDateString('pt-BR') },
    { header: 'Disciplina', render: (row) => row.lesson?.subject?.name || '-' },
    { header: 'Aula', render: (row) => row.lesson?.title || 'Chamada Regular' },
    { header: 'Status', render: (row) => getStatusBadge(row.status) }
  ];

  if (loading) return <Loading text="Carregando frequência..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Minha Frequência</h1>
          <p className="page-header__subtitle">Histórico de presenças e faltas nas aulas</p>
        </div>
      </div>

      <Card>
        {attendance.length > 0 ? (
          <Table columns={columns} data={attendance} />
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum registro de frequência encontrado.</p>
        )}
      </Card>
    </div>
  );
}
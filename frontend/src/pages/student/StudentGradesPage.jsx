import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Loading from '../../components/Loading';

export default function StudentGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrades() {
      try {
        const res = await api.get('/api/student-panel/grades');
        setGrades(res.data.data || []);
      } catch (err) {
        console.error('Erro ao carregar notas', err);
      } finally {
        setLoading(false);
      }
    }
    loadGrades();
  }, []);

  const columns = [
    { header: 'Disciplina', render: (row) => row.assessment?.subject?.name || '-' },
    { header: 'Avaliação', render: (row) => row.assessment?.name || '-' },
    { header: 'Período', render: (row) => row.assessment?.period?.name || '-' },
    { header: 'Nota Obtida', render: (row) => <strong>{row.value} / {row.assessment?.maxGrade || 10}</strong> }
  ];

  if (loading) return <Loading text="Carregando notas..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Minhas Notas</h1>
          <p className="page-header__subtitle">Acompanhe o lançamento de notas por avaliação</p>
        </div>
      </div>

      <Card>
        {grades.length > 0 ? (
          <Table columns={columns} data={grades} />
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhuma nota lançada até o momento.</p>
        )}
      </Card>
    </div>
  );
}
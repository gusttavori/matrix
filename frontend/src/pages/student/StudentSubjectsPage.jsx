import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { BookOpen, User } from 'lucide-react';

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get('/api/student-panel/subjects');
        setSubjects(res.data.data || []);
      } catch (err) {
        console.error('Erro ao carregar disciplinas', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  if (loading) return <Loading text="Carregando disciplinas..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Minhas Disciplinas</h1>
          <p className="page-header__subtitle">Matérias da sua turma e professores responsáveis</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {subjects.map((item) => (
          <Card key={item.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--primary-100)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <BookOpen size={24} color="var(--primary-600)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {item.subject?.name}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Série: {item.subject?.grade || 'Regular'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <User size={16} />
                  <span>Prof. {item.teacher?.name || 'Não atribuído'}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {subjects.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Card>
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhuma disciplina vinculada à sua turma.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
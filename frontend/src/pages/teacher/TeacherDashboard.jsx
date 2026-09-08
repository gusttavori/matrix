import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { BookOpen, Users, ArrowRight, Inbox } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]); // Inicialização segura como array vazio
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await api.get('/api/teacher-panel/classes');
        // Acessa corretamente res.data.data gerado pelo successResponse do back-end
        const fetchedData = res.data.data || [];
        setClasses(Array.isArray(fetchedData) ? fetchedData : []);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando turmas...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p className="text-secondary" style={{ marginBottom: '2rem' }}>
        Bem-vindo, {user?.name}
      </p>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Minhas Turmas e Disciplinas</h2>

      {classes.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--gray-100)', padding: '1rem', borderRadius: '50%' }}>
              <Inbox size={32} color="var(--text-tertiary)" />
            </div>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Nenhuma turma vinculada</h3>
          <p className="text-secondary">
            Você ainda não foi alocado em nenhuma turma/disciplina. Procure a secretaria da sua instituição.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* O map agora é à prova de falhas com optional chaining */}
          {classes?.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <BookOpen size={24} color="var(--primary-600)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-color)' }}>
                    {item.subject?.name}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={14} /> {item.class?.name}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', marginTop: 'auto' }}>
                <Link 
                  to={`/professor/caderneta/${item.classId}/${item.subjectId}`}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Acessar Caderneta <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
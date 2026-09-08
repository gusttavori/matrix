import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import { Book, GraduationCap, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/api/student-panel/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading || !data) return <Loading text="Carregando painel do aluno..." />;

  const { student, absencesTotal } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Olá, {user?.name.split(' ')[0]}!</h1>
          <p className="page-header__subtitle">Bem-vindo ao seu painel escolar</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-100)', padding: '1rem', borderRadius: '50%' }}>
              <GraduationCap size={24} color="var(--primary-600)" />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Turma Atual</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{student.class.name} ({student.class.grade})</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--danger-100)', padding: '1rem', borderRadius: '50%' }}>
              <AlertCircle size={24} color="var(--danger-600)" />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Total de Faltas (Ano)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: absencesTotal > 15 ? 'var(--danger-600)' : 'inherit' }}>
                {absencesTotal}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card title="Acesso Rápido">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            
            <Link to="/aluno/boletim" style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', cursor: 'pointer' }} className="hover-lift">
                <div style={{ backgroundColor: 'var(--info-100)', padding: '1rem', borderRadius: '50%' }}>
                  <FileText size={24} color="var(--info-600)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Boletim Escolar</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Veja suas notas e médias do ano letivo.</p>
                </div>
              </div>
            </Link>

            <Link to="/aluno/historico" style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', cursor: 'pointer' }} className="hover-lift">
                <div style={{ backgroundColor: 'var(--warning-100)', padding: '1rem', borderRadius: '50%' }}>
                  <Book size={24} color="var(--warning-600)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Histórico Escolar</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Sua progressão ao longo dos anos.</p>
                </div>
              </div>
            </Link>

          </div>
        </Card>
      </div>
    </div>
  );
}

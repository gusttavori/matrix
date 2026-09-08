import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import { History } from 'lucide-react';

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/api/student-panel/dashboard');
        setData(res.data.data.student);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) return <Loading text="Carregando histórico..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Histórico Escolar</h1>
          <p className="page-header__subtitle">Registros acadêmicos e progressão</p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--primary-100)', padding: '1rem', borderRadius: '50%' }}>
            <History size={24} color="var(--primary-600)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Matrícula: {data.enrollment}</h3>
            <p className="text-secondary">Status atual: <Badge variant="success">Ativo</Badge></p>
          </div>
        </div>

        <div style={{ borderLeft: '2px solid var(--border-color)', marginLeft: '1rem', paddingLeft: '2rem', position: 'relative' }}>
          
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{ position: 'absolute', left: '-33px', top: '0', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary-500)', border: '4px solid var(--bg-primary)' }}></div>
            <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-600)' }}>{data.class.schoolYear} (Cursando)</h4>
            <p style={{ marginTop: '0.25rem', fontWeight: '500' }}>{data.class.name} - {data.class.grade}</p>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Turno: {data.shift}</p>
          </div>

          <div style={{ position: 'relative', opacity: 0.6 }}>
            <div style={{ position: 'absolute', left: '-33px', top: '0', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--gray-300)', border: '4px solid var(--bg-primary)' }}></div>
            <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{data.class.schoolYear - 1}</h4>
            <p style={{ marginTop: '0.25rem' }}>Registro de anos anteriores será disponibilizado nas próximas atualizações.</p>
          </div>

        </div>
      </Card>
    </div>
  );
}

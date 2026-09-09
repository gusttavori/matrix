import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function ClosingTab({ classId, subjectId, periodId }) {
  const { error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (periodId) {
      loadClosingStatus();
    }
  }, [periodId]);

  const loadClosingStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teacher-reports/closing-status/${classId}/${subjectId}/${periodId}`);
      setData(res.data.data);
    } catch (err) {
      error('Erro ao verificar status de fechamento');
    } finally {
      setLoading(false);
    }
  };

  if (!periodId) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Selecione uma unidade ativa para verificar pendências.</p>
        </div>
      </Card>
    );
  }

  if (loading || !data) return <Loading text="Analisando pendências da unidade..." />;

  const { isReady, pendencies, stats, period } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {period.isClosed ? (
        <div style={{ backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--success-600)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--success-800)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Unidade Fechada</h3>
          <p style={{ color: 'var(--success-700)' }}>Esta unidade foi encerrada e os dados estão bloqueados para edição.</p>
        </div>
      ) : isReady ? (
        <div style={{ backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--success-600)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--success-800)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tudo Pronto!</h3>
          <p style={{ color: 'var(--success-700)' }}>Não há pendências de diário nesta unidade. Você está pronto para o fechamento.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--danger-50)', border: '1px solid var(--danger-200)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <AlertTriangle size={32} style={{ color: 'var(--danger-600)' }} />
            <h3 style={{ color: 'var(--danger-800)', fontWeight: 'bold', margin: 0 }}>Existem Pendências</h3>
          </div>
          <p style={{ color: 'var(--danger-700)', marginBottom: '1.5rem' }}>Resolva os itens abaixo antes de solicitar o fechamento da unidade à secretaria.</p>
          
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--danger-700)' }}>
            {pendencies.filter(p => p.type !== 'WARNING').map((p, idx) => (
              <li key={idx} style={{ fontWeight: '500' }}>{p.message.replace(/bimestre/gi, 'unidade')}</li>
            ))}
          </ul>
        </div>
      )}

      {pendencies.filter(p => p.type === 'WARNING').length > 0 && (
        <div style={{ backgroundColor: 'var(--warning-50)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Info size={24} style={{ color: 'var(--warning-600)' }} />
            <h4 style={{ color: 'var(--warning-800)', fontWeight: 'bold', margin: 0 }}>Avisos</h4>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem', color: 'var(--warning-700)', marginTop: '0.5rem' }}>
            {pendencies.filter(p => p.type === 'WARNING').map((p, idx) => (
              <li key={idx}>{p.message.replace(/bimestre/gi, 'unidade')}</li>
            ))}
          </ul>
        </div>
      )}

      <Card title="Resumo da Unidade">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)' }}>{stats.totalStudents}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Alunos Ativos</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)' }}>{stats.totalLessons}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Aulas Registradas</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)' }}>{stats.totalAssessments}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Avaliações</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)' }}>{stats.totalPoints}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Pontos Distribuídos</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Button variant="secondary" onClick={loadClosingStatus} size="sm">Atualizar Análise</Button>
        </div>
      </Card>
      
    </div>
  );
}
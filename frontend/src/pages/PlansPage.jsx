import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { Check } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await api.get('/api/plans');
        if (response.data.success) {
          setPlans(response.data.data);
        }
      } catch (err) {
        setError('Não foi possível carregar os planos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  if (loading) return <Loading text="Carregando planos..." />;
  if (error) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--danger-500)' }}>{error}</div>;

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nossos Planos</h1>
          <p className="text-secondary" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Escolha o plano ideal para o tamanho da sua instituição. Todos os planos incluem 14 dias de teste grátis.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
          {plans.map(plan => (
            <div key={plan.id} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', border: plan.price > 0 && plan.price < 200 ? '2px solid var(--primary-500)' : undefined }}>
              
              {plan.price > 0 && plan.price < 200 && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--primary-500)', color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  MAIS POPULAR
                </div>
              )}

              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h2>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary-600)' }}>
                R$ {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mês</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Check size={16} color="var(--success-500)" />
                  Até {plan.studentLimit} Alunos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Check size={16} color="var(--success-500)" />
                  Até {plan.teacherLimit} Professores
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Check size={16} color="var(--success-500)" />
                  Até {plan.classLimit} Turmas
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Check size={16} color="var(--success-500)" />
                  Caderneta Digital
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Check size={16} color="var(--success-500)" />
                  Suporte {plan.price === 0 ? 'Comunitário' : 'Prioritário'}
                </li>
              </ul>

              <Link to={`/cadastro?planId=${plan.id}`} style={{ width: '100%' }}>
                <Button 
                  block 
                  variant={plan.price > 0 && plan.price < 200 ? 'primary' : 'secondary'}
                >
                  Começar Teste Grátis
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

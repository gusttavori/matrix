import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { CreditCard, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubscriptionPage() {
  const { subscription } = useAuth();

  if (!subscription) return null;

  const getStatusBadge = (status) => {
    const badges = {
      TRIAL: { variant: 'warning', label: 'Período de Teste' },
      ACTIVE: { variant: 'success', label: 'Ativa' },
      PAST_DUE: { variant: 'danger', label: 'Pagamento Atrasado' },
      CANCELED: { variant: 'danger', label: 'Cancelada' },
      EXPIRED: { variant: 'neutral', label: 'Expirada' }
    };
    const b = badges[status] || { variant: 'neutral', label: status };
    return <Badge variant={b.variant}>{b.label}</Badge>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Assinatura e Plano</h1>
          <p className="page-header__subtitle">Gerencie o seu plano do Educação Matrix</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card title="Meu Plano Atual">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                {/* CORREÇÃO: Acessando o .name do objeto plan em vez de tentar renderizar o objeto inteiro */}
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {subscription.plan?.name || 'Plano Básico'}
                </div>
                <div className="text-secondary" style={{ marginTop: '0.25rem' }}>
                  Status: {getStatusBadge(subscription.status)}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--primary-100)', padding: '1rem', borderRadius: '50%' }}>
                <CreditCard size={32} color="var(--primary-600)" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 'bold' }}>Limites do Plano:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} color="var(--success-500)" />
                Atende às necessidades de alunos e professores
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/planos" style={{ flex: 1 }}>
                <Button block>Fazer Upgrade de Plano</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card title="Método de Pagamento">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p className="text-secondary">O gerenciamento de pagamentos será liberado na versão completa após o período de teste.</p>
            <Button variant="secondary" disabled>Atualizar Cartão de Crédito</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
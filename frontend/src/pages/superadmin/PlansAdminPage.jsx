import Card from '../../components/Card';
import { CreditCard } from 'lucide-react';

export default function PlansAdminPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Planos e Preços</h1>
          <p className="page-header__subtitle">Configuração dos pacotes de assinatura do SaaS</p>
        </div>
      </div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <CreditCard size={32} />
          <p>Módulo de configuração em construção. Aqui você ajustará os limites de alunos, funcionalidades e valores de cada pacote.</p>
        </div>
      </Card>
    </div>
  );
}
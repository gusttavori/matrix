import Card from '../../components/Card';
import { Building2 } from 'lucide-react';

export default function InstitutionsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Escolas Clientes</h1>
          <p className="page-header__subtitle">Gerenciamento de instituições parceiras do Educação Matrix</p>
        </div>
      </div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <Building2 size={32} />
          <p>Módulo de gestão de escolas em construção. Aqui você poderá adicionar, bloquear e analisar os dados cadastrais dos seus clientes.</p>
        </div>
      </Card>
    </div>
  );
}
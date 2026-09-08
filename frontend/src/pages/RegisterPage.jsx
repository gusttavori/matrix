import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { Building, User, CreditCard } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const preSelectedPlan = searchParams.get('planId');
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  
  const { register } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    institutionName: '',
    tradeName: '',
    document: '',
    phone: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    planId: preSelectedPlan || ''
  });

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/api/plans');
        if (res.data.success) {
          setPlans(res.data.data);
          if (!formData.planId && res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, planId: res.data.data[0].id.toString() }));
          }
        }
      } catch (err) {
        error('Erro ao carregar planos.');
      }
    }
    loadPlans();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.institutionName || !formData.tradeName) {
        error('Preencha os campos obrigatórios da instituição.');
        return;
      }
    } else if (step === 2) {
      if (!formData.adminName || !formData.email || !formData.password) {
        error('Preencha os dados do administrador.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        error('As senhas não coincidem.');
        return;
      }
      if (formData.password.length < 6) {
        error('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.planId) {
      error('Selecione um plano.');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        planId: parseInt(formData.planId, 10)
      };
      
      await register(dataToSubmit);
      success('Instituição cadastrada com sucesso! Bem-vindo.');
      navigate('/admin');
    } catch (err) {
      error(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="auth-container" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '2rem 1rem' 
      }}
    >
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          padding: '2.5rem', 
          margin: '0 auto' 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crie sua conta</h1>
          <p className="text-secondary">Cadastre sua instituição no Educação Matrix</p>
        </div>

        {/* Progresso */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'var(--gray-200)', zIndex: 1, transform: 'translateY(-50%)' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--primary-500)', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', transition: 'width 0.3s ease' }}></div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--primary-500)' : 'var(--gray-200)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              <Building size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: step >= 1 ? 'bold' : 'normal', color: step >= 1 ? 'var(--primary-600)' : 'var(--text-tertiary)' }}>Instituição</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= 2 ? 'var(--primary-500)' : 'var(--gray-200)', color: step >= 2 ? 'white' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.3s ease' }}>
              <User size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: step >= 2 ? 'bold' : 'normal', color: step >= 2 ? 'var(--primary-600)' : 'var(--text-tertiary)' }}>Administrador</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= 3 ? 'var(--primary-500)' : 'var(--gray-200)', color: step >= 3 ? 'white' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.3s ease' }}>
              <CreditCard size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: step >= 3 ? 'bold' : 'normal', color: step >= 3 ? 'var(--primary-600)' : 'var(--text-tertiary)' }}>Plano</span>
          </div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input id="institutionName" label="Razão Social" value={formData.institutionName} onChange={handleChange} required />
              <Input id="tradeName" label="Nome Fantasia" value={formData.tradeName} onChange={handleChange} required />
              <Input id="document" label="CNPJ" value={formData.document} onChange={handleChange} placeholder="00.000.000/0001-00" />
              <Input id="phone" label="Telefone" value={formData.phone} onChange={handleChange} placeholder="(00) 0000-0000" />
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input id="adminName" label="Nome do Administrador" value={formData.adminName} onChange={handleChange} required />
              <Input id="email" type="email" label="E-mail" value={formData.email} onChange={handleChange} required hint="Este será o login do administrador" />
              <Input id="password" type="password" label="Senha" value={formData.password} onChange={handleChange} required hint="Mínimo de 6 caracteres" />
              <Input id="confirmPassword" type="password" label="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p className="text-secondary" style={{ textAlign: 'center' }}>Escolha o plano ideal. Todos incluem 14 dias grátis.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plans.map(plan => (
                  <label key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: formData.planId === plan.id.toString() ? '2px solid var(--primary-500)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: formData.planId === plan.id.toString() ? 'var(--primary-50)' : 'transparent', transition: 'all 0.2s ease' }}>
                    <input 
                      type="radio" 
                      id="planId"
                      value={plan.id} 
                      checked={formData.planId === plan.id.toString()}
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-color)' }}>{plan.name}</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                        Até {plan.studentLimit} alunos
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-600)' }}>
                      R$ {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mês</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={prevStep} style={{ flex: 1 }}>
                Voltar
              </Button>
            )}
            <Button type="submit" variant="primary" style={{ flex: step === 1 ? '1' : '2' }} loading={isLoading}>
              {step === 3 ? 'Finalizar Cadastro' : 'Continuar'}
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
          <p className="text-secondary">
            Já possui uma conta?{' '}
            <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 'bold', textDecoration: 'none' }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
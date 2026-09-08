import { Link } from 'react-router-dom';
import { GraduationCap, CheckCircle, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero__content">
            <h1 className="landing-hero__title">
              Gestão Escolar <span className="text-primary-500">Inteligente</span> e <span className="text-primary-500">Simples</span>
            </h1>
            <p className="landing-hero__subtitle">
              Caderneta digital, controle de notas, frequência e acompanhamento completo.
              Tudo em uma única plataforma, feita para escolas do futuro.
            </p>
            <div className="landing-hero__actions">
              <Link to="/cadastro">
                <Button size="lg" iconRight={GraduationCap}>Começar agora</Button>
              </Link>
              <Link to="/planos">
                <Button variant="secondary" size="lg">Ver planos</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features container">
        <h2 className="features-title">Por que escolher o Educação Matrix?</h2>
        <div className="features-grid">
          
          <div className="feature-card card">
            <div className="feature-icon">
              <LayoutDashboard size={48} />
            </div>
            <h3>Dashboard Intuitivo</h3>
            <p className="text-secondary">
              Interface moderna e fácil de usar. Alunos, professores e secretaria no mesmo ambiente.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <CheckCircle size={48} />
            </div>
            <h3>Caderneta Digital</h3>
            <p className="text-secondary">
              Frequência e notas com poucos cliques. Economize tempo precioso dos seus professores.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <ShieldCheck size={48} />
            </div>
            <h3>Segurança Isolada</h3>
            <p className="text-secondary">
              Seus dados estão 100% seguros e isolados de outras instituições na nuvem.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
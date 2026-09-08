import { Link } from 'react-router-dom';
import { GraduationCap, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-grid">
          
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <GraduationCap size={28} className="text-primary-500" />
              <span className="brand-name">Educação Matrix</span>
            </Link>
            <p className="text-secondary footer-desc">
              Transformando a gestão escolar com tecnologia simples, segura e inteligente.
            </p>
            <div className="footer-socials">
              <a href="#" className="nav-link">Instagram</a>
              <a href="#" className="nav-link">LinkedIn</a>
              <a href="#" aria-label="Contato" style={{ color: 'var(--text-secondary)' }}>
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Produto</h4>
            <Link to="/planos">Planos e Preços</Link>
            <Link to="/funcionalidades">Funcionalidades</Link>
            <Link to="/atualizacoes">Atualizações</Link>
          </div>

          <div className="footer-links-col">
            <h4>Suporte</h4>
            <Link to="/central-ajuda">Central de Ajuda</Link>
            <Link to="/tutoriais">Tutoriais</Link>
            <Link to="/contato">Fale Conosco</Link>
          </div>

          <div className="footer-links-col">
            <h4>Legal</h4>
            <Link to="/termos">Termos de Uso</Link>
            <Link to="/privacidade">Política de Privacidade</Link>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="text-secondary">© 2026 Educação Matrix. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
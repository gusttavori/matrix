import { Link } from 'react-router-dom';
import Button from './Button';
import logoMatrix from '../assets/MATRIX.png'; 

export default function Navbar() {
  return (
    <header className="landing-navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <img 
            src={logoMatrix} 
            alt="Logo Educação Matrix" 
            style={{ 
              height: '36px', 
              width: 'auto', 
              borderRadius: '6px', 
              objectFit: 'contain' 
            }} 
          />
        </Link>
        <nav className="navbar-links">
          <Link to="/planos" className="nav-link">Planos</Link>
          <Link to="/login" className="nav-link">Entrar</Link>
          <Link to="/cadastro">
            <Button size="sm">Criar Instituição</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
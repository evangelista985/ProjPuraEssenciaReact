import { Link, useNavigate, useLocation, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cliente, logout } = useAuth();
  const { totalItens }      = useCart();
  const nav = useNavigate();
  const location = useLocation();

  function handleLogout() { logout(); nav('/'); }

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          Pura <span style={s.logoSpan}>Essência</span>
        </Link>

        {/* Links */}
        <div style={s.links}>
          <Link to="/"        style={s.link}>Vitrine</Link>

          {cliente ? (
            <>
              <Link to="/meus-pedidos" style={s.actionLink}>Meus Pedidos</Link>
              <span style={s.nome}>{cliente.nome.split(' ')[0]}</span>
              <button onClick={handleLogout} style={s.btnSair}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login"    style={s.actionLink}>Entrar</Link>
              <Link to="/cadastro" style={s.btnCadastro}>Cadastrar</Link>
            </>
          )}
          <Link to="/carrinho" style={s.cartBtn}>
            <span style={s.cartIcon}>🛒</span>
            {totalItens > 0 && <span style={s.badge}>{totalItens}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav:        { background: '#3A5D3E', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  inner:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  logo:       { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#D4AF37', textDecoration: 'none', fontWeight: 700, letterSpacing: 1 },
  links:      { display: 'flex', alignItems: 'center', gap: 18 },
  link:       { color: '#ecf0f1', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  nome:       { color: '#D4AF37', fontSize: 14, fontWeight: 700 },
  btnSair:    { background: 'transparent', border: '1px solid #ecf0f1', color: '#ecf0f1', padding: '6px 14px', borderRadius: 6, fontSize: 13 },
  btnCadastro:{ background: '#D4AF37', color: '#333', padding: '8px 16px', borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: 'none' },
  carrinho:   { color: '#ecf0f1', textDecoration: 'none', fontSize: 22, position: 'relative' },
  badge:      { position: 'absolute', top: -8, right: -8, background: '#D4AF37', color: '#333', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
};

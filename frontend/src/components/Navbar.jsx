import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cliente, logout } = useAuth();
  const { totalItens }      = useCart();
  const nav = useNavigate();
  const location = useLocation();

  function handleLogout() { logout(); nav('/'); }
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          Pura <span style={s.logoSpan}>Essência</span>
        </Link>

        {/* Categorias */}
        <ul style={s.navLinks}>
          <li>
            <Link to="/chas" style={{ ...s.catLink, ...(isActive('/chas') ? s.catActive : {}) }}>
              Chás & Ervas
            </Link>
          </li>
          <li>
            <Link to="/organicos" style={{ ...s.catLink, ...(isActive('/organicos') ? s.catActive : {}) }}>
              Orgânicos
            </Link>
          </li>
          <li>
            <Link to="/temperos" style={{ ...s.catLink, ...(isActive('/temperos') ? s.catActive : {}) }}>
              Temperos
            </Link>
          </li>
          <li>
            <Link to="/" style={{ ...s.catLink, ...(isActive('/') ? s.catActive : {}) }}>
              Vitrine
            </Link>
          </li>
        </ul>

        {/* Ações */}
        <div style={s.actions}>
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
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(245,240,232,0.96)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(200,169,110,0.25)',
    padding: '0 2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.6rem',
    fontWeight: 600,
    color: '#1C3A2A',
    letterSpacing: '0.04em',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoSpan: { color: '#C8A96E' },
  navLinks: {
    display: 'flex',
    gap: '2rem',
    listStyle: 'none',
  },
  catLink: {
    textDecoration: 'none',
    color: '#6B6050',
    fontSize: '0.78rem',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  catActive: { color: '#1C3A2A', borderBottom: '1px solid #C8A96E', paddingBottom: 2 },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexShrink: 0,
  },
  actionLink: {
    textDecoration: 'none',
    color: '#6B6050',
    fontSize: '0.78rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  nome: {
    color: '#A07840',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
  },
  btnSair: {
    background: 'transparent',
    border: '1px solid rgba(200,169,110,0.5)',
    color: '#6B6050',
    padding: '6px 14px',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  btnCadastro: {
    background: '#1C3A2A',
    color: '#F5F0E8',
    padding: '8px 18px',
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textDecoration: 'none',
  },
  cartBtn: {
    position: 'relative',
    color: '#1C3A2A',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0.4rem',
  },
  cartIcon: { fontSize: '1.2rem' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: '#1C3A2A',
    color: '#F5F0E8',
    borderRadius: '50%',
    width: 16,
    height: 16,
    fontSize: 9,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

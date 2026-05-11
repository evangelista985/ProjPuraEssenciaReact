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
      <div className="container" style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          🌿 PURA ESSÊNCIA
        </Link>

        {/* Links de Categoria */}
        <div style={s.categorias}>
          <Link to="/chas" style={s.catLink}>
  <img src="https://cdn-icons-png.flaticon.com/128/15746/15746086.png" alt="Chás" style={{ width: 26, height: 22, objectFit: 'contain', marginRight: 1  }} />
  Chás
          </Link>
          <Link to="/Organicos" style={s.catLink}>
  <img src="https://cdn-icons-png.flaticon.com/128/5110/5110652.png" alt="Orgânico" style={{ width: 26, height: 22, objectFit: 'contain', marginRight: 1  }} />
  Orgânico
          </Link>
            <Link to="/temperos" style={s.catLink}>
  <img src="https://cdn-icons-png.flaticon.com/128/1730/1730509.png" alt="temperos" style={{ width: 26, height: 22, objectFit: 'contain', marginRight: 1  }} />
  Temperos
          </Link>
        </div>

        {/* Links de Usuário */}
        <div style={s.links}>
          <Link to="/" style={{ ...s.link, ...(isActive('/') ? s.linkActive : {}) }}>
            Vitrine
          </Link>

          {cliente ? (
            <>
              <Link to="/meus-pedidos" style={s.link}>Meus Pedidos</Link>
              <span style={s.nome}>Olá, {cliente.nome.split(' ')[0]}!</span>
              <button onClick={handleLogout} style={s.btnSair}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login"    style={s.link}>Entrar</Link>
              <Link to="/cadastro" style={s.btnCadastro}>Cadastrar</Link>
            </>
          )}

          <Link to="/carrinho" style={s.carrinho}>
            🛒 {totalItens > 0 && <span style={s.badge}>{totalItens}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav:          { background: '#3A5D3E', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  inner:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 16 },
  logo:         { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#D4AF37', textDecoration: 'none', fontWeight: 700, letterSpacing: 1, flexShrink: 0 },

  // Categorias destacadas
  categorias:   { display: 'flex', alignItems: 'center', gap: 4 },
  catLink:      {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'background 0.2s, color 0.2s',
  },
  catLinkActive: {
    background: 'rgba(212,175,55,0.2)',
    color: '#D4AF37',
  },

  links:        { display: 'flex', alignItems: 'center', gap: 14 },
  link:         { color: '#ecf0f1', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  linkActive:   { color: '#D4AF37' },
  nome:         { color: '#D4AF37', fontSize: 14, fontWeight: 700 },
  btnSair:      { background: 'transparent', border: '1px solid #ecf0f1', color: '#ecf0f1', padding: '6px 14px', borderRadius: 6, fontSize: 13 },
  btnCadastro:  { background: '#D4AF37', color: '#333', padding: '8px 16px', borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: 'none' },
  carrinho:     { color: '#ecf0f1', textDecoration: 'none', fontSize: 22, position: 'relative' },
  badge:        { position: 'absolute', top: -8, right: -8, background: '#D4AF37', color: '#333', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
};

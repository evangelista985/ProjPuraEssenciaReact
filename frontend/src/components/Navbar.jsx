import { Link, useNavigate, useLocation, } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cliente, logout } = useAuth();
  const { totalItens } = useCart();
  const nav = useNavigate();
  const location = useLocation();
  const [showProdutosMenu, setShowProdutosMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Detectar se está em página com fundo verde
  const isGreenBgPage = ['/chas', '/organicos', '/temperos', '/cosmeticos'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    logout();
    nav('/');
  }

  function handleSearch() {
    if (searchValue.trim()) {
      nav(`/produtos?search=${encodeURIComponent(searchValue)}`);
      setSearchValue('');
    }
  }


  return (
    <nav style={{...s.nav, ...(isScrolled ? s.navScrolled : {}), ...(isGreenBgPage && isScrolled ? s.navScrolledGreen : {}), ...(isGreenBgPage && !isScrolled ? s.navGreenBg : {})}}>
      <div style={s.container}>
        {/* Logo */}
        <Link to="/produtos" style={s.logo}>
          <img
            src="/img/logonova.png"
            alt="Pura Essência"
            style={s.logoImg}
          />
        </Link>

        {/* Menu Central */}
        <div style={s.menuCentral}>
          <button 
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                nav('/');
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }
            }}
              style={{...s.menuLink, ...(isActive('/') ? s.activeLink : {}), ...(isGreenBgPage && !isScrolled ? s.menuLinkGreen : {}), ...(isGreenBgPage && isScrolled ? s.menuLinkScrolled : {})}}          >
            Início
          </button>
          
          <div
            style={s.menuItem}
            onMouseEnter={() => setShowProdutosMenu(true)}
            onMouseLeave={() => setShowProdutosMenu(false)}
          >
            <button style={{...s.menuLink, ...(location.pathname.includes('produtos') || ['/chas', '/organicos', '/temperos', '/cosmeticos'].includes(location.pathname) ? s.activeLink : {}), ...(isGreenBgPage && !isScrolled ? s.menuLinkGreen : {}), ...(isGreenBgPage && isScrolled ? s.menuLinkScrolled : {})}}>
              Produtos <span style={{fontSize: '0.6rem', marginLeft: 4}}>▼</span>
            </button>
            {/* Ponte invisível para manter o hover contínuo entre o botão e o submenu */}
            {showProdutosMenu && (
              <div style={s.submenuBridge} />
            )}
            {showProdutosMenu && (
              <div style={s.submenu}>
                <Link to="/produtos" style={s.submenuLink}>Todos os Produtos</Link>
                <Link to="/chas" style={s.submenuLink}>Chás Especiais</Link>
                <Link to="/organicos" style={s.submenuLink}>Orgânicos Selecionados</Link>
                <Link to="/temperos" style={s.submenuLink}>Temperos & Especiarias</Link>
                <Link to="/cosmeticos" style={s.submenuLink}>Cosméticos Naturais</Link>
              </div>
            )}
          </div>

          <a href="/#sobre" style={{...s.menuLink, ...(isGreenBgPage && !isScrolled ? s.menuLinkGreen : {}), ...(isGreenBgPage && isScrolled ? s.menuLinkScrolled : {})}}>Sobre</a>
          <button
            style={{...s.menuLink, ...(isGreenBgPage && !isScrolled ? s.menuLinkGreen : {}), ...(isGreenBgPage && isScrolled ? s.menuLinkScrolled : {})}}
            onClick={() => {
              const footer = document.querySelector('footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            Contato
          </button>
        </div>

        {/* Barra de Busca e Ações */}
        <div style={s.actions}>
          <div style={s.searchWrap}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={s.searchInput}
            />
            <button onClick={handleSearch} style={s.searchBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>

          <div style={s.userActions}>
            {cliente ? (
              <div style={s.userMenu}>
                <span style={s.nome}>Olá, {cliente.nome.split(' ')[0]}</span>
                <Link to="/meus-pedidos" style={s.iconLink} title="Meus Pedidos">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </Link>
                <button onClick={handleLogout} style={s.btnLogout} title="Sair">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <Link to="/login" style={{...s.loginBtn, ...(isGreenBgPage && !isScrolled ? s.loginBtnGreen : {})}}>Entrar</Link>
            )}

            <Link to="/carrinho" style={{...s.carrinho, ...(isGreenBgPage && !isScrolled ? s.carrinhoGreen : {})}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {totalItens > 0 && <span style={s.badge}>{totalItens}</span>}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'transparent',
    height: 70,
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  navScrolled: {
    background: 'rgba(255, 255, 255, 0.98)',
    height: 70,
    boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(12px)',
  },
  navGreenBg: {
    background: 'rgba(45, 90, 61, 0.15)',
    backdropFilter: 'blur(8px)',
  },
  navScrolledGreen: {
    background: 'rgba(255, 255, 255, 0.98)',
    height: 70,
    boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(12px)',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logo: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  logoImg: {
    height: '60px',
    width: 'auto',
    display: 'block',
    objectFit: 'contain',
  },
  menuCentral: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  menuItem: {
    position: 'relative',
  },
  menuLink: {
    background: 'none',
    border: 'none',
    color: '#4A4A4A',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'color 0.2s',
    fontFamily: "'Jost', sans-serif",
  },
  activeLink: {
    color: '#1C3A2A',
    borderBottom: '2px solid #C8A96E',
  },
  menuLinkGreen: {
    color: '#C8A96E',
    textShadow: '0 1px 4px rgba(0,0,0,0.25)',
    fontWeight: 600,
  },
  menuLinkScrolled: {
    color: '#1C3A2A',
  },
  submenuBridge: {
    position: 'absolute',
    top: '100%',
    left: '-20px',
    right: '-20px',
    height: '16px',
    zIndex: 1000,
  },
  submenu: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#FFFFFF',
    borderRadius: '8px',
    minWidth: '220px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    padding: '0 0 12px',
    paddingTop: '16px',
    marginTop: '0px',
    zIndex: 1001,
    border: '1px solid #F0F0F0',
  },
  submenuLink: {
    display: 'block',
    padding: '10px 24px',
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    background: '#F5F5F5',
    borderRadius: '20px',
    padding: '5px 15px',
    border: '1px solid #EAEAEA',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100px',
    padding: '4px 0',
  },
  searchBtn: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
  },
  nome: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#1C3A2A',
  },
  iconLink: {
    color: '#4A4A4A',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  btnLogout: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  loginBtn: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#1C3A2A',
    textDecoration: 'none',
    border: '1px solid #1C3A2A',
    padding: '6px 16px',
    borderRadius: '20px',
    transition: 'all 0.2s',
  },
  loginBtnGreen: {
    color: '#C8A96E',
    borderColor: '#C8A96E',
  },
  carrinho: {
    color: '#1C3A2A',
    textDecoration: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  carrinhoGreen: {
    color: '#C8A96E',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    background: '#C8A96E',
    color: '#FFF',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    border: '2px solid #FFF',
  },
};

import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProdutosOpen, setMobileProdutosOpen] = useState(false);

  const isGreenBgPage = ['/chas','/organicos','/temperos','/cosmeticos'].includes(location.pathname);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setMobileProdutosOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function handleLogout() { logout(); nav('/'); setMobileOpen(false); }

  function handleSearch() {
    if (searchValue.trim()) {
      nav(`/produtos?search=${encodeURIComponent(searchValue)}`);
      setSearchValue('');
      setMobileOpen(false);
    }
  }

  const navBg = isScrolled
    ? 'rgba(255,255,255,0.98)'
    : isGreenBgPage ? 'rgba(45,90,61,0.15)' : 'transparent';

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        height:70, display:'flex', alignItems:'center',
        background: navBg,
        boxShadow: isScrolled ? '0 4px 25px rgba(0,0,0,0.08)' : 'none',
        backdropFilter: (isScrolled || isGreenBgPage) ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',gap:'1rem'}}>

          {/* Logo */}
          <Link to="/produtos" style={{textDecoration:'none',display:'flex',alignItems:'center',flexShrink:0}}>
            <img src="/img/logonova.png" alt="Pura Essência" style={{height:54,width:'auto',objectFit:'contain'}} />
          </Link>

          {/* ── Menu Central (desktop) ── */}
          <div style={s.menuCentral} className="nav-desktop">
            <button onClick={() => { if(location.pathname==='/'){window.scrollTo({top:0,behavior:'smooth'});}else{nav('/');setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),100);} }}
              style={{...s.menuLink,...(location.pathname==='/' ? s.activeLink : {}),...(isGreenBgPage&&!isScrolled ? s.menuLinkGreen : {}),...(isGreenBgPage&&isScrolled ? s.menuLinkScrolled : {})}}>
              Início
            </button>

            <div style={{position:'relative'}} onMouseEnter={()=>setShowProdutosMenu(true)} onMouseLeave={()=>setShowProdutosMenu(false)}>
              <button style={{...s.menuLink,...(['/produtos','/chas','/organicos','/temperos','/cosmeticos'].some(p=>location.pathname.includes(p.replace('/',''))) ? s.activeLink : {}),...(isGreenBgPage&&!isScrolled ? s.menuLinkGreen : {}),...(isGreenBgPage&&isScrolled ? s.menuLinkScrolled : {})}}>
                Produtos <span style={{fontSize:'0.6rem',marginLeft:4}}>▼</span>
              </button>
              {showProdutosMenu && (<>
                <div style={{position:'absolute',top:'100%',left:'-20px',right:'-20px',height:16,zIndex:1000}} />
                <div style={s.submenu}>
                  {[['Todos os Produtos','/produtos'],['Chás Especiais','/chas'],['Orgânicos Selecionados','/organicos'],['Temperos & Especiarias','/temperos'],['Cosméticos Naturais','/cosmeticos']].map(([label,path])=>(
                    <Link key={path} to={path} style={s.submenuLink}
                      onMouseEnter={e=>{e.target.style.color='#1C3A2A';e.target.style.paddingLeft='30px';}}
                      onMouseLeave={e=>{e.target.style.color='#666';e.target.style.paddingLeft='24px';}}>{label}</Link>
                  ))}
                </div>
              </>)}
            </div>

            <a href="/#sobre" style={{...s.menuLink,...(isGreenBgPage&&!isScrolled ? s.menuLinkGreen : {}),...(isGreenBgPage&&isScrolled ? s.menuLinkScrolled : {})}}>Sobre</a>
            <button style={{...s.menuLink,...(isGreenBgPage&&!isScrolled ? s.menuLinkGreen : {}),...(isGreenBgPage&&isScrolled ? s.menuLinkScrolled : {})}}
              onClick={()=>{const f=document.querySelector('footer');if(f)f.scrollIntoView({behavior:'smooth',block:'start'});}}>
              Contato
            </button>
          </div>

          {/* ── Actions (desktop) ── */}
          <div style={s.actions} className="nav-desktop">
            <div style={{display:'flex',alignItems:'center',background:'#F5F5F5',borderRadius:20,padding:'5px 15px',border:'1px solid #EAEAEA'}}>
              <input type="text" placeholder="Buscar..." value={searchValue} onChange={e=>setSearchValue(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()} style={{background:'none',border:'none',fontSize:'0.85rem',outline:'none',width:100,padding:'4px 0',fontFamily:'Montserrat,sans-serif'}} />
              <button onClick={handleSearch} style={{background:'none',border:'none',color:'#999',cursor:'pointer',display:'flex',alignItems:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
              {cliente ? (
                <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                  <span style={{fontSize:'0.85rem',fontWeight:600,color:'#1C3A2A'}}>Olá, {cliente.nome.split(' ')[0]}</span>
                  <Link to="/meus-pedidos" style={{color:'#4A4A4A',display:'flex',alignItems:'center'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </Link>
                  <button onClick={handleLogout} style={{background:'none',border:'none',color:'#999',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </button>
                </div>
              ) : (
                <Link to="/login" style={{fontSize:'0.85rem',fontWeight:600,color: isGreenBgPage&&!isScrolled ? '#C8A96E':'#1C3A2A',textDecoration:'none',border:`1px solid ${isGreenBgPage&&!isScrolled ? '#C8A96E':'#1C3A2A'}`,padding:'6px 16px',borderRadius:20}}>Entrar</Link>
              )}
              <Link to="/carrinho" style={{color: isGreenBgPage&&!isScrolled ? '#C8A96E':'#1C3A2A',textDecoration:'none',position:'relative',display:'flex',alignItems:'center'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {totalItens>0&&<span style={{position:'absolute',top:-8,right:-10,background:'#C8A96E',color:'#FFF',borderRadius:'50%',width:18,height:18,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,border:'2px solid #FFF'}}>{totalItens}</span>}
              </Link>
            </div>
          </div>

          {/* ── Mobile: carrinho + hamburguer ── */}
          <div style={{display:'none',alignItems:'center',gap:'1rem'}} className="nav-mobile">
            <Link to="/carrinho" style={{color: isGreenBgPage&&!isScrolled ? '#C8A96E':'#1C3A2A',textDecoration:'none',position:'relative',display:'flex',alignItems:'center'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {totalItens>0&&<span style={{position:'absolute',top:-8,right:-10,background:'#C8A96E',color:'#FFF',borderRadius:'50%',width:18,height:18,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,border:'2px solid #FFF'}}>{totalItens}</span>}
            </Link>
            <button className="navbar-hamburger" onClick={()=>setMobileOpen(true)} aria-label="Abrir menu"
              style={{color: isGreenBgPage&&!isScrolled ? '#C8A96E':'#1C3A2A'}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Overlay ── */}
      <div className={`navbar-mobile-overlay${mobileOpen?' open':''}`} onClick={()=>setMobileOpen(false)} />

      {/* ── Drawer Mobile ── */}
      <div className={`navbar-mobile-menu${mobileOpen?' open':''}`}>
        <div className="navbar-mobile-menu-header">
          <Link to="/produtos" style={{textDecoration:'none'}} onClick={()=>setMobileOpen(false)}>
            <img src="/img/logonova.png" alt="Pura Essência" style={{height:44,objectFit:'contain'}} />
          </Link>
          <button onClick={()=>setMobileOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',padding:4,display:'flex'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="navbar-mobile-menu-body">
          <button className="navbar-mobile-link" onClick={()=>{nav('/');setMobileOpen(false);}}>Início</button>

          <button className="navbar-mobile-link" onClick={()=>setMobileProdutosOpen(v=>!v)}>
            <span>Produtos</span>
            <span style={{fontSize:'0.6rem',transition:'transform 0.2s',display:'inline-block',transform:mobileProdutosOpen?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
          </button>
          {mobileProdutosOpen&&(
            <div className="navbar-mobile-submenu">
              {[['Todos os Produtos','/produtos'],['Chás Especiais','/chas'],['Orgânicos Selecionados','/organicos'],['Temperos & Especiarias','/temperos'],['Cosméticos Naturais','/cosmeticos']].map(([label,path])=>(
                <Link key={path} to={path} onClick={()=>setMobileOpen(false)}>{label}</Link>
              ))}
            </div>
          )}

          <a href="/#sobre" className="navbar-mobile-link" onClick={()=>setMobileOpen(false)}>Sobre</a>
          <button className="navbar-mobile-link" onClick={()=>{const f=document.querySelector('footer');if(f)f.scrollIntoView({behavior:'smooth'});setMobileOpen(false);}}>Contato</button>
        </div>

        {/* Busca mobile */}
        <div style={{padding:'1rem 1.5rem',borderTop:'1px solid #F0F0F0'}}>
          <div style={{display:'flex',gap:8}}>
            <input type="text" placeholder="Buscar produtos..." value={searchValue} onChange={e=>setSearchValue(e.target.value)}
              onKeyPress={e=>{if(e.key==='Enter'){handleSearch();}}}
              style={{flex:1,padding:'10px 14px',fontSize:14,borderRadius:20,border:'1px solid #EAEAEA',outline:'none',fontFamily:'Montserrat,sans-serif'}} />
            <button onClick={handleSearch} style={{background:'#1C3A2A',color:'#fff',border:'none',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
        </div>

        <div className="navbar-mobile-actions">
          {cliente ? (
            <>
              <div style={{fontSize:'0.88rem',color:'#6B6050',paddingBottom:4}}>Olá, <strong style={{color:'#1C3A2A'}}>{cliente.nome.split(' ')[0]}</strong></div>
              <Link to="/meus-pedidos" onClick={()=>setMobileOpen(false)}
                style={{display:'flex',alignItems:'center',gap:8,color:'#1C3A2A',textDecoration:'none',fontSize:'0.9rem',fontWeight:600,padding:'6px 0'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Meus Pedidos
              </Link>
              <button onClick={handleLogout} style={{background:'#F5F5F5',color:'#666',padding:'10px',borderRadius:8,fontSize:'0.88rem',fontWeight:600,textAlign:'center',width:'100%',cursor:'pointer',border:'none',fontFamily:'Montserrat,sans-serif'}}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={()=>setMobileOpen(false)} style={{display:'block',background:'#1C3A2A',color:'#F5F0E8',padding:'12px',borderRadius:8,fontSize:'0.88rem',fontWeight:700,textAlign:'center',textDecoration:'none',letterSpacing:'0.08em',textTransform:'uppercase'}}>Entrar</Link>
              <Link to="/cadastro" onClick={()=>setMobileOpen(false)} style={{display:'block',background:'transparent',color:'#1C3A2A',padding:'12px',borderRadius:8,fontSize:'0.88rem',fontWeight:700,textAlign:'center',textDecoration:'none',letterSpacing:'0.08em',textTransform:'uppercase',border:'1px solid #1C3A2A'}}>Cadastrar</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .nav-desktop { display: flex; }
        .nav-mobile  { display: none !important; }
        .navbar-hamburger { display: none; }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
          .navbar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

const s = { 
  menuCentral: { 
    display: "flex", 
    alignItems: "center", 
    gap: "2rem" 
  }, 
  menuLink: { 
    background: "none", 
    border: "none", 
    color: "#4A4A4A", 
    textDecoration: "none", 
    fontSize: "0.85rem", 
    fontWeight: 500, 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
    cursor: "pointer", 
    padding: "8px 0", 
    paddingBottom: "8px", 
    transition: "color 0.2s, box-shadow 0.2s", 
    fontFamily: "Jost, sans-serif", 
    display: "inline-flex", 
    alignItems: "center", 
    lineHeight: 1 
  }, 
  activeLink: { 
    color: "#1C3A2A", 
    boxShadow: "inset 0 -2px 0 #C8A96E" 
  }, 
  menuLinkGreen: { 
    color: "#C8A96E", 
    textShadow: "0 1px 4px rgba(0,0,0,0.25)", 
    fontWeight: 600 
  }, 
  menuLinkScrolled: { 
    color: "#1C3A2A" 
  }, 
  submenu: { 
    position: "absolute", 
    top: "calc(100% + 8px)", 
    left: "50%", 
    transform: "translateX(-50%)", 
    background: "#FFFFFF", 
    borderRadius: 8, 
    minWidth: 220, 
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)", 
    padding: "12px 0", 
    zIndex: 1001, 
    border: "1px solid #F0F0F0" 
  }, 
  submenuLink: { 
    display: "block", 
    padding: "10px 24px", 
    color: "#666", 
    textDecoration: "none", 
    fontSize: "0.9rem", 
    transition: "all 0.2s" 
  }, 
  actions: { 
    display: "flex", 
    alignItems: "center", 
    gap: "1.5rem" 
  }
};


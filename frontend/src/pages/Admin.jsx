import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

export function AdminLogin() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const { loginAdmin } = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setErro('');
    try {
      const { data } = await api.post('/admin/login', form);
      loginAdmin(data.token, data.usuario);
      nav('/admin/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Credenciais inválidas');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3A5D3E' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/img/logonova.png" alt="Pura Essência" style={{ height: '70px', objectFit: 'contain', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
          <h2 style={{ marginTop: 8 }}>Área Administrativa</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={st.label}>E-mail</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@puraessencia.com" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={st.label}>Senha</label>
            <input type="password" required value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="••••••" />
          </div>
          {erro && <p className="erro" style={{ marginBottom: 12 }}>{erro}</p>}
          <button type="submit" className="btn-verde" style={{ width: '100%' }}>Entrar</button>
        </form>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!admin) { nav('/admin/login'); return null; }

  function handleLogout() { logout(); nav('/admin/login'); }

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const badgeCor = { admin: 'badge-vermelho', gerente: 'badge-azul', vendedor: 'badge-verde' };

  const navLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/produtos',  icon: '🌿', label: 'Produtos' },
    { to: '/admin/pedidos',   icon: '📦', label: 'Pedidos' },
    ...(admin.nivel !== 'vendedor' ? [
      { to: '/admin/usuarios', icon: '👥', label: 'Usuários' },
      { to: '/admin/cupons',   icon: '🏷️', label: 'Cupons' },
    ] : []),
  ];

  return (
    <div className="admin-wrapper">

      {/* ════════════════════════════════
          SIDEBAR — visível só no desktop
          ════════════════════════════════ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/img/logonova.png" alt="Pura Essência" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #2E4D37' }}>
          <p style={{ fontSize: 13, color: '#c8d8c9' }}>{admin.nome}</p>
          <span className={`badge ${badgeCor[admin.nivel] || 'badge-cinza'}`} style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
            {admin.nivel}
          </span>
        </div>
        <nav>
          {navLinks.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}>{icon} {label}</NavLink>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <button onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid #c8d8c9', color: '#c8d8c9', padding: '8px 0', borderRadius: 8, fontSize: 13, width: '100%' }}>
            Sair
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          CONTEÚDO PRINCIPAL
          ════════════════════════════════ */}
      <main className="admin-main">

        {/* ── Topbar mobile (logo + hamburguer) ── */}
        <div className="admin-mobile-header">
          <img src="/img/logonova.png" alt="Pura Essência" style={{ height: 36, objectFit: 'contain' }} />
          <button className="admin-hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Overlay + Drawer lateral mobile ── */}
        <div className={`admin-mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
        <div className={`admin-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="admin-mobile-drawer-header">
            <img src="/img/logonova.png" alt="Pura Essência" style={{ height: 32, objectFit: 'contain' }} />
            <button className="admin-mobile-drawer-close" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: '14px 20px', borderBottom: '1px solid #2E4D37' }}>
            <p style={{ fontSize: 13, color: '#c8d8c9' }}>{admin.nome}</p>
            <span className={`badge ${badgeCor[admin.nivel] || 'badge-cinza'}`} style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
              {admin.nivel}
            </span>
          </div>

          <nav className="admin-mobile-drawer-nav">
            {navLinks.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className="admin-mobile-drawer-link">
                <span>{icon}</span> {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ padding: 20 }}>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              style={{ background: 'transparent', border: '1px solid #c8d8c9', color: '#c8d8c9', padding: '10px 0', borderRadius: 8, fontSize: 13, width: '100%' }}>
              🚪 Sair
            </button>
          </div>
        </div>

        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const st = {
  label: { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' },
};

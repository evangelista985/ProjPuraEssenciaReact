import { useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!admin) { nav('/admin/login'); return null; }

  function handleLogout() { logout(); nav('/admin/login'); }

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
      {/* Overlay para fechar sidebar no mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1040 }}
        />
      )}

      {/* ── Sidebar (desktop) ── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/img/logonova.png" alt="Pura Essência" style={{ height: '50px', objectFit: 'contain' }} />
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1, display: 'none' }}
            className="admin-sidebar-close"
            aria-label="Fechar menu"
          >✕</button>
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #2E4D37' }}>
          <p style={{ fontSize: 13, color: '#c8d8c9' }}>{admin.nome}</p>
          <span className={`badge ${badgeCor[admin.nivel] || 'badge-cinza'}`} style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
            {admin.nivel}
          </span>
        </div>
        <nav onClick={() => setSidebarOpen(false)}>
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

      <main className="admin-main">
        {/* ── Header mobile com logo + hamburguer ── */}
        <div className="admin-mobile-header">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Abrir menu"
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#3A5D3E', padding: '4px 8px', lineHeight: 1 }}
          >☰</button>
          <img src="/img/logonova.png" alt="Pura Essência" style={{ height: 36, objectFit: 'contain' }} />
          <div style={{ width: 40 }} />
        </div>

        {/* ── Navbar de navegação rápida mobile ── */}
        <div className="admin-mobile-nav">
          <div className="admin-mobile-nav-inner">
            {/* Info do admin */}
            <div className="admin-mobile-nav-user">
              <span style={{ fontSize: 12, color: '#c8d8c9' }}>{admin.nome.split(' ')[0]}</span>
              <span className={`badge ${badgeCor[admin.nivel] || 'badge-cinza'}`} style={{ fontSize: 9, marginLeft: 6 }}>
                {admin.nivel}
              </span>
            </div>
            {/* Links de navegação */}
            {navLinks.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className="admin-mobile-nav-link">
                <span className="admin-mobile-nav-icon">{icon}</span>
                <span className="admin-mobile-nav-label">{label}</span>
              </NavLink>
            ))}
            {/* Botão sair */}
            <button onClick={handleLogout} className="admin-mobile-nav-sair">
              Sair
            </button>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

const st = {
  label: { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' },
};

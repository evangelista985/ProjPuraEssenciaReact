import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { totalItens } = useCart();
  const { cliente } = useAuth();
  const p = location.pathname;

  const items = [
    {
      to: '/',
      label: 'Início',
      active: p === '/',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      to: '/produtos',
      label: 'Produtos',
      active: ['/produtos','/chas','/organicos','/temperos','/cosmeticos'].some(x => p.startsWith(x)),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
    {
      to: '/carrinho',
      label: 'Carrinho',
      active: p === '/carrinho',
      badge: totalItens > 0 ? totalItens : null,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      ),
    },
    {
      to: cliente ? '/meus-pedidos' : '/login',
      label: cliente ? 'Pedidos' : 'Entrar',
      active: p === '/meus-pedidos' || p === '/login',
      icon: cliente ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map(item => (
        <Link key={item.to} to={item.to} className={`mobile-bottom-nav__item${item.active ? ' active' : ''}`}>
          <span className="mobile-bottom-nav__icon">
            {item.icon}
            {item.badge && <span className="mobile-bottom-nav__badge">{item.badge}</span>}
          </span>
          <span className="mobile-bottom-nav__label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

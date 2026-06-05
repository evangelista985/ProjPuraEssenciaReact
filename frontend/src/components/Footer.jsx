import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/',             label: 'Vitrine' },
  { to: '/produtos',     label: 'Produtos' },
  { to: '/carrinho',     label: 'Carrinho' },
  { to: '/meus-pedidos', label: 'Meus Pedidos' },
  { to: '/login',        label: 'Entrar' },
  { to: '/cadastro',     label: 'Cadastrar' },
];

const REDES = [
  { href: 'https://www.facebook.com/friends/requests/?profile_id=100092841157612',    icon: 'f',  label: 'Facebook' },
  { href: 'https://www.instagram.com/pura_essencia.official/',   icon: '◈',  label: 'Instagram' },
  { href: 'https://wa.me/5511981992048', icon: '◉',  label: 'WhatsApp' },
  { href: 'https://x.com/PuraEssenc91630',              icon: '𝕏',  label: 'Twitter / X' },
];

export default function Footer() {
  return (
    <footer id="contato" style={s.footer}>
      {/* Faixa superior decorativa */}
      <div style={s.topBar} />

      <div style={s.inner}>
        <div style={s.grid}>

          {/* Marca */}
          <div style={s.colBrand}>
            <div style={s.logoWrap}>
              <span style={s.logoDot}>●</span>
              <span style={s.logoText}>Pura Essência</span>
            </div>
            <p style={s.slogan}>
              Da natureza direto para você.<br />
              Saúde, sabor e bem-estar em cada produto.
            </p>
            <div style={s.selos}>
              <span style={s.selo}>🌿 100% Natural</span>
              <span style={s.selo}>📜 Certificado</span>
            </div>
          </div>

          {/* Navegação */}
          <div style={s.col}>
            <h4 style={s.colTitulo}>Navegação</h4>
            <ul style={s.lista}>
              {LINKS.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    style={s.link}
                    onMouseEnter={e => { e.target.style.color = '#C8A96E'; e.target.style.paddingLeft = '6px'; }}
                    onMouseLeave={e => { e.target.style.color = '#9BB89D'; e.target.style.paddingLeft = '0'; }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div style={s.col}>
            <h4 style={s.colTitulo}>Contato</h4>
            <ul style={s.listaContato}>
              <li style={s.contatoItem}>
                <span style={s.contatoIcon}>📍</span>
                <span>R. Guiapá, 678 – Vila Leopoldina<br />CEP 05089-001 – São Paulo, SP</span>
              </li>
              <li style={s.contatoItem}>
                <span style={s.contatoIcon}>📞</span>
                <span>(11) 3456-7890</span>
              </li>
              <li style={s.contatoItem}>
                <span style={s.contatoIcon}>✉️</span>
                <span>puraessenciaetec@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Redes + Pagamentos */}
          <div style={s.col}>
            <h4 style={s.colTitulo}>Redes Sociais</h4>
            <div style={s.redesWrap}>
              {REDES.map(r => (
                <a
                  key={r.label}
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  style={s.redesLink}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(200,169,110,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(200,169,110,0.45)';
                    e.currentTarget.style.color = '#C8A96E';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#9BB89D';
                  }}
                >
                  <span style={s.redesIcone}>{r.icon}</span>
                  <span style={s.redesLabel}>{r.label}</span>
                </a>
              ))}
            </div>

            <div style={s.pagamentos}>
              <h4 style={{ ...s.colTitulo, marginTop: '1.8rem' }}>Formas de Pagamento</h4>
              <div style={s.pagRow}>
                {['PIX', 'Cartão', 'Boleto'].map(p => (
                  <span key={p} style={s.pagBadge}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div style={s.divider} />

        {/* Bottom bar */}
        <div style={s.bottom}>
          <p style={s.copyright}>
            © {new Date().getFullYear()} <strong style={{ color: '#C8A96E' }}>Pura Essência</strong> — Todos os direitos reservados.
          </p>
          <p style={s.madeWith}>
            Feito com <span style={{ color: '#4CAF82' }}>♥</span> e respeito à natureza
          </p>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: 'linear-gradient(160deg, #1A3628 0%, #1C3A2A 40%, #1E4030 100%)',
    color: '#9BB89D',
    fontFamily: "'Jost', sans-serif",
    marginTop: 0,
  },
  topBar: {
    height: 3,
    background: 'linear-gradient(90deg, #1C3A2A, #C8A96E 40%, #3E7A52 70%, #1C3A2A)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '56px 28px 28px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1.2fr 1.2fr',
    gap: '3rem',
    paddingBottom: '40px',
  },

  /* Brand column */
  colBrand: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  logoDot: { color: '#C8A96E', fontSize: '0.7rem' },
  logoText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem', fontWeight: 400, color: '#E8DFC8', letterSpacing: '0.04em',
  },
  slogan: {
    fontSize: '0.88rem', lineHeight: 1.8, color: '#7A9E7C', fontWeight: 300,
  },
  selos: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' },
  selo: {
    background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)',
    color: '#B89A5A', padding: '4px 12px', borderRadius: '20px',
    fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em',
  },

  /* Common col */
  col: { display: 'flex', flexDirection: 'column' },
  colTitulo: {
    fontSize: '0.65rem', fontWeight: 700,
    color: '#C8A96E', textTransform: 'uppercase', letterSpacing: '0.18em',
    marginBottom: '1.2rem',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid rgba(200,169,110,0.18)',
  },

  /* Nav links */
  lista: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  link: {
    color: '#9BB89D', textDecoration: 'none', fontSize: '0.88rem',
    transition: 'color 0.2s, padding-left 0.2s',
    display: 'block',
  },

  /* Contact */
  listaContato: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  contatoItem: {
    display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
    fontSize: '0.84rem', color: '#7A9E7C', lineHeight: 1.6,
  },
  contatoIcon: { fontSize: '0.95rem', marginTop: '1px', flexShrink: 0 },

  /* Social */
  redesWrap: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  redesLink: {
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    color: '#9BB89D', textDecoration: 'none',
    padding: '0.5rem 0.75rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  },
  redesIcone: {
    width: 28, height: 28,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
    lineHeight: '28px', textAlign: 'center',
  },
  redesLabel: { fontSize: '0.84rem' },

  /* Payments */
  pagamentos: {},
  pagRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  pagBadge: {
    background: 'rgba(200,169,110,0.12)',
    color: '#C8A96E',
    border: '1px solid rgba(200,169,110,0.25)',
    padding: '5px 14px', borderRadius: '6px',
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
  },

  /* Bottom */
  divider: { borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 0 24px' },
  bottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: '0.5rem',
  },
  copyright: { fontSize: '0.82rem', color: '#5A7E5C' },
  madeWith: { fontSize: '0.78rem', color: '#4A6E4C', fontWeight: 300 },
};

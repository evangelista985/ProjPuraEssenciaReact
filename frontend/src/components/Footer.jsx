import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.footerGrid}>

        {/* Col 1 — Logo */}
        <div>
          <div style={s.footerLogo}>Pura <span style={s.logoSpan}>Essência</span></div>
          <p style={s.footerDesc}>
            Produtos naturais, orgânicos e sustentáveis para uma vida mais saudável e consciente.
            Da natureza para sua mesa e sua vida.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
            {['📱','📸','💬','𝕏'].map((icon, i) => (
              <div key={i} style={s.socialIcon}>{icon}</div>
            ))}
          </div>
        </div>

        {/* Col 2 — Produtos */}
        <div style={s.footerCol}>
          <h4 style={s.footerColTitle}>Produtos</h4>
          <ul style={s.footerLinks}>
            <li><Link to="/chas"     style={s.footerLink}>Chás & Ervas</Link></li>
            <li><Link to="/organicos" style={s.footerLink}>Orgânicos</Link></li>
            <li><Link to="/temperos" style={s.footerLink}>Temperos</Link></li>
            <li><Link to="/"         style={s.footerLink}>Vitrine</Link></li>
          </ul>
        </div>

        {/* Col 3 — Navegação */}
        <div style={s.footerCol}>
          <h4 style={s.footerColTitle}>Navegação</h4>
          <ul style={s.footerLinks}>
            <li><Link to="/carrinho"     style={s.footerLink}>Carrinho</Link></li>
            <li><Link to="/meus-pedidos" style={s.footerLink}>Meus Pedidos</Link></li>
            <li><Link to="/login"        style={s.footerLink}>Entrar</Link></li>
            <li><Link to="/cadastro"     style={s.footerLink}>Cadastrar</Link></li>
          </ul>
        </div>

        {/* Col 4 — Atendimento */}
        <div style={s.footerCol}>
          <h4 style={s.footerColTitle}>Atendimento</h4>
          <div style={s.footerContact}>
            <div>📧 puraessencia@puraessencia.com.br</div>
            <div>📞 (11) 3456-7890</div>
            <div>💬 WhatsApp disponível</div>
            <div style={{ marginTop: '0.8rem', fontSize: '0.78rem', color: 'rgba(245,240,232,0.4)' }}>
              Seg–Sex: 9h às 18h<br />Sáb: 9h às 13h
            </div>
          </div>
        </div>
      </div>

      <div style={s.footerBottom}>
        <span>© {new Date().getFullYear()} Pura Essência — Todos os direitos reservados.</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['PIX','VISA','MASTER','BOLETO'].map(m => (
            <div key={m} style={s.payIcon}>{m}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: '#1C3A2A',
    color: 'rgba(245,240,232,0.75)',
    marginTop: 0,
    padding: '4rem 4rem 0',
    fontFamily: "'Jost', sans-serif",
    fontSize: '0.88rem',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '3rem',
    paddingBottom: '3rem',
    borderBottom: '1px solid rgba(200,169,110,0.15)',
  },
  footerLogo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#F5F0E8',
    marginBottom: '1rem',
    letterSpacing: '0.04em',
  },
  logoSpan: { color: '#C8A96E' },
  footerDesc: {
    fontSize: '0.82rem',
    lineHeight: 1.8,
    color: 'rgba(245,240,232,0.55)',
  },
  socialIcon: {
    width: 36,
    height: 36,
    background: 'rgba(200,169,110,0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  footerCol: { display: 'flex', flexDirection: 'column' },
  footerColTitle: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#C8A96E',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '1.2rem',
    fontFamily: "'Jost', sans-serif",
  },
  footerLinks: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
  },
  footerLink: {
    color: 'rgba(245,240,232,0.6)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'color 0.2s',
  },
  footerContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    color: 'rgba(245,240,232,0.6)',
    fontSize: '0.82rem',
    lineHeight: 1.6,
  },
  footerBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1.5rem 0',
    fontSize: '0.75rem',
    color: 'rgba(245,240,232,0.35)',
    letterSpacing: '0.04em',
  },
  payIcon: {
    background: 'rgba(200,169,110,0.12)',
    color: 'rgba(245,240,232,0.5)',
    padding: '4px 10px',
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
};

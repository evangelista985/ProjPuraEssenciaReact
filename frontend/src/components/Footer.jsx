import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div className="container">
        <div style={s.grid}>

          {/* Coluna 1 — Logo e descrição */}
          <div style={s.col}>
            <h3 style={s.logoText}> Pura Essência</h3>
            <p style={s.desc}>
              Produtos naturais e orgânicos selecionados com cuidado para
              levar saúde, sabor e bem-estar à sua mesa.
            </p>
          </div>

          {/* Coluna 2 — Navegação */}
          <div style={s.col}>
            <h4 style={s.colTitulo}>Navegação</h4>
            <ul style={s.lista}>
              <li><Link to="/"             style={s.link}>Vitrine</Link></li>
              <li><Link to="/carrinho"     style={s.link}>Carrinho</Link></li>
              <li><Link to="/meus-pedidos" style={s.link}>Meus Pedidos</Link></li>
              <li><Link to="/login"        style={s.link}>Entrar</Link></li>
              <li><Link to="/cadastro"     style={s.link}>Cadastrar</Link></li>
            </ul>
          </div>

          {/* Coluna 3 — Contato */}
          <div style={s.col}>
            <h4 style={s.colTitulo}>Contato</h4>
            <ul style={s.lista}>
              <li style={s.contatoItem}>📍 R. Guiapá, 678 – Vila Leopoldina</li>
              <li style={s.contatoItem}>📍 CEP 05089-001 – São Paulo, SP</li>
              <li style={s.contatoItem}>📞 (11) 3456-7890</li>
              <li style={s.contatoItem}>✉️ puraessencia@puraessencia.com.br</li>
            </ul>
          </div>

          {/* Coluna 4 — Redes Sociais */}
          <div style={s.col}>
            <h4 style={s.colTitulo}>Redes Sociais</h4>
            <div style={s.redesWrap}>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" style={s.redesLink}>
                <div style={s.icone}>f</div>
                <span>Facebook</span>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={s.redesLink}>
                <div style={s.icone}>📷</div>
                <span>Instagram</span>
              </a>
              <a href="https://wa.me/5511981992048" target="_blank" rel="noreferrer" style={s.redesLink}>
                <div style={s.icone}>💬</div>
                <span>WhatsApp</span>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" style={s.redesLink}>
                <div style={s.icone}>𝕏</div>
                <span>Twitter/X</span>
              </a>
            </div>

            <div style={s.pagamentos}>
              <h4 style={{ ...s.colTitulo, marginTop: 20 }}>Pagamentos</h4>
              <div style={s.pagRow}>
                <span style={s.pagBadge}>PIX</span>
                <span style={s.pagBadge}>Cartão</span>
                <span style={s.pagBadge}>Boleto</span>
              </div>
            </div>
          </div>

        </div>

        {/* Linha divisória */}
        <div style={s.divider} />

        {/* Rodapé final */}
        <div style={s.bottom}>
          <p>© {new Date().getFullYear()} Pura Essência — Todos os direitos reservados.</p>
          <p style={{ marginTop: 4, fontSize: 12, color: '#8aab8c' }}>
            Desenvolvido com 🌿 e cuidado
          </p>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: '#2E4D37',
    color: '#c8d8c9',
    marginTop: 60,
    paddingTop: 48,
    paddingBottom: 24,
    fontFamily: "'Lato', sans-serif",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 36,
    paddingBottom: 32,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    color: '#D4AF37',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#a8c4aa',
  },
  colTitulo: {
    fontSize: 13,
    fontWeight: 700,
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
    borderBottom: '1px solid #3A5D3E',
    paddingBottom: 8,
  },
  lista: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  link: {
    color: '#c8d8c9',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'color 0.2s',
  },
  contatoItem: {
    fontSize: 13,
    color: '#a8c4aa',
    lineHeight: 1.8,
  },
  redesWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  redesLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#c8d8c9',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'color 0.2s',
  },
  icone: {
    width: 30,
    height: 30,
    background: '#3A5D3E',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#D4AF37',
    flexShrink: 0,
  },
  pagamentos: {},
  pagRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  pagBadge: {
    background: '#3A5D3E',
    color: '#D4AF37',
    padding: '4px 12px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  divider: {
    borderTop: '1px solid #3A5D3E',
    margin: '0 0 20px 0',
  },
  bottom: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8aab8c',
  },
};

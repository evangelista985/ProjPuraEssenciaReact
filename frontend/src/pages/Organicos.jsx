import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DIFERENCIAIS = [
  { icon: '🌱', titulo: 'Sem Agrotóxicos', desc: 'Produzidos sem uso de pesticidas ou produtos químicos nocivos' },
  { icon: '🌍', titulo: 'Sustentável', desc: 'Práticas que respeitam o solo, a água e a biodiversidade' },
  { icon: '💚', titulo: 'Mais Nutritivo', desc: 'Maior concentração de vitaminas, minerais e antioxidantes' },
  { icon: '🏅', titulo: 'Certificado', desc: 'Todos os nossos orgânicos possuem certificação reconhecida' },
];

export default function Organicos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    async function buscarOrganicos() {
      setLoading(true);
      try {
        const { data } = await api.get('/produtos', { params: { categoria_id: 3 } });
        setProdutos(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    buscarOrganicos();
  }, []);

  const produtosFiltrados = produtos.filter(p => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao || '').toLowerCase().includes(busca.toLowerCase());
    return matchBusca;
  });

  return (
    <div style={{ background: '#f5f7f2', minHeight: '100vh' }}>

      {/* Hero com gradiente terroso */}
      <div style={st.hero}>
        <div style={st.heroBg} />
        <div style={st.heroContent}>
          <div style={st.heroBadge}>🌱 CERTIFICADO ORGÂNICO</div>
          <h1 style={st.heroTitulo}>Produtos Orgânicos</h1>
          <p style={st.heroSub}>
            Da terra ao seu prato, sem intermediários nocivos
          </p>
          <p style={st.heroDetalhe}>
            Cultivados com respeito à natureza e à sua saúde. Cada produto carrega o compromisso com um mundo melhor.
          </p>
          <div style={st.heroStats}>
            <div style={st.heroStat}>
              <span style={st.heroStatNum}>100%</span>
              <span style={st.heroStatLabel}>Natural</span>
            </div>
            <div style={st.heroStatDiv} />
            <div style={st.heroStat}>
              <span style={st.heroStatNum}>0</span>
              <span style={st.heroStatLabel}>Agrotóxicos</span>
            </div>
            <div style={st.heroStatDiv} />
            <div style={st.heroStat}>
              <span style={st.heroStatNum}>✓</span>
              <span style={st.heroStatLabel}>Certificado</span>
            </div>
          </div>
        </div>
        <div style={st.heroIllustration}>🌿</div>
      </div>

      {/* Diferenciais */}
      <div style={st.diferenciaisSection}>
        <div className="container" style={{ padding: '0 20px' }}>
          <div style={st.diferenciaisGrid}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={st.diferencialItem}>
                <span style={st.diferencialIcon}>{d.icon}</span>
                <div>
                  <strong style={st.diferencialTitulo}>{d.titulo}</strong>
                  <p style={st.diferencialDesc}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 48px' }}>

        {/* Busca */}
        <div style={st.buscaArea}>
          <div style={st.buscaWrap}>
            <span style={st.buscaIcon}>🔍</span>
            <input
              style={st.buscaInput}
              placeholder="Buscar produtos orgânicos..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button style={st.buscaLimpar} onClick={() => setBusca('')}>✕</button>
            )}
          </div>
        </div>

        {/* Contador */}
        {!loading && (
          <p style={st.contador}>
            {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={st.loadingWrap}>
            <div style={{ fontSize: 48 }}>🌱</div>
            <p style={st.loadingTxt}>Colhendo os melhores orgânicos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div style={st.vazioWrap}>
            <p style={{ fontSize: 48 }}>🌍</p>
            <p style={st.vazioTxt}>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid-produtos">
            {produtosFiltrados.map(p => (
              <CardOrganico key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardOrganico({ produto, onClick }) {
  const temEstoque = produto.quantidade > 0;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...st.card,
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 14px 36px rgba(58,93,62,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={st.imgWrap}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/300x200/d4edda/3A5D3E?text=Orgânico'}
          alt={produto.nome}
          style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x200/d4edda/3A5D3E?text=Orgânico'; }}
        />
        {!temEstoque && <div style={st.semEstoque}>ESGOTADO</div>}
        <div style={st.orgBadge}>🌱 Orgânico</div>
      </div>
      <div style={{ padding: '16px 16px 20px' }}>
        <h3 style={st.cardNome}>{produto.nome}</h3>
        <p style={st.cardDesc}>{(produto.descricao || '').slice(0, 80)}...</p>
        {produto.quantidade > 0 && (
          <p style={st.estoque}>✓ {produto.quantidade} em estoque</p>
        )}
        <div style={st.cardFooter}>
          <div>
            <p style={st.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</p>
            <p style={st.pixInfo}>no pix</p>
          </div>
          <button
            className="btn-verde"
            style={{ fontSize: 13, padding: '10px 18px', opacity: temEstoque ? 1 : 0.5 }}
            disabled={!temEstoque}
          >
            {temEstoque ? 'Ver →' : 'Esgotado'}
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  // Hero
  hero: {
    position: 'relative',
    minHeight: 380,
    background: 'linear-gradient(135deg, #1C3A20 0%, #2D5A32 40%, #3A7040 100%)',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)',
  },
  heroContent: { padding: '60px 48px', zIndex: 1, flex: 1 },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(212,175,55,0.2)',
    border: '1px solid rgba(212,175,55,0.5)',
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
    padding: '6px 16px',
    borderRadius: 30,
    marginBottom: 16,
  },
  heroTitulo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 50,
    color: '#fff',
    marginBottom: 8,
    textShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  heroSub: { fontSize: 18, color: '#D4AF37', fontWeight: 700, marginBottom: 12 },
  heroDetalhe: { fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 500, lineHeight: 1.6, marginBottom: 32 },
  heroStats: { display: 'flex', alignItems: 'center', gap: 20 },
  heroStat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroStatNum: { fontSize: 28, fontWeight: 900, color: '#D4AF37' },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1 },
  heroStatDiv: { width: 1, height: 40, background: 'rgba(255,255,255,0.2)' },
  heroIllustration: {
    fontSize: 220,
    position: 'absolute',
    right: -30,
    bottom: -30,
    opacity: 0.06,
    pointerEvents: 'none',
  },

  // Diferenciais
  diferenciaisSection: {
    background: '#fff',
    padding: '28px 0',
    borderBottom: '1px solid #d0d7c4',
  },
  diferenciaisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
  },
  diferencialItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '16px 12px',
  },
  diferencialIcon: { fontSize: 28, flexShrink: 0 },
  diferencialTitulo: { display: 'block', fontSize: 14, color: '#3A5D3E', marginBottom: 4 },
  diferencialDesc: { fontSize: 12, color: '#6c757d', lineHeight: 1.5 },

  // Busca
  buscaArea: { margin: '28px 0 16px' },
  buscaWrap: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 14 },
  buscaIcon: { position: 'absolute', left: 14, fontSize: 18 },
  buscaInput: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    fontSize: 15,
    borderRadius: 30,
    border: '2px solid #d0d7c4',
    background: '#fff',
    outline: 'none',
  },
  buscaLimpar: {
    position: 'absolute', right: 14,
    background: 'none', border: 'none',
    fontSize: 16, color: '#888', cursor: 'pointer',
  },
  contador: { color: '#6c757d', fontSize: 13, marginBottom: 20 },

  // Loading / Vazio
  loadingWrap: { textAlign: 'center', padding: '60px 0' },
  loadingTxt: { color: '#3A5D3E', fontSize: 15, marginTop: 12 },
  vazioWrap: { textAlign: 'center', padding: '60px 0' },
  vazioTxt: { color: '#888', fontSize: 15 },

  // Card
  card: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.25s, box-shadow 0.25s',
  },
  imgWrap: {
    position: 'relative',
    height: 200,
    background: '#e8f5e9',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  semEstoque: {
    position: 'absolute', top: 10, right: 10,
    background: '#dc3545', color: '#fff',
    fontSize: 11, fontWeight: 700,
    padding: '3px 8px', borderRadius: 4,
  },
  orgBadge: {
    position: 'absolute', bottom: 8, left: 8,
    background: 'rgba(58,93,62,0.9)', color: '#D4AF37',
    fontSize: 11, fontWeight: 700,
    padding: '3px 9px', borderRadius: 4,
  },
  cardNome: { fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6c757d', lineHeight: 1.5, marginBottom: 8 },
  estoque: { fontSize: 12, color: '#3A5D3E', fontWeight: 700, marginBottom: 10 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  preco: { fontSize: 20, fontWeight: 800, color: '#dc3545', lineHeight: 1 },
  pixInfo: { fontSize: 11, color: '#6c757d', marginTop: 2 },
};

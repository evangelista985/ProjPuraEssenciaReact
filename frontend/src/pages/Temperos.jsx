import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RECEITAS_POPULARES = [
  { emoji: '🍝', nome: 'Macarrão ao Alecrim', tempero: 'Alecrim' },
  { emoji: '🍕', nome: 'Pizza Margherita', tempero: 'Orégano' },
  { emoji: '🥗', nome: 'Salada Caprese', tempero: 'Manjericão' },
  { emoji: '🫕', nome: 'Risoto Aromático', tempero: 'Tomilho' },
];

const USOS_CULINARIOS = [
  { icon: '🔥', titulo: 'Carnes', desc: 'Realçam o sabor de carnes grelhadas e assadas' },
  { icon: '🥗', titulo: 'Saladas', desc: 'Transformam saladas simples em pratos especiais' },
  { icon: '🍲', titulo: 'Molhos', desc: 'A base de qualquer molho aromático italiano' },
  { icon: '🫙', titulo: 'Conservas', desc: 'Preservam sabor e aroma em azeites e vinagres' },
];

export default function Temperos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const nav = useNavigate();

  useEffect(() => {
    async function buscarTemperos() {
      setLoading(true);
      try {
        const { data } = await api.get('/produtos', { params: { categoria_id: 2 } });
        setProdutos(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    buscarTemperos();
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ background: '#f5f7f2', minHeight: '100vh' }}>

      {/* Hero - tom quente, terroso */}
      <div style={st.hero}>
        <div style={st.heroBgPattern} />
        <div style={st.heroLeft}>
          <div style={st.heroPill}>🌶️ TEMPEROS SELECIONADOS</div>
          <h1 style={st.heroTitulo}>Temperos Naturais</h1>
          <p style={st.heroSub}>O segredo de toda boa cozinha</p>
          <p style={st.heroDesc}>
            Cada pitada carrega aroma, tradição e sabor. Nossos temperos são secos e armazenados de forma artesanal para preservar toda a essência da erva.
          </p>
          <div style={st.heroTags}>
            {['Alecrim', 'Orégano', 'Manjericão', 'Tomilho', 'Sálvia'].map(t => (
              <span key={t} style={st.heroTag}>{t}</span>
            ))}
          </div>
        </div>
        <div style={st.heroRight}>
          <div style={st.heroEmojiBig}>🌿</div>
        </div>
      </div>

      {/* Receitas populares */}
      <div style={st.receitasSection}>
        <div className="container" style={{ padding: '0 20px' }}>
          <h2 style={st.secTitulo}>Receitas que pedem nossos temperos</h2>
          <div style={st.receitasGrid}>
            {RECEITAS_POPULARES.map((r, i) => (
              <div key={i} style={st.receitaCard}>
                <div style={st.receitaEmoji}>{r.emoji}</div>
                <div>
                  <p style={st.receitaNome}>{r.nome}</p>
                  <p style={st.receitaTempero}>usa: <strong>{r.tempero}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usos */}
      <div style={st.usosSection}>
        <div className="container" style={{ padding: '0 20px' }}>
          <div style={st.usosGrid}>
            {USOS_CULINARIOS.map((u, i) => (
              <div key={i} style={st.usoItem}>
                <div style={st.usoIcon}>{u.icon}</div>
                <div>
                  <strong style={st.usoTitulo}>{u.titulo}</strong>
                  <p style={st.usoDesc}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Busca + Controles */}
      <div className="container" style={{ padding: '0 20px 48px' }}>
        <div style={st.controles}>
          <div style={st.buscaWrap}>
            <span style={st.buscaIcon}>🔍</span>
            <input
              style={st.buscaInput}
              placeholder="Buscar tempero... ex: Alecrim, Orégano, Manjericão"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button style={st.buscaLimpar} onClick={() => setBusca('')}>✕</button>
            )}
          </div>
          <div style={st.viewBtns}>
            <button
              style={{ ...st.viewBtn, background: viewMode === 'grid' ? '#3A5D3E' : '#fff', color: viewMode === 'grid' ? '#fff' : '#3A5D3E' }}
              onClick={() => setViewMode('grid')}
            >▦</button>
            <button
              style={{ ...st.viewBtn, background: viewMode === 'list' ? '#3A5D3E' : '#fff', color: viewMode === 'list' ? '#fff' : '#3A5D3E' }}
              onClick={() => setViewMode('list')}
            >☰</button>
          </div>
        </div>

        {!loading && (
          <p style={st.contador}>
            {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'tempero encontrado' : 'temperos encontrados'}
          </p>
        )}

        {/* Produtos */}
        {loading ? (
          <div style={st.loadingWrap}>
            <div style={{ fontSize: 48 }}>🌿</div>
            <p style={st.loadingTxt}>Colhendo os temperos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div style={st.vazioWrap}>
            <p style={{ fontSize: 48 }}>🌶️</p>
            <p style={st.vazioTxt}>Nenhum tempero encontrado</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-produtos">
            {produtosFiltrados.map(p => (
              <CardTemperoGrid key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {produtosFiltrados.map(p => (
              <CardTemperoList key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardTemperoGrid({ produto, onClick }) {
  const temEstoque = produto.quantidade > 0;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...st.card,
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 14px 36px rgba(139,90,43,0.18)' : '0 2px 12px rgba(0,0,0,0.08)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={st.imgWrap}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/300x200/e8f0e9/3A5D3E?text=Tempero'}
          alt={produto.nome}
          style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x200/e8f0e9/3A5D3E?text=Tempero'; }}
        />
        {!temEstoque && <div style={st.semEstoque}>ESGOTADO</div>}
        <div style={st.tempTag}>🌿 Tempero</div>
      </div>
      <div style={{ padding: '16px 16px 20px' }}>
        <h3 style={st.cardNome}>{produto.nome}</h3>
        <p style={st.cardDesc}>{(produto.descricao || '').slice(0, 70)}...</p>
        <div style={st.cardFooter}>
          <span style={st.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
          <button
            className="btn-verde"
            style={{ fontSize: 13, padding: '9px 16px', opacity: temEstoque ? 1 : 0.5 }}
            disabled={!temEstoque}
          >
            {temEstoque ? 'Ver →' : 'Esgotado'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CardTemperoList({ produto, onClick }) {
  const temEstoque = produto.quantidade > 0;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...st.listCard,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={st.listImg}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/120x120/e8f0e9/3A5D3E?text=🌿'}
          alt={produto.nome}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://via.placeholder.com/120x120/e8f0e9/3A5D3E?text=🌿'; }}
        />
      </div>
      <div style={st.listInfo}>
        <div style={st.listTagRow}>
          <span style={st.listTag}>🌿 Tempero</span>
          {!temEstoque && <span style={{ ...st.listTag, background: '#f8d7da', color: '#721c24' }}>Esgotado</span>}
        </div>
        <h3 style={st.listNome}>{produto.nome}</h3>
        <p style={st.listDesc}>{(produto.descricao || '').slice(0, 120)}...</p>
      </div>
      <div style={st.listAcoes}>
        <p style={st.listPreco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</p>
        {temEstoque && <p style={st.listEstoque}>✓ {produto.quantidade} disponíveis</p>}
        <button
          className="btn-verde"
          style={{ width: '100%', fontSize: 14, opacity: temEstoque ? 1 : 0.5 }}
          disabled={!temEstoque}
        >
          {temEstoque ? 'Ver Detalhes' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}

const st = {
  // Hero
  hero: {
    position: 'relative',
    minHeight: 380,
    background: 'linear-gradient(135deg, #4A2C0A 0%, #7B4D1E 40%, #5C3510 100%)',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroBgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.12) 0%, transparent 50%)',
  },
  heroLeft: { padding: '60px 48px', zIndex: 1, flex: 1 },
  heroPill: {
    display: 'inline-block',
    background: 'rgba(212,175,55,0.2)',
    border: '1px solid rgba(212,175,55,0.4)',
    color: '#D4AF37',
    fontSize: 11,
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
    marginBottom: 6,
    textShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },
  heroSub: { fontSize: 18, color: '#D4AF37', fontWeight: 700, marginBottom: 12 },
  heroDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    maxWidth: 480,
    lineHeight: 1.65,
    marginBottom: 24,
  },
  heroTags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  heroTag: {
    background: 'rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    padding: '5px 14px',
    borderRadius: 20,
    fontWeight: 600,
  },
  heroRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 40px',
    zIndex: 1,
  },
  heroEmojiBig: {
    fontSize: 140,
    opacity: 0.25,
    filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.3))',
  },

  // Receitas
  receitasSection: { background: '#fff', padding: '36px 0 28px' },
  secTitulo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    color: '#3A5D3E',
    textAlign: 'center',
    marginBottom: 24,
  },
  receitasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
  },
  receitaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#f5f7f2',
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid #d0d7c4',
  },
  receitaEmoji: { fontSize: 32 },
  receitaNome: { fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 2 },
  receitaTempero: { fontSize: 12, color: '#6c757d' },

  // Usos
  usosSection: {
    background: '#f5f7f2',
    borderTop: '1px solid #d0d7c4',
    borderBottom: '1px solid #d0d7c4',
    padding: '24px 0',
  },
  usosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  usoItem: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 8px' },
  usoIcon: { fontSize: 24 },
  usoTitulo: { display: 'block', fontSize: 14, color: '#4A2C0A', marginBottom: 4 },
  usoDesc: { fontSize: 12, color: '#6c757d', lineHeight: 1.5 },

  // Controles
  controles: { display: 'flex', gap: 12, alignItems: 'center', margin: '28px 0 12px' },
  buscaWrap: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' },
  buscaIcon: { position: 'absolute', left: 14, fontSize: 18 },
  buscaInput: {
    width: '100%',
    padding: '13px 14px 13px 44px',
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
  viewBtns: { display: 'flex', gap: 4 },
  viewBtn: {
    width: 38, height: 38,
    border: '1.5px solid #3A5D3E',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  contador: { color: '#6c757d', fontSize: 13, marginBottom: 20 },

  // Loading / Vazio
  loadingWrap: { textAlign: 'center', padding: '60px 0' },
  loadingTxt: { color: '#3A5D3E', fontSize: 15, marginTop: 12 },
  vazioWrap: { textAlign: 'center', padding: '60px 0' },
  vazioTxt: { color: '#888', fontSize: 15 },

  // Card Grid
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
    background: '#f0f4e8',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  semEstoque: {
    position: 'absolute', top: 10, right: 10,
    background: '#dc3545', color: '#fff',
    fontSize: 11, fontWeight: 700,
    padding: '3px 8px', borderRadius: 4,
  },
  tempTag: {
    position: 'absolute', bottom: 8, left: 8,
    background: 'rgba(74,44,10,0.85)', color: '#D4AF37',
    fontSize: 11, fontWeight: 700,
    padding: '3px 9px', borderRadius: 4,
  },
  cardNome: { fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6c757d', lineHeight: 1.5, marginBottom: 12 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  preco: { fontSize: 18, fontWeight: 800, color: '#dc3545' },

  // Card List
  listCard: {
    background: '#fff',
    borderRadius: 12,
    display: 'flex',
    gap: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 0.25s',
  },
  listImg: { width: 130, height: 130, flexShrink: 0, background: '#f0f4e8', overflow: 'hidden', alignSelf: 'center' },
  listInfo: { flex: 1, padding: '18px 16px' },
  listTagRow: { display: 'flex', gap: 8, marginBottom: 6 },
  listTag: {
    display: 'inline-block',
    background: 'rgba(74,44,10,0.1)',
    color: '#4A2C0A',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
  },
  listNome: { fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 6 },
  listDesc: { fontSize: 13, color: '#6c757d', lineHeight: 1.55 },
  listAcoes: {
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
    minWidth: 160,
    borderLeft: '1px solid #f0f0f0',
  },
  listPreco: { fontSize: 22, fontWeight: 800, color: '#dc3545' },
  listEstoque: { fontSize: 12, color: '#3A5D3E', fontWeight: 700, marginBottom: 4 },
};

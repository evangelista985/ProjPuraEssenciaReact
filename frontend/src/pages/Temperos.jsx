import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const USOS_CULINARIOS = [
  { icon: '🥩', titulo: 'Carnes',   desc: 'Realçam o sabor de carnes grelhadas e assadas' },
  { icon: '🥗', titulo: 'Saladas',  desc: 'Transformam saladas simples em pratos especiais' },
  { icon: '🍝', titulo: 'Molhos',   desc: 'A base de qualquer molho aromático artesanal' },
  { icon: '🫙', titulo: 'Conservas',desc: 'Preservam sabor e aroma em azeites e vinagres' },
];

export default function Temperos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    async function buscarTemperos() {
      setLoading(true);
      try {
        const { data } = await api.get('/produtos', { params: { categoria_id: 2 } });
        setProdutos(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    buscarTemperos();
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={st.hero}>
        <div style={st.heroContent}>
          <span style={st.heroBadge}>✦ Aromas & Sabores</span>
          <h1 style={st.heroTitulo}>
            Temperos <em style={{ fontStyle: 'italic', color: '#E2C98A' }}>Naturais</em>
          </h1>
          <p style={st.heroSub}>Sabor autêntico da natureza em cada pitada</p>
          <p style={st.heroDetalhe}>
            Orégano, Alecrim, Manjericão e muito mais. Secos e embalados para preservar todo o aroma e sabor.
          </p>
        </div>
        <div style={st.heroDecoText}>Temperos</div>
      </div>

      {/* Usos culinários */}
      <section style={st.usosSection}>
        <div className="container">
          <div style={st.sectionHeader}>
            <span style={st.sectionLabel}>Versatilidade na cozinha</span>
            <h2 style={st.sectionTitle}>Onde <em style={{ fontStyle: 'italic', color: '#A07840' }}>usar?</em></h2>
          </div>
          <div style={st.usosGrid}>
            {USOS_CULINARIOS.map((u, i) => (
              <div key={i} style={st.usoCard}>
                <div style={st.usoIcon}>{u.icon}</div>
                <h3 style={st.usoTitulo}>{u.titulo}</h3>
                <p style={st.usoDesc}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={st.sectionHeader}>
            <span style={st.sectionLabel}>Nosso catálogo</span>
            <h2 style={st.sectionTitle}>Temperos <em style={{ fontStyle: 'italic', color: '#A07840' }}>selecionados</em></h2>
          </div>
          <div style={st.searchBar}>
            <input style={st.searchInput} placeholder="Buscar temperos... ex: Orégano, Alecrim, Manjericão"
              value={busca} onChange={e => setBusca(e.target.value)} />
            {busca && <button style={st.btnLimpar} onClick={() => setBusca('')}>✕ Limpar</button>}
          </div>
          {!loading && <p style={st.contador}>{produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'tempero encontrado' : 'temperos encontrados'}</p>}
          {loading ? (
            <div style={st.centroMsg}><p style={st.loadingTxt}>Preparando os temperos...</p></div>
          ) : produtosFiltrados.length === 0 ? (
            <div style={st.centroMsg}><p style={st.vazio}>Nenhum tempero encontrado para "{busca}"</p></div>
          ) : (
            <div className="grid-produtos" style={{ paddingBottom: '4rem' }}>
              {produtosFiltrados.map(p => <CardTempero key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CardTempero({ produto, onClick }) {
  const temEstoque = produto.quantidade > 0;
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ ...st.card, borderColor: hovered ? '#C8A96E' : 'rgba(200,169,110,0.25)', boxShadow: hovered ? '0 12px 32px rgba(28,58,42,0.1)' : 'none', transform: hovered ? 'translateY(-3px)' : 'none' }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={st.imgWrap}>
        <img src={produto.imagem || 'https://via.placeholder.com/300x220/EDE7D8/1C3A2A?text=Tempero'} alt={produto.nome} style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x220/EDE7D8/1C3A2A?text=Tempero'; }} />
        {!temEstoque && <div style={st.semEstoque}>ESGOTADO</div>}
        <div style={st.tempTag}>Temperos</div>
      </div>
      <div style={{ padding: '1.2rem' }}>
        <div style={st.productCategory}>Temperos Naturais</div>
        <h3 style={st.cardNome}>{produto.nome}</h3>
        <p style={st.cardDesc}>{(produto.descricao || '').slice(0, 75)}...</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
          <span style={st.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
          <button className="btn-verde" style={{ fontSize: '0.7rem', padding: '8px 16px', opacity: temEstoque ? 1 : 0.5 }} disabled={!temEstoque}>
            {temEstoque ? 'Ver →' : 'Esgotado'}
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  hero: { position: 'relative', minHeight: 360, display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #1C3A2A 0%, #3E7A52 50%, #0f2018 100%)' },
  heroContent: { padding: '5rem 5rem', zIndex: 1, flex: 1 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.35)', padding: '0.35rem 1rem', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E2C98A', marginBottom: '1.2rem' },
  heroTitulo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, color: '#F5F0E8', marginBottom: '0.5rem', lineHeight: 1.1 },
  heroSub: { fontSize: '1rem', color: '#C8A96E', fontWeight: 400, marginBottom: '0.5rem' },
  heroDetalhe: { fontSize: '0.88rem', color: 'rgba(245,240,232,0.7)', maxWidth: 460, fontWeight: 300, lineHeight: 1.7 },
  heroDecoText: { position: 'absolute', right: '2%', fontFamily: "'Cormorant Garamond', serif", fontSize: '6rem', fontWeight: 300, color: 'rgba(200,169,110,0.05)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 },

  usosSection: { background: 'var(--cream-light)', padding: '5rem 0' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionLabel: { display: 'inline-block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A07840', fontWeight: 500, marginBottom: '0.6rem' },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 300, color: '#1C3A2A', lineHeight: 1.2 },

  usosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  usoCard: { textAlign: 'center', padding: '2rem 1.5rem', background: 'var(--cream)', border: '1px solid var(--border)' },
  usoIcon: { fontSize: '2rem', marginBottom: '1rem' },
  usoTitulo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#1C3A2A', marginBottom: '0.5rem' },
  usoDesc: { fontSize: '0.82rem', color: '#6B6050', lineHeight: 1.6, fontWeight: 300 },

  searchBar: { display: 'flex', gap: 12, marginBottom: '1rem', maxWidth: 560 },
  searchInput: { flex: 1, border: '1px solid var(--border)', background: 'var(--cream-light)', padding: '10px 16px', fontSize: '0.9rem' },
  btnLimpar: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', fontSize: '0.75rem', letterSpacing: '0.06em', cursor: 'pointer' },
  contador: { fontSize: '0.8rem', color: '#6B6050', letterSpacing: '0.06em', marginBottom: '2rem' },
  centroMsg: { textAlign: 'center', padding: '5rem 0' },
  loadingTxt: { fontFamily: "'Cormorant Garamond', serif", color: '#1C3A2A', fontSize: '1.2rem', fontStyle: 'italic' },
  vazio: { color: '#6B6050', fontSize: '0.9rem' },

  card: { background: 'var(--cream-light)', border: '1px solid rgba(200,169,110,0.25)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' },
  imgWrap: { position: 'relative', height: 220, background: 'var(--cream-dark)', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  semEstoque: { position: 'absolute', top: 10, right: 10, background: 'var(--perigo)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' },
  tempTag: { position: 'absolute', bottom: 8, left: 8, background: 'rgba(28,58,42,0.85)', color: '#E2C98A', fontSize: 10, fontWeight: 600, padding: '3px 9px', letterSpacing: '0.06em', textTransform: 'uppercase' },
  productCategory: { fontSize: '0.68rem', color: '#A07840', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 500 },
  cardNome: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 600, color: '#1A1A14', marginBottom: '0.4rem' },
  cardDesc: { fontSize: '0.82rem', color: '#6B6050', lineHeight: 1.6, fontWeight: 300 },
  preco: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: '#1C3A2A' },
};

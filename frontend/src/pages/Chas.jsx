import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #1C3A2A 0%, #2D5A3D 50%, #0f2018 100%)',
    titulo: 'Chás & Ervas',
    subtitulo: 'Da natureza para a sua xícara',
    detalhe: 'Colhidos com cuidado, secos ao sol e cheios de benefícios',
  },
  {
    bg: 'linear-gradient(135deg, #0f2018 0%, #3E7A52 50%, #1C3A2A 100%)',
    titulo: 'Bem-Estar Natural',
    subtitulo: 'Tradição e saúde em harmonia',
    detalhe: 'Ervas selecionadas das melhores regiões do Brasil',
  },
];

const BENEFICIOS = [
  { icon: '🍃', titulo: 'Relaxamento',  desc: 'Acalma a mente e alivia o estresse do dia a dia' },
  { icon: '🌿', titulo: 'Digestão',     desc: 'Auxilia no processo digestivo e conforto gástrico' },
  { icon: '✦',  titulo: 'Imunidade',   desc: 'Rica em antioxidantes que fortalecem o organismo' },
  { icon: '🌙', titulo: 'Sono',         desc: 'Promove o relaxamento para um sono mais tranquilo' },
];

export default function Chas() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [busca, setBusca] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    async function buscarChas() {
      setLoading(true);
      try {
        const { data } = await api.get('/produtos', { params: { categoria_id: 1 } });
        setProdutos(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    buscarChas();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(busca.toLowerCase())
  );
  const sl = HERO_SLIDES[slide];

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ ...st.hero, background: sl.bg }}>
        <div style={st.heroContent}>
          <span style={st.heroBadge}>✦ Chás & Ervas Naturais</span>
          <h1 style={st.heroTitulo}>{sl.titulo}</h1>
          <p style={st.heroSub}>{sl.subtitulo}</p>
          <p style={st.heroDetalhe}>{sl.detalhe}</p>
          <div style={st.heroDots}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                style={{ ...st.dot, background: i === slide ? '#C8A96E' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        </div>
        <div style={st.heroDecoText}>Chás</div>
      </div>

      {/* Benefícios */}
      <section style={st.beneficiosSection}>
        <div className="container">
          <div style={st.sectionHeader}>
            <span style={st.sectionLabel}>Por que tomar chá?</span>
            <h2 style={st.sectionTitle}>Benefícios <em style={{ fontStyle: 'italic', color: '#A07840' }}>naturais</em></h2>
          </div>
          <div style={st.beneficiosGrid}>
            {BENEFICIOS.map((b, i) => (
              <div key={i} style={st.beneficioCard}>
                <div style={st.beneficioIconWrap}>{b.icon}</div>
                <h3 style={st.beneficioTitulo}>{b.titulo}</h3>
                <p style={st.beneficioDesc}>{b.desc}</p>
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
            <h2 style={st.sectionTitle}>Chás <em style={{ fontStyle: 'italic', color: '#A07840' }}>selecionados</em></h2>
          </div>

          <div style={st.searchBar}>
            <input
              style={st.searchInput}
              placeholder="Buscar chás... ex: Camomila, Hortelã, Mate"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button style={st.btnLimpar} onClick={() => setBusca('')}>✕ Limpar</button>
            )}
          </div>

          {!loading && (
            <p style={st.contador}>
              {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'chá encontrado' : 'chás encontrados'}
            </p>
          )}

          {loading ? (
            <div style={st.centroMsg}>
              <p style={st.loadingTxt}>Preparando os chás...</p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div style={st.centroMsg}>
              <p style={st.vazio}>Nenhum chá encontrado para "{busca}"</p>
            </div>
          ) : (
            <div className="grid-produtos" style={{ paddingBottom: '4rem' }}>
              {produtosFiltrados.map(p => <CardCha key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CardCha({ produto, onClick }) {
  const temEstoque = produto.quantidade > 0;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...st.card,
        borderColor: hovered ? '#C8A96E' : 'rgba(200,169,110,0.25)',
        boxShadow: hovered ? '0 12px 32px rgba(28,58,42,0.1)' : 'none',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={st.imgWrap}>
        <img src={produto.imagem || 'https://via.placeholder.com/300x220/EDE7D8/1C3A2A?text=Chá'}
          alt={produto.nome} style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x220/EDE7D8/1C3A2A?text=Chá'; }} />
        {!temEstoque && <div style={st.semEstoque}>ESGOTADO</div>}
        <div style={st.chaTag}>Chás & Ervas</div>
      </div>
      <div style={{ padding: '1.2rem' }}>
        <div style={st.productCategory}>Chás & Ervas</div>
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
  hero: { position: 'relative', minHeight: 380, display: 'flex', alignItems: 'center', overflow: 'hidden', transition: 'background 1s ease' },
  heroContent: { padding: '5rem 5rem', zIndex: 1, flex: 1 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.35)', padding: '0.35rem 1rem', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E2C98A', marginBottom: '1.2rem' },
  heroTitulo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, color: '#F5F0E8', marginBottom: '0.5rem', lineHeight: 1.1 },
  heroSub: { fontSize: '1rem', color: '#C8A96E', fontWeight: 400, marginBottom: '0.5rem', letterSpacing: '0.04em' },
  heroDetalhe: { fontSize: '0.88rem', color: 'rgba(245,240,232,0.7)', maxWidth: 480, fontWeight: 300 },
  heroDots: { display: 'flex', gap: 8, marginTop: '1.5rem' },
  dot: { width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.3s' },
  heroDecoText: { position: 'absolute', right: '5%', fontFamily: "'Cormorant Garamond', serif", fontSize: '8rem', fontWeight: 300, color: 'rgba(200,169,110,0.06)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 },

  beneficiosSection: { background: 'var(--cream-light)', padding: '5rem 0' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionLabel: { display: 'inline-block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A07840', fontWeight: 500, marginBottom: '0.6rem' },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 300, color: '#1C3A2A', lineHeight: 1.2 },

  beneficiosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  beneficioCard: { textAlign: 'center', padding: '2rem 1.5rem', background: 'var(--cream)', border: '1px solid var(--border)' },
  beneficioIconWrap: { fontSize: '2rem', marginBottom: '1rem' },
  beneficioTitulo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#1C3A2A', marginBottom: '0.5rem' },
  beneficioDesc: { fontSize: '0.82rem', color: '#6B6050', lineHeight: 1.6, fontWeight: 300 },

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
  chaTag: { position: 'absolute', bottom: 8, left: 8, background: 'rgba(28,58,42,0.85)', color: '#E2C98A', fontSize: 10, fontWeight: 600, padding: '3px 9px', letterSpacing: '0.06em', textTransform: 'uppercase' },
  productCategory: { fontSize: '0.68rem', color: '#A07840', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 500 },
  cardNome: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 600, color: '#1A1A14', marginBottom: '0.4rem' },
  cardDesc: { fontSize: '0.82rem', color: '#6B6050', lineHeight: 1.6, fontWeight: 300 },
  preco: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: '#1C3A2A' },
};

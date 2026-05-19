import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #2D4A35 0%, #4a7a50 50%, #1a3020 100%)',
    img: 'https://cdn-icons-png.flaticon.com/128/15746/15746086.png',
    titulo: 'Chás Naturais',
    subtitulo: 'Da natureza para a sua xícara',
    detalhe: 'Colhidos com cuidado, secos ao sol e cheios de benefícios',
  },
  {
    bg: 'linear-gradient(135deg, #1a3020 0%, #5a8c60 50%, #2D4A35 100%)',
    img: 'https://cdn-icons-png.flaticon.com/128/3162/3162168.png',
    titulo: 'Bem-Estar',
    subtitulo: 'Tradição e saúde em harmonia',
    detalhe: 'Ervas selecionadas das melhores regiões do Brasil',
  },
];

const BENEFICIOS = [
  { icon: '♻️', titulo: 'Relaxamento', desc: 'Acalma a mente e alivia o estresse do dia a dia' },
  { icon: '🌡️', titulo: 'Digestão', desc: 'Auxilia no processo digestivo e conforto gástrico' },
  { icon: '🛡️', titulo: 'Imunidade', desc: 'Rica em antioxidantes que fortalecem o organismo' },
  { icon: '💤', titulo: 'Sono', desc: 'Promove o relaxamento para um sono mais tranquilo' },
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
      } catch (e) {
        console.error(e);
      }
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
    <div style={{ background: '#f5f7f2', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ ...st.hero, background: sl.bg }}>
        <div style={st.heroContent}>
          <img src={sl.img} alt="cha" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12 }} />
          <h1 style={st.heroTitulo}>{sl.titulo}</h1>
          <p style={st.heroSub}>{sl.subtitulo}</p>
          <p style={st.heroDetalhe}>{sl.detalhe}</p>
          <div style={st.heroDots}>
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{ ...st.dot, background: i === slide ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </div>
        <div style={st.heroDecor}>🍃</div>
      </div>

      {/* Benefícios */}
      <div style={st.beneficiosSection}>
        <div className="container">
          <h2 style={st.secTitulo}>Por que tomar chá?</h2>
          <div style={st.beneficiosGrid}>
            {BENEFICIOS.map((b, i) => (
              <div key={i} style={st.beneficioCard}>
                <div style={st.beneficioIcon}>{b.icon}</div>
                <h3 style={st.beneficioTitulo}>{b.titulo}</h3>
                <p style={st.beneficioDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="container" style={{ padding: '0 20px' }}>
        <div style={st.buscaWrap}>
          <div style={st.buscaIcon}>🔍</div>
          <input
            style={st.buscaInput}
            placeholder="Buscar chás... ex: Camomila, Hortelã, Mate"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && (
            <button style={st.buscaLimpar} onClick={() => setBusca('')}>✕</button>
          )}
        </div>

        {/* Contador */}
        {!loading && (
          <p style={st.contador}>
            {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'chá encontrado' : 'chás encontrados'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={st.loadingWrap}>
            <div style={st.loadingSpinner}>🍵</div>
            <p style={st.loadingTxt}>Preparando os chás...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div style={st.vazioWrap}>
            <p style={{ fontSize: 48 }}>🍃</p>
            <p style={st.vazioTxt}>Nenhum chá encontrado para "{busca}"</p>
          </div>
        ) : (
          <div className="grid-produtos" style={{ paddingBottom: 48 }}>
            {produtosFiltrados.map(p => <CardCha key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />)}
          </div>
        )}
      </div>
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
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(58,93,62,0.18)' : '0 2px 12px rgba(0,0,0,0.08)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={st.imgWrap}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/300x200/d4edda/3A5D3E?text=Chá'}
          alt={produto.nome}
          style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x200/d4edda/3A5D3E?text=Chá'; }}
        />
        {!temEstoque && <div style={st.semEstoque}>ESGOTADO</div>}
        <div style={st.chaTag}>🍵 Chá</div>
      </div>
      <div style={{ padding: '16px 16px 18px' }}>
        <h3 style={st.cardNome}>{produto.nome}</h3>
        <p style={st.cardDesc}>{(produto.descricao || '').slice(0, 75)}...</p>
        <div style={st.cardFooter}>
          <span style={st.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
          <button
            className="btn-verde"
            style={{ fontSize: 13, padding: '8px 16px', opacity: temEstoque ? 1 : 0.5 }}
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
    minHeight: 360,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    transition: 'background 1s ease',
  },
  heroContent: {
    padding: '60px 48px',
    zIndex: 1,
    flex: 1,
  },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitulo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 48,
    color: '#fff',
    marginBottom: 8,
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  heroSub: { fontSize: 20, color: '#D4AF37', fontWeight: 700, marginBottom: 8 },
  heroDetalhe: { fontSize: 15, color: 'rgba(255,255,255,0.8)', maxWidth: 480 },
  heroDots: { display: 'flex', gap: 8, marginTop: 24 },
  dot: { width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.3s' },
  heroDecor: { fontSize: 200, position: 'absolute', right: -20, top: -20, opacity: 0.08, pointerEvents: 'none' },

  // Benefícios
  beneficiosSection: { background: '#fff', padding: '40px 0' },
  secTitulo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    color: '#3A5D3E',
    textAlign: 'center',
    marginBottom: 28,
  },
  beneficiosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    padding: '0 20px',
  },
  beneficioCard: {
    textAlign: 'center',
    padding: '24px 16px',
    borderRadius: 12,
    background: '#f5f7f2',
    border: '1px solid #d0d7c4',
  },
  beneficioIcon: { fontSize: 36, marginBottom: 10 },
  beneficioTitulo: { fontSize: 15, fontWeight: 700, color: '#3A5D3E', marginBottom: 6 },
  beneficioDesc: { fontSize: 13, color: '#6c757d', lineHeight: 1.5 },

  // Busca
  buscaWrap: {
    position: 'relative',
    margin: '32px 0 16px',
    display: 'flex',
    alignItems: 'center',
  },
  buscaIcon: {
    position: 'absolute',
    left: 14,
    fontSize: 18,
    pointerEvents: 'none',
  },
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
    position: 'absolute',
    right: 14,
    background: 'none',
    border: 'none',
    fontSize: 16,
    color: '#888',
    cursor: 'pointer',
  },
  contador: { color: '#6c757d', fontSize: 13, marginBottom: 20 },

  // Loading / Vazio
  loadingWrap: { textAlign: 'center', padding: '60px 0' },
  loadingSpinner: { fontSize: 48, animation: 'pulse 1.5s infinite' },
  loadingTxt: { color: '#3A5D3E', fontSize: 15, marginTop: 12 },
  vazioWrap: { textAlign: 'center', padding: '60px 0' },
  vazioTxt: { color: '#888', fontSize: 15 },

  // Cards
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
    background: '#d4edda',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  semEstoque: {
    position: 'absolute',
    top: 10, right: 10,
    background: '#dc3545',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 4,
  },
  chaTag: {
    position: 'absolute',
    bottom: 8, left: 8,
    background: 'rgba(58,93,62,0.85)',
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 4,
  },
  cardNome: { fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6c757d', lineHeight: 1.5, marginBottom: 12 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  preco: { fontSize: 18, fontWeight: 800, color: '#dc3545' },
};

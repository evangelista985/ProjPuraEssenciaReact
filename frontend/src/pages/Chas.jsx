import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #1C3A2A 0%, #2D5A3D 100%)',
    titulo: 'Chás Naturais',
    subtitulo: 'A essência da natureza em sua xícara',
    detalhe: 'Ervas selecionadas com cuidado para proporcionar momentos de equilíbrio, bem-estar e harmonia em seu dia a dia.',
  },
  {
    bg: 'linear-gradient(135deg, #2D5A3D 0%, #1C3A2A 100%)',
    titulo: 'Rituais de Bem-estar',
    subtitulo: 'Sabor e saúde em perfeita harmonia',
    detalhe: 'Descubra nossa seleção exclusiva de blends artesanais, preparados para elevar seus momentos de pausa.',
  },
];

const BENEFICIOS = [
  { titulo: 'Puro & Natural' },
  { titulo: 'Bem-estar' },
  { titulo: 'Imunidade' },
  { titulo: 'Relaxamento' },
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
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(busca.toLowerCase())
  );

  const sl = HERO_SLIDES[slide];

  return (
    <div style={st.page}>
      {/* Hero Section */}
      <section style={{...st.hero, background: sl.bg}}>
        <div style={st.heroOverlay}></div>
        <div className="container" style={{...st.heroContainer, position: 'relative', zIndex: 1}}>
          <div style={st.heroContent} key={slide}>
                        <h1 style={st.heroTitulo}>{sl.titulo}</h1>
            <p style={st.heroSub}>{sl.subtitulo}</p>
            <p style={st.heroDetalhe}>{sl.detalhe}</p>
            <div style={st.heroDots}>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{ ...st.dot, width: i === slide ? 30 : 10, background: i === slide ? '#C8A96E' : 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Lista de Produtos */}
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={st.sectionHeader}>
          <h2 style={st.secTitulo}>Nossos Chás</h2>
          <div style={st.buscaWrapper}>
            <svg style={st.buscaIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              style={st.buscaInput}
              placeholder="Buscar por nome ou benefício..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={st.loadingWrap}>
            <div className="spinner"></div>
            <p>Selecionando as melhores ervas...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div style={st.vazioWrap}>
            <p>Nenhum chá encontrado para sua busca.</p>
            <button onClick={() => setBusca('')} style={st.resetBtn}>Ver todos</button>
          </div>
        ) : (
          <div className="grid-produtos">
            {produtosFiltrados.map(p => (
              <CardProduto key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardProduto({ produto, onClick }) {
  const { adicionar } = useCart();
  const temEstoque = produto.quantidade > 0;
  const [added, setAdded] = useState(false);

  function handleAdd(e) {
    e.stopPropagation();
    if (!temEstoque) return;
    adicionar(produto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div style={st.card} onClick={onClick}>
      <div style={st.imgContainer}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/400x400/f8f9fa/1C3A2A?text=Chá'}
          alt={produto.nome}
          style={st.img}
        />
        {!temEstoque && <div style={st.badgeEsgotado}>Esgotado</div>}
      </div>
      <div style={st.cardContent}>
        <h3 style={st.cardNome}>{produto.nome}</h3>
        <p style={st.cardDesc}>{(produto.descricao || '').slice(0, 60)}...</p>
        <div style={st.cardFooter}>
          <span style={st.cardPreco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
          <button
            style={{
              ...st.addBtn,
              ...(added ? st.addBtnAdded : {}),
              ...(!temEstoque ? st.addBtnDisabled : {}),
            }}
            disabled={!temEstoque}
            onClick={handleAdd}
            title={temEstoque ? 'Adicionar ao carrinho' : 'Produto esgotado'}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  page: { background: '#FCFBFA', minHeight: '100vh' },
  hero: { minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C3A2A', backgroundImage: 'url(/img/banner_chas_v2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'all 0.8s ease', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(28, 58, 42, 0.65)', zIndex: 0 },
  heroContainer: { padding: '0 2rem', width: '100%', display: 'flex', justifyContent: 'center' },
  heroContent: { maxWidth: '800px', color: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'heroFadeIn 0.7s ease' },
  heroBadge: { display: 'none' },
  heroTitulo: { fontSize: '4rem', marginBottom: '24px', fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: '1.5px', lineHeight: 1.2 },
  heroSub: { fontSize: '1.4rem', color: '#3E7A52', fontWeight: 500, marginBottom: '24px', letterSpacing: '0.8px' },
  heroDetalhe: { fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.8, marginBottom: '40px', maxWidth: '650px', fontWeight: 300 },
  heroDots: { display: 'flex', gap: '10px', justifyContent: 'center' },
  dot: { height: '6px', borderRadius: '3px', border: 'none', cursor: 'pointer', transition: 'all 0.3s' },
  beneficiosSection: { padding: '40px 0', background: '#FFF', borderBottom: '1px solid #F0EFEA' },
  beneficiosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' },
  beneficioCard: { textAlign: 'center' },
  beneficioTitulo: { fontSize: '1.1rem', fontWeight: 700, color: '#1C3A2A', marginBottom: '8px', letterSpacing: '0.5px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' },
  secTitulo: { fontSize: '2rem', color: '#1C3A2A', fontFamily: "'Playfair Display', serif", fontWeight: 700 },
  buscaWrapper: { position: 'relative', width: '100%', maxWidth: '350px' },
  buscaIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '1C3A2A' },
  buscaInput: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '30px', border: '1px solid #E0DDD5', outline: 'none' },
  loadingWrap: { textAlign: 'center', padding: '60px 0', color: '#6B6050' },
  vazioWrap: { textAlign: 'center', padding: '60px 0', color: '#6B6050' },
  resetBtn: { background: 'none', color: '#3E7A52', fontWeight: 600, textDecoration: 'underline', marginTop: '10px' },
  card: { background: '#FFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F0EFEA', cursor: 'pointer', transition: 'all 0.3s' },
  imgContainer: { height: '220px', overflow: 'hidden', position: 'relative' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  badgeEsgotado: { position: 'absolute', top: '10px', right: '10px', background: '#FFF', color: '#E74C3C', padding: '4px 10px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 700 },
  cardContent: { padding: '20px' },
  cardNome: { fontSize: '1.1rem', color: '#1C3A2A', fontWeight: 600, marginBottom: '8px' },
  cardDesc: { fontSize: '0.85rem', color: '#6B6050', marginBottom: '15px', height: '2.5rem', overflow: 'hidden' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardPreco: { fontSize: '1.1rem', fontWeight: 700, color: '#1C3A2A' },
  addBtn: { background: '#1C3A2A', color: '#FFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1, transition: 'background 0.2s, transform 0.15s', flexShrink: 0 },
  addBtnAdded: { background: '#3E7A52', transform: 'scale(1.15)' },
  addBtnDisabled: { background: '#C8C4BC', cursor: 'not-allowed' }
};

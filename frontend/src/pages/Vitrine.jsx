import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SLIDES = [
  { src: '/img/organicoCafe.jpg',    alt: 'Café Orgânico'      },
  { src: '/img/chaCamomila4.png',    alt: 'Chás Naturais'      },
  { src: '/img/temperoOregano_1.jpg',alt: 'Temperos Naturais'  },
];

const CATEGORIAS = [
  { icon: '🍃', nome: 'Chás & Ervas',  desc: 'Camomila, Hortelã, Mate e mais', path: '/chas' },
  { icon: '🌱', nome: 'Orgânicos',     desc: 'Café, Cacau, Açúcar e mais',      path: '/organicos' },
  { icon: '🌿', nome: 'Temperos',      desc: 'Orégano, Alecrim, Manjericão',    path: '/temperos' },
];

export default function Vitrine() {
  const [produtos, setProdutos] = useState([]);
  const [filtros,  setFiltros]  = useState({ nome: '' });
  const [loading,  setLoading]  = useState(true);
  const [slide,    setSlide]    = useState(0);
  const nav = useNavigate();

  async function buscar() {
    setLoading(true);
    const params = {};
    if (filtros.nome) params.nome = filtros.nome;
    try {
      const { data } = await api.get('/produtos', { params });
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { buscar(); }, []);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero Carrossel */}
      <div style={st.carousel}>
        {SLIDES.map((img, i) => (
          <div key={i} style={{ ...st.slide, opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}>
            <img src={img.src} alt={img.alt} style={st.slideImg}
              onError={e => { e.target.src = 'https://via.placeholder.com/1200x480/1C3A2A/C8A96E?text=Pura+Ess%C3%AAncia'; }} />
            <div style={st.slideOverlay}>
              <span style={st.heroBadge}>✦ Natureza em cada produto</span>
              <h1 style={st.slideTitle}>
                Pureza <em style={{ fontStyle: 'italic', color: '#E2C98A' }}>da natureza</em><br/>
                para sua vida
              </h1>
              <p style={st.slideSubtitle}>Chás, temperos e orgânicos selecionados com cuidado</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-verde" onClick={() => nav('/chas')}>Explorar produtos</button>
                <button className="btn-outline" style={{ background: 'transparent', color: '#F5F0E8', borderColor: 'rgba(245,240,232,0.5)' }} onClick={() => nav('/organicos')}>Ver orgânicos</button>
              </div>
            </div>
          </div>
        ))}
        <button style={{ ...st.carBtn, left: 16 }} onClick={() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
        <button style={{ ...st.carBtn, right: 16 }} onClick={() => setSlide(s => (s + 1) % SLIDES.length)}>›</button>
        <div style={st.dots}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ ...st.dot, background: i === slide ? '#C8A96E' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      </div>

      {/* Features bar */}
      <div style={st.featuresBar}>
        {[
          { icon: '🌿', txt: '100% Natural' },
          { icon: '🚚', txt: 'Entrega rápida' },
          { icon: '✓',  txt: 'Qualidade garantida' },
          { icon: '🌱', txt: 'Sustentável' },
        ].map((f, i) => (
          <div key={i} style={st.featureItem}>
            <div style={st.featureIcon}>{f.icon}</div>
            <span>{f.txt}</span>
          </div>
        ))}
      </div>

      {/* Seção Categorias */}
      <section style={st.categoriesSection}>
        <div className="container">
          <div style={st.sectionHeader}>
            <span style={st.sectionLabel}>Explore por categoria</span>
            <h2 style={st.sectionTitle}>O que você <em style={{ fontStyle: 'italic', color: '#A07840' }}>procura?</em></h2>
          </div>
          <div style={st.categoriesGrid}>
            {CATEGORIAS.map((cat, i) => (
              <div key={i} style={st.categoryCard} onClick={() => nav(cat.path)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#C8A96E';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,58,42,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                <div style={st.catIcon}>{cat.icon}</div>
                <div style={st.catName}>{cat.nome}</div>
                <div style={st.catDesc}>{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Busca */}
      <section style={st.productsSection}>
        <div className="container">
          <div style={st.sectionHeader}>
            <span style={st.sectionLabel}>Mais vendidos</span>
            <h2 style={st.sectionTitle}>Nossos <em style={{ fontStyle: 'italic', color: '#A07840' }}>destaques</em></h2>
            <p style={st.sectionSub}>Produtos selecionados com cuidado para você</p>
          </div>

          {/* Filtro */}
          <div style={st.searchBar}>
            <input
              placeholder="Buscar produto... ex: Camomila, Alecrim, Café"
              value={filtros.nome}
              onChange={e => setFiltros({ ...filtros, nome: e.target.value })}
              style={st.searchInput}
            />
            <button className="btn-verde" onClick={buscar} style={{ flexShrink: 0 }}>Buscar</button>
            {filtros.nome && (
              <button onClick={() => { setFiltros({ nome: '' }); setTimeout(buscar, 100); }}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '10px 16px', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                Limpar
              </button>
            )}
          </div>

          {/* Banner promoção */}
          <div style={st.promoBanner}>
            ✦ Nas compras acima de R$ 60,00 ganhe um brinde sustentável
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--green)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
              🌿 Carregando produtos...
            </p>
          ) : produtos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Nenhum produto encontrado.</p>
          ) : (
            <div className="grid-produtos" style={{ paddingBottom: '4rem' }}>
              {produtos.map(p => <CardProduto key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CardProduto({ produto, onClick }) {
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
        <img
          src={produto.imagem || 'https://via.placeholder.com/300x220/EDE7D8/1C3A2A?text=Produto'}
          alt={produto.nome}
          style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x220/EDE7D8/1C3A2A?text=Produto'; }}
        />
        {!temEstoque && <div style={st.semEstoque}>SEM ESTOQUE</div>}
        <span style={st.categBadge}>{produto.categoria_nome}</span>
      </div>
      <div style={{ padding: '1.2rem' }}>
        <div style={st.productCategory}>{produto.categoria_nome}</div>
        <h3 style={st.cardTitulo}>{produto.nome}</h3>
        <p style={st.cardDesc}>{produto.descricao?.slice(0, 80)}...</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
          <p style={st.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</p>
          <button className="btn-verde" style={{ fontSize: '0.7rem', padding: '8px 16px' }} disabled={!temEstoque}>
            {temEstoque ? 'Ver detalhes' : 'Indisponível'}
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  // Carrossel
  carousel:    { position: 'relative', height: 480, overflow: 'hidden' },
  slide:       { position: 'absolute', inset: 0, transition: 'opacity 0.8s ease' },
  slideImg:    { width: '100%', height: '100%', objectFit: 'cover' },
  slideOverlay:{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(28,58,42,0.82) 0%, rgba(28,58,42,0.3) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5rem' },
  heroBadge:   { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(200,169,110,0.2)', border: '1px solid rgba(200,169,110,0.4)', padding: '0.4rem 1rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E2C98A', width: 'fit-content', marginBottom: '1.5rem' },
  slideTitle:  { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', fontWeight: 300, color: '#F5F0E8', lineHeight: 1.15, marginBottom: '1rem' },
  slideSubtitle:{ fontSize: '1rem', color: 'rgba(245,240,232,0.75)', fontWeight: 300, maxWidth: 420 },
  carBtn:      { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(28,58,42,0.5)', color: '#F5F0E8', border: '1px solid rgba(200,169,110,0.3)', fontSize: 28, width: 44, height: 44, cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dots:        { position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 },
  dot:         { width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.3s' },

  // Features bar
  featuresBar: { background: '#1C3A2A', padding: '1.2rem 4rem', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'rgba(245,240,232,0.8)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' },
  featureIcon: { width: 28, height: 28, background: 'rgba(200,169,110,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E2C98A', fontSize: '0.9rem' },

  // Sections
  categoriesSection: { background: 'var(--cream-light)', padding: '5rem 0' },
  productsSection:   { padding: '5rem 0' },
  sectionHeader:     { textAlign: 'center', marginBottom: '3rem' },
  sectionLabel:      { display: 'inline-block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A07840', fontWeight: 500, marginBottom: '0.8rem' },
  sectionTitle:      { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 300, color: '#1C3A2A', lineHeight: 1.2 },
  sectionSub:        { color: '#6B6050', marginTop: '0.6rem', fontWeight: 300, maxWidth: 480, margin: '0.8rem auto 0' },

  // Categorias
  categoriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
  categoryCard:   { background: 'var(--cream)', border: '1px solid rgba(200,169,110,0.25)', padding: '2.5rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s' },
  catIcon:        { fontSize: '2rem', marginBottom: '1rem' },
  catName:        { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#1C3A2A', fontWeight: 600, marginBottom: '0.4rem' },
  catDesc:        { fontSize: '0.8rem', color: '#6B6050' },

  // Busca
  searchBar:   { display: 'flex', gap: 12, marginBottom: '1.5rem', maxWidth: 600 },
  searchInput: { flex: 1, border: '1px solid var(--border)', background: 'var(--cream-light)', padding: '10px 16px', fontSize: '0.9rem', outline: 'none' },

  // Promo banner
  promoBanner: { background: '#1C3A2A', color: 'rgba(245,240,232,0.85)', textAlign: 'center', padding: '1rem 2rem', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2.5rem' },

  // Cards produto
  card:        { background: 'var(--cream-light)', border: '1px solid rgba(200,169,110,0.25)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' },
  imgWrap:     { position: 'relative', background: 'var(--cream-dark)', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img:         { width: '100%', height: '100%', objectFit: 'cover' },
  semEstoque:  { position: 'absolute', top: 10, right: 10, background: 'var(--perigo)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' },
  categBadge:  { position: 'absolute', bottom: 8, left: 8, background: 'rgba(28,58,42,0.85)', color: '#E2C98A', fontSize: 10, fontWeight: 600, padding: '3px 9px', letterSpacing: '0.06em', textTransform: 'uppercase' },
  productCategory: { fontSize: '0.7rem', color: '#A07840', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 500 },
  cardTitulo:  { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 600, color: '#1A1A14', marginBottom: '0.4rem' },
  cardDesc:    { fontSize: '0.82rem', color: '#6B6050', lineHeight: 1.6, fontWeight: 300 },
  preco:       { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: '#1C3A2A' },
};

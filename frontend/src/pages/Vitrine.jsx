import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SLIDES = [
  { src: '/img/organicoCafe_1.jpg',    alt: 'Café Orgânico'      },
  { src: '/img/chaCamomila4.png',      alt: 'Chás Naturais'      },
  { src: '/img/temperoOregano_1.jpg',  alt: 'Temperos Naturais'  },
];

export default function Vitrine() {
  const [produtos,    setProdutos]   = useState([]);
  const [categorias,  setCategorias] = useState([]);
  const [filtros,     setFiltros]    = useState({ nome: '', categoria_id: '' });
  const [loading,     setLoading]    = useState(true);
  const [slide,       setSlide]      = useState(0);
  const nav = useNavigate();

  async function buscar() {
    setLoading(true);
    const params = {};
    if (filtros.nome)         params.nome         = filtros.nome;
    if (filtros.categoria_id) params.categoria_id = filtros.categoria_id;
    const { data } = await api.get('/produtos', { params });
    setProdutos(data);
    setLoading(false);
  }

  useEffect(() => {
    api.get('/produtos/categorias').then(r => setCategorias(r.data));
    buscar();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="container" style={{ padding: '0 20px 30px' }}>

      {/* Carrossel */}
      <div style={st.carousel}>
        {SLIDES.map((img, i) => (
          <div key={i} style={{ ...st.slide, opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}>
            <img src={img.src} alt={img.alt} style={st.slideImg}
              onError={e => { e.target.src = 'https://via.placeholder.com/1200x380/3A5D3E/D4AF37?text=Pura+Ess%C3%AAncia'; }} />
            <div style={st.slideOverlay}>
              <h1 style={st.slideTitle}>Natureza em cada produto</h1>
              <p  style={st.slideSubtitle}>Chás, temperos e orgânicos selecionados com cuidado</p>
            </div>
          </div>
        ))}
        <button style={{ ...st.carBtn, left: 12 }} onClick={() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
        <button style={{ ...st.carBtn, right: 12 }} onClick={() => setSlide(s => (s + 1) % SLIDES.length)}>›</button>
        <div style={st.dots}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ ...st.dot, background: i === slide ? '#D4AF37' : 'rgba(255,255,255,0.5)' }} />
          ))}
        </div>
      </div>

      {/* Banner Promoção */}
      <div style={st.promoBanner}>
        🌿 Nas compras acima de R$ 60,00 ganhe um brinde sustentável
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 28, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={st.label}>Buscar produto</label>
          <input placeholder="Ex: Camomila, Alecrim..." value={filtros.nome}
            onChange={e => setFiltros({ ...filtros, nome: e.target.value })} />
        </div>
        <div style={{ minWidth: 180 }}>
          <label style={st.label}>Categoria</label>
          <select value={filtros.categoria_id} onChange={e => setFiltros({ ...filtros, categoria_id: e.target.value })}>
            <option value="">Todas</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <button className="btn-verde" onClick={buscar}>🔍 Buscar</button>
        <button onClick={() => { setFiltros({ nome: '', categoria_id: '' }); setTimeout(buscar, 100); }}
          style={{ background: '#eee', color: '#333', padding: '12px 18px', borderRadius: 8 }}>Limpar</button>
      </div>

      {/* Grid de Produtos */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: 40, color: '#3A5D3E', fontSize: 16 }}>🌿 Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid-produtos">
          {produtos.map(p => <CardProduto key={p.id} produto={p} onClick={() => nav(`/produto/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function CardProduto({ produto, onClick }) {
  const temEstoque = produto.quantidade > 0;
  return (
    <div style={st.card} onClick={onClick}>
      <div style={st.imgWrap}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/300x200/f5f7f2/3A5D3E?text=Produto'}
          alt={produto.nome}
          style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x200/f5f7f2/3A5D3E?text=Produto'; }}
        />
        {!temEstoque && <div style={st.semEstoque}>SEM ESTOQUE</div>}
        <span style={st.categBadge}>{produto.categoria_nome}</span>
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        <h3 style={st.cardTitulo}>{produto.nome}</h3>
        <p style={st.cardDesc}>{produto.descricao?.slice(0, 80)}...</p>
        <p style={st.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</p>
        <button className="btn-verde" style={{ width: '100%', marginTop: 10, fontSize: 14 }}
          disabled={!temEstoque}>
          {temEstoque ? 'Ver Detalhes' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}

const st = {
  label:       { display: 'block', fontSize: 12, fontWeight: 700, color: '#3A5D3E', marginBottom: 6 },
  // Carrossel
  carousel:    { position: 'relative', height: 380, overflow: 'hidden', borderRadius: '0 0 12px 12px', marginBottom: 0 },
  slide:       { position: 'absolute', inset: 0, transition: 'opacity 0.7s ease' },
  slideImg:    { width: '100%', height: '100%', objectFit: 'cover' },
  slideOverlay:{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(58,93,62,0.7) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px' },
  slideTitle:  { fontFamily: "'Playfair Display', serif", fontSize: 42, color: '#fff', marginBottom: 10 },
  slideSubtitle:{ fontSize: 18, color: '#ecf0f1' },
  carBtn:      { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', color: '#fff', border: 'none', fontSize: 30, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', zIndex: 2 },
  dots:        { position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 },
  dot:         { width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.3s' },
  // Promoção
  promoBanner: { background: '#d0d7c4', textAlign: 'center', padding: '16px 24px', borderRadius: 30, fontSize: 18, fontWeight: 700, color: '#333', maxWidth: 560, margin: '24px auto' },
  // Cards
  card:        { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' },
  imgWrap:     { position: 'relative', background: '#f5f7f2', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img:         { width: '100%', height: '100%', objectFit: 'cover' },
  semEstoque:  { position: 'absolute', top: 10, right: 10, background: '#dc3545', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 },
  categBadge:  { position: 'absolute', bottom: 8, left: 8, background: 'rgba(58,93,62,0.85)', color: '#D4AF37', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitulo:  { fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#333' },
  cardDesc:    { fontSize: 13, color: '#6c757d', lineHeight: 1.5, marginBottom: 8 },
  preco:       { fontSize: 20, fontWeight: 800, color: '#dc3545' },
};

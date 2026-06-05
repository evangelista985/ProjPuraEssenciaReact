import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const RECEITAS_POPULARES = [
  { nome: 'Massas ao Alecrim' },
  { nome: 'Pizza Artesanal' },
  { nome: 'Saladas Frescas' },
  { nome: 'Risotos Gourmet' },
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
    <div style={st.page}>
      {/* Hero Section */}
      <section style={st.hero}>
        <div style={st.heroOverlay}></div>
        <div className="container" style={{...st.heroContainer, position: 'relative', zIndex: 1}}>
          <div style={st.heroContent}>
                        <h1 style={st.heroTitulo}>Temperos & Especiarias</h1>
            <p style={st.heroSub}>O segredo das melhores cozinhas em sua casa</p>
            <p style={st.heroDesc}>
              Nossa seleção de ervas finas e especiarias é colhida e desidratada artesanalmente para preservar cada nota aromática.
            </p>
            <div style={st.heroTags}>
              {['Alecrim', 'Orégano', 'Manjericão', 'Tomilho', 'Sálvia'].map(t => (
                <span key={t} style={st.heroTag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Lista de Produtos */}
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={st.sectionHeader}>
          <h2 style={st.listTitulo}>Nossa Seleção</h2>
          <div style={st.buscaWrapper}>
            <svg style={st.buscaIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              style={st.buscaInput}
              placeholder="O que você deseja cozinhar hoje?"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={st.loadingWrap}>
            <div className="spinner"></div>
            <p>Preparando os aromas...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div style={st.vazioWrap}>
            <p>Não encontramos o tempero que você busca.</p>
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
          src={produto.imagem || 'https://via.placeholder.com/400x400/f8f9fa/1C3A2A?text=Tempero'}
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
  hero: { 
    minHeight: '500px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#1C3A2A',
    backgroundImage: 'url(/img/banner_temperos_v2.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(28, 58, 42, 0.65)',
    zIndex: 0
  },
  heroContainer: { padding: '0 2rem', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' },
  heroContent: { maxWidth: '800px', color: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroBadge: { display: 'none' },
  heroTitulo: { fontSize: '4rem', marginBottom: '24px', fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: '1.5px', lineHeight: 1.2 },
  heroSub: { fontSize: '1.4rem', color: '#3E7A52', fontWeight: 500, marginBottom: '24px', letterSpacing: '0.8px' },
  heroDesc: { fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.8, marginBottom: '40px', maxWidth: '650px', fontWeight: 300 },
  heroTags: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' },
  heroTag: { background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.2)' },
  receitasSection: { padding: '50px 0', background: '#FFF', borderBottom: '1px solid #F0EFEA' },
  secTitulo: { fontSize: '1.8rem', color: '#1C3A2A', fontFamily: "'Cormorant Garamond', serif", textAlign: 'center', marginBottom: '40px' },
  receitasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  receitaCard: { display: 'flex', alignItems: 'center', gap: '15px', background: '#FCFBFA', padding: '20px', borderRadius: '12px', border: '1px solid #F0EFEA' },
  receitaNome: { fontSize: '1.05rem', fontWeight: 700, color: '#1C3A2A', marginBottom: '4px', letterSpacing: '0.5px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' },
  listTitulo: { fontSize: '2rem', color: '#1C3A2A', fontFamily: "'Playfair Display', serif", fontWeight: 700 },
  buscaWrapper: { position: 'relative', width: '100%', maxWidth: '350px' },
  buscaIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
  buscaInput: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '30px', border: '1px solid #E0DDD5', outline: 'none' },
  loadingWrap: { textAlign: 'center', padding: '60px 0', color: '#5e4015' },
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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORIA_MAP = {
  'todos':     null,
  'chas':      'chá',
  'organicos': 'orgân',
  'temperos':  'tempero',
  'cosmeticos': 'cosmético',
};

export default function Produtos() {
  const nav = useNavigate();
  const location = useLocation();
  const { adicionar } = useCart();
  const [produtos, setProdutos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroNome, setFiltroNome] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) setFiltroNome(search);
    const cat = params.get('categoria');
    if (cat) setFiltroCategoria(cat);
  }, [location.search]);

  useEffect(() => { carregarProdutos(); }, []);

  async function carregarProdutos() {
    setLoading(true);
    try {
      const { data } = await api.get('/produtos');
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      let matchCategoria = true;
      if (filtroCategoria !== 'todos') {
        const termo = CATEGORIA_MAP[filtroCategoria];
        const catNome = (p.categoria_nome || p.categoria || '').toLowerCase();
        matchCategoria = catNome.includes(termo);
      }
      const matchNome =
        p.nome.toLowerCase().includes(filtroNome.toLowerCase()) ||
        (p.descricao || '').toLowerCase().includes(filtroNome.toLowerCase());
      return matchCategoria && matchNome;
    });
  }, [produtos, filtroCategoria, filtroNome]);

  const categorias = [
    { key: 'todos',     label: 'Todos' },
    { key: 'chas',      label: 'Chás' },
    { key: 'organicos', label: 'Orgânicos' },
    { key: 'temperos',  label: 'Temperos' },
    { key: 'cosmeticos', label: 'Cosméticos' },
  ];

  return (
    <div style={st.page}>
      <div style={st.container}>
        <header style={st.header}>
          <span style={st.headerLabel}>Nossa Coleção</span>
          <h1 style={st.titulo}>Produtos Naturais</h1>
          <p style={st.subtitulo}>Selecionados com carinho para sua saúde e bem-estar.</p>
        </header>

        {/* Filtros */}
        <div style={st.filtrosContainer}>
          <div style={st.tabsCategorias}>
            {categorias.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFiltroCategoria(cat.key)}
                style={{ ...st.tabBtn, ...(filtroCategoria === cat.key ? st.tabBtnActive : {}) }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div style={st.buscaWrapper}>
            <svg style={st.buscaIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar produto..."
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
              style={st.inputBusca}
            />
            {filtroNome && (
              <button onClick={() => setFiltroNome('')} style={st.limparBusca}>✕</button>
            )}
          </div>
        </div>

        {/* Resultado */}
        {loading ? (
          <div style={st.loadingState}><p>🌿 Carregando produtos...</p></div>
        ) : (
          <>
            <div style={st.metaInfo}>
              <span>{produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'item' : 'itens'} encontrados</span>
              {(filtroCategoria !== 'todos' || filtroNome) && (
                <button onClick={() => { setFiltroCategoria('todos'); setFiltroNome(''); }} style={st.resetBtn}>
                  Limpar filtros
                </button>
              )}
            </div>

            {produtosFiltrados.length === 0 ? (
              <div style={st.vazioContainer}>
                <p style={st.vazioTexto}>Nenhum produto encontrado com esses critérios.</p>
                <button onClick={() => { setFiltroCategoria('todos'); setFiltroNome(''); }} style={st.btnPrimario}>
                  Ver todos os produtos
                </button>
              </div>
            ) : (
              <div style={st.grid}>
                {produtosFiltrados.map(p => (
                  <CardProduto
                    key={p.id}
                    produto={p}
                    onClick={() => nav(`/produto/${p.id}`)}
                    onAdd={e => { e.stopPropagation(); adicionar(p); }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CardProduto({ produto, onClick, onAdd }) {
  const temEstoque = produto.quantidade > 0;
  const [added, setAdded] = useState(false);

  function handleAdd(e) {
    e.stopPropagation();
    if (!temEstoque) return;
    onAdd(e);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      style={st.card}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(28,58,42,0.13)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      <div style={st.imgContainer}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/400x400/f8f9fa/1C3A2A?text=Pura+Essência'}
          alt={produto.nome}
          style={st.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/400x400/f8f9fa/1C3A2A?text=Pura+Essência'; }}
        />
        {!temEstoque && <div style={st.badgeEsgotado}>Esgotado</div>}
        <div style={st.imgGradient} />
      </div>
      <div style={st.cardContent}>
        <span style={st.cardCategoria}>{produto.categoria_nome || 'Natural'}</span>
        <h3 style={st.cardNome}>{produto.nome}</h3>
        <p style={st.cardDesc}>
          {(produto.descricao || '').slice(0, 72)}{(produto.descricao?.length || 0) > 72 ? '…' : ''}
        </p>
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
  page: {
    backgroundColor: '#FCFBFA',
    minHeight: '100vh',
    paddingTop: 'clamp(84px,12vw,100px)',
    paddingBottom: '60px',
  },
  container: { maxWidth: 1240, margin: '0 auto', padding: '0 clamp(12px,4vw,20px)' },
  header: { textAlign: 'center', marginBottom: '48px' },
  headerLabel: {
    display: 'inline-block', fontSize: '0.68rem', letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#A07840', fontWeight: 600, marginBottom: '0.6rem',
  },
  titulo: {
    fontSize: 'clamp(2rem,4vw,2.8rem)',
    color: '#1C3A2A', marginBottom: '10px', fontWeight: 400,
    fontFamily: "'Cormorant Garamond', serif",
  },
  subtitulo: { color: '#6B6050', fontSize: '1rem', maxWidth: 560, margin: '0 auto' },
  filtrosContainer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '36px', gap: '16px', flexWrap: 'wrap',
  },
  tabsCategorias: {
    display: 'flex', gap: '6px', background: '#F0EFEA',
    padding: '4px', borderRadius: '30px', flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 22px', borderRadius: '25px', fontSize: '0.85rem',
    fontWeight: 600, color: '#6B6050', background: 'transparent',
    border: 'none', cursor: 'pointer', transition: 'all 0.22s ease',
    fontFamily: "'Jost', sans-serif",
  },
  tabBtnActive: {
    background: '#1C3A2A', color: '#FFF',
    boxShadow: '0 4px 12px rgba(28,58,42,0.2)',
  },
  buscaWrapper: { position: 'relative', flex: '1 1 240px', maxWidth: '380px' },
  buscaIcon: {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none',
  },
  inputBusca: {
    width: '100%', padding: '11px 38px 11px 42px',
    borderRadius: '30px', border: '1px solid #E0DDD5',
    fontSize: '0.9rem', outline: 'none', background: '#FFF',
    boxSizing: 'border-box', fontFamily: "'Jost', sans-serif",
  },
  limparBusca: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '13px',
  },
  metaInfo: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', color: '#999', fontSize: '0.88rem', flexWrap: 'wrap', gap: '8px',
  },
  resetBtn: {
    background: 'none', border: 'none', color: '#C8A96E',
    fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.88rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#FFF', borderRadius: '16px', overflow: 'hidden',
    border: '1px solid #F0EFEA', cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    display: 'flex', flexDirection: 'column',
  },
  imgContainer: {
    height: '220px', overflow: 'hidden',
    position: 'relative', background: '#F9F8F6', flexShrink: 0,
  },
  img: {
    width: '100%', height: '100%', objectFit: 'cover',
    display: 'block', transition: 'transform 0.4s ease',
  },
  imgGradient: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, transparent 55%, rgba(28,58,42,0.07) 100%)',
    pointerEvents: 'none',
  },
  badgeEsgotado: {
    position: 'absolute', top: 12, right: 12,
    background: '#fff', color: '#E74C3C',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '0.7rem', fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  cardContent: {
    padding: '16px 18px 20px',
    display: 'flex', flexDirection: 'column', flex: 1,
  },
  cardCategoria: {
    fontSize: '0.65rem', textTransform: 'uppercase',
    letterSpacing: '1.5px', color: '#C8A96E', fontWeight: 700,
    marginBottom: '6px', display: 'block',
  },
  cardNome: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.1rem', color: '#1C3A2A', marginBottom: '8px',
    fontWeight: 600, lineHeight: 1.35,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', minHeight: '2.7rem',
  },
  cardDesc: {
    fontSize: '0.78rem', color: '#8A8070', lineHeight: 1.5,
    marginBottom: '14px', flex: 1,
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 'auto',
  },
  cardPreco: { fontSize: '1.2rem', fontWeight: 700, color: '#1C3A2A' },
  addBtn: {
    background: '#1C3A2A', color: '#FFF',
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
    fontSize: '1.4rem', fontWeight: 700, lineHeight: 1,
    transition: 'background 0.2s, transform 0.15s',
    flexShrink: 0,
  },
  addBtnAdded: { background: '#3E7A52', transform: 'scale(1.15)' },
  addBtnDisabled: { background: '#C8C4BC', cursor: 'not-allowed' },
  loadingState: { textAlign: 'center', padding: '80px 0', color: '#1C3A2A', fontSize: '1rem' },
  vazioContainer: {
    textAlign: 'center', padding: '80px 20px',
    background: '#FFF', borderRadius: '16px', border: '1px dashed #E0DDD5',
  },
  vazioTexto: { marginBottom: '20px', color: '#6B6050', fontSize: '1rem' },
  btnPrimario: {
    background: '#1C3A2A', color: '#FFF', padding: '12px 32px',
    borderRadius: '30px', fontWeight: 600, border: 'none', cursor: 'pointer',
  },
};

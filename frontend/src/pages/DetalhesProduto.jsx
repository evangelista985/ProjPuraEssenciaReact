import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function DetalhesProduto() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const { adicionar } = useCart();
  const { cliente }   = useAuth();
  const [produto, setProduto] = useState(null);
  const [qtd,     setQtd]    = useState(1);
  const [msg,     setMsg]    = useState('');

  useEffect(() => {
    api.get(`/produtos/${id}`).then(r => setProduto(r.data)).catch(() => nav('/'));
  }, [id]);

  function adicionarCarrinho() {
    if (!cliente) return nav('/login');
    if (produto.quantidade <= 0) return;
    adicionar(produto, qtd);
    setMsg('✅ Adicionado ao carrinho!');
    setTimeout(() => setMsg(''), 2000);
  }

  if (!produto) return <p style={{ textAlign: 'center', padding: 40, color: '#3A5D3E' }}>🌿 Carregando...</p>;

  return (
    <div className="container" style={{ paddingTop: 'clamp(68px,9vw,84px)', paddingBottom: 40, paddingLeft: 'clamp(12px,4vw,20px)', paddingRight: 'clamp(12px,4vw,20px)' }}>
      <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#3A5D3E', fontSize: 15, cursor: 'pointer', marginBottom: 20, fontWeight: 700, minHeight: 44, padding: '0 4px' }}>
        ← Voltar
      </button>

      <div className="produto-detalhe-layout">
        {/* Imagem */}
        <div style={{ background: '#f5f7f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, overflow: 'hidden' }}>
          <img
            src={produto.imagem || 'https://via.placeholder.com/400x300/f5f7f2/3A5D3E?text=Produto'}
            alt={produto.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 380 }}
            onError={e => { e.target.src = 'https://via.placeholder.com/400x300/f5f7f2/3A5D3E?text=Produto'; }}
          />
        </div>

        {/* Info */}
        <div>
          <span style={st.categLabel}>{produto.categoria_nome}</span>
          <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)', marginTop: 8, marginBottom: 16 }}>{produto.nome}</h1>
          <p style={{ fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 800, color: '#dc3545', marginBottom: 6 }}>
            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
          </p>
          <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 20 }}>À vista no PIX ou Cartão de Crédito/Débito</p>
          <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{produto.descricao}</p>

          {/* Estoque */}
          <div style={{ marginBottom: 20 }}>
            {produto.quantidade > 0 ? (
              <span style={{ color: '#3A5D3E', fontWeight: 700, fontSize: 14 }}>
                ✓ Em estoque ({produto.quantidade} disponíveis)
              </span>
            ) : (
              <span style={{ color: '#dc3545', fontWeight: 700, fontSize: 14 }}>✕ Produto indisponível</span>
            )}
          </div>

          {/* Quantidade */}
          {produto.quantidade > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Quantidade:</span>
              <div style={st.qtdCtrl}>
                <button style={st.qtdBtn} onClick={() => setQtd(q => Math.max(1, q - 1))}>−</button>
                <span style={st.qtdNum}>{qtd}</span>
                <button style={st.qtdBtn} onClick={() => setQtd(q => Math.min(produto.quantidade, q + 1))}>+</button>
              </div>
            </div>
          )}

          {msg && <p className={msg.includes('✅') ? 'sucesso' : 'erro'} style={{ marginBottom: 12 }}>{msg}</p>}

          <button className="btn-verde" style={{ width: '100%', fontSize: 'clamp(14px,4vw,17px)', padding: '15px 0', minHeight: 52 }}
            onClick={adicionarCarrinho} disabled={produto.quantidade <= 0}>
            🛒 Adicionar ao Carrinho
          </button>

          {!cliente && (
            <p style={{ color: '#888', fontSize: 13, marginTop: 10, textAlign: 'center' }}>
              Você precisa estar logado para comprar.{' '}
              <span onClick={() => nav('/login')} style={{ color: '#3A5D3E', cursor: 'pointer', fontWeight: 700 }}>Entrar</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const st = {
  categLabel: { display: 'inline-block', background: '#e8f0e9', color: '#3A5D3E', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 },
  qtdCtrl:    { display: 'flex', alignItems: 'center', border: '2px solid #d0d7c4', borderRadius: 6, overflow: 'hidden' },
  qtdBtn:     { background: '#f5f7f2', border: 'none', width: 40, height: 40, fontSize: 18, cursor: 'pointer', fontWeight: 700, color: '#3A5D3E' },
  qtdNum:     { width: 42, textAlign: 'center', fontWeight: 700, fontSize: 16 },
};

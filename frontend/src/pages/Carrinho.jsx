import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Carrinho() {
  const { itens, remover, atualizarQtd, total } = useCart();
  const { cliente } = useAuth();
  const nav = useNavigate();

  if (itens.length === 0) return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 60, textAlign: 'center' }}>
      <p style={{ fontSize: 60 }}>🛒</p>
      <h2 style={{ marginTop: 16, marginBottom: 12 }}>Carrinho vazio</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>Adicione produtos para continuar.</p>
      <button className="btn-verde" onClick={() => nav('/')}>Ver Vitrine</button>
    </div>
  );

  function avancar() {
    if (!cliente) return nav('/login');
    nav('/checkout/endereco');
  }

  return (
    <div className="container" style={{ paddingTop: 'clamp(84px,12vw,100px)', paddingBottom: 40, paddingLeft: 'clamp(12px,4vw,20px)', paddingRight: 'clamp(12px,4vw,20px)' }}>
      <h1 style={{ marginBottom: 24, fontSize: 'clamp(1.6rem,5vw,2.2rem)' }}>Meu Carrinho</h1>

      <div className="carrinho-layout">

        {/* ── Itens ── */}
        <div className="carrinho-itens">
          {itens.map(item => (
            <div key={item.produto_id} className="card"
              style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <img
                className="cart-item-img"
                src={item.imagem || 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                onError={e => { e.target.src = 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 'clamp(13px,3vw,15px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={st.qtdCtrl}>
                    <button style={st.qtdBtn} onClick={() => atualizarQtd(item.produto_id, item.quantidade - 1)}>−</button>
                    <span style={st.qtdNum}>{item.quantidade}</span>
                    <button style={st.qtdBtn} onClick={() => atualizarQtd(item.produto_id, item.quantidade + 1)}>+</button>
                  </div>
                  <p style={{ color: '#dc3545', fontWeight: 800, fontSize: 'clamp(14px,3.5vw,16px)' }}>
                    R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
              <button className="btn-perigo btn-sm" style={{ flexShrink: 0, minHeight: 44, minWidth: 44 }} onClick={() => remover(item.produto_id)}>✕</button>
            </div>
          ))}
        </div>

        {/* ── Resumo ── */}
        <div className="carrinho-resumo">
          <div className="card">
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Resumo do Pedido</h2>

            <div style={st.linha}>
              <span>{itens.reduce((s, i) => s + i.quantidade, 0)} item(s)</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 8 }}>
              <div style={{ ...st.linha, fontWeight: 800, fontSize: 20 }}>
                <span>Subtotal</span>
                <span style={{ color: '#3A5D3E' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#888', marginTop: 8, marginBottom: 20 }}>
              Frete e desconto calculados na próxima etapa
            </p>

            <button
              className="btn-verde"
              style={{ width: '100%', fontSize: 16, minHeight: 50 }}
              onClick={avancar}
            >
              Ir para entrega →
            </button>

            {!cliente && (
              <p className="erro" style={{ textAlign: 'center', marginTop: 8 }}>
                Faça login para continuar.
              </p>
            )}

            <button
              onClick={() => nav('/')}
              style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', minHeight: 44 }}
            >
              ← Continuar comprando
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const st = {
  linha:   { display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 8 },
  qtdCtrl: { display: 'flex', alignItems: 'center', border: '1.5px solid #d0d7c4', borderRadius: 6, overflow: 'hidden' },
  qtdBtn:  { background: '#f5f7f2', border: 'none', width: 36, height: 36, fontSize: 16, cursor: 'pointer', fontWeight: 700, color: '#3A5D3E', minHeight: 36 },
  qtdNum:  { width: 34, textAlign: 'center', fontWeight: 700, fontSize: 14 },
};

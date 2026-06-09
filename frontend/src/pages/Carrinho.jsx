import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Carrinho() {
  const { itens, remover, atualizarQtd, total } = useCart();
  const { cliente } = useAuth();
  const nav = useNavigate();

  if (itens.length === 0) return (
    <div className="container" style={{ padding: 60, textAlign: 'center' }}>
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
    <div className="container" style={{ padding: 'clamp(80px,10vw,100px) clamp(14px,4vw,30px) 30px' }}>
      <h1 style={{ marginBottom: 24 }}>Meu Carrinho</h1>

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>

        {/* ── Itens ── */}
        <div style={{ flex: 2, minWidth: 300 }}>
          {itens.map(item => (
            <div key={item.produto_id} className="card"
              style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <img
                src={item.imagem || 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                onError={e => { e.target.src = 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'; }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, marginBottom: 6 }}>{item.nome}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={st.qtdCtrl}>
                    <button style={st.qtdBtn} onClick={() => atualizarQtd(item.produto_id, item.quantidade - 1)}>−</button>
                    <span style={st.qtdNum}>{item.quantidade}</span>
                    <button style={st.qtdBtn} onClick={() => atualizarQtd(item.produto_id, item.quantidade + 1)}>+</button>
                  </div>
                  <p style={{ color: '#dc3545', fontWeight: 800, fontSize: 16 }}>
                    R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
              <button className="btn-perigo btn-sm" onClick={() => remover(item.produto_id)}>✕</button>
            </div>
          ))}
        </div>

        {/* ── Resumo ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
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
              style={{ width: '100%', fontSize: 16 }}
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
              style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
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
  qtdBtn:  { background: '#f5f7f2', border: 'none', width: 30, height: 30, fontSize: 16, cursor: 'pointer', fontWeight: 700, color: '#3A5D3E' },
  qtdNum:  { width: 34, textAlign: 'center', fontWeight: 700, fontSize: 14 },
};

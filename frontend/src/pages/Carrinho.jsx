import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Carrinho() {
  const { itens, remover, atualizarQtd, limpar, total } = useCart();
  const { cliente } = useAuth();
  const nav = useNavigate();
  const [cupom,    setCupom]    = useState('');
  const [desconto, setDesconto] = useState(null);
  const [pagamento,setPagamento]= useState('pix');
  const [msg,      setMsg]      = useState('');
  const [erro,     setErro]     = useState('');
  const [loading,  setLoading]  = useState(false);

  async function verificarCupom() {
    try {
      const { data } = await api.post('/cupons/verificar', { codigo: cupom });
      setDesconto(data); setMsg(`Cupom aplicado! ${data.desconto}% de desconto.`); setErro('');
    } catch {
      setDesconto(null); setErro('Cupom inválido ou expirado.'); setMsg('');
    }
  }

  const valorDesconto = desconto ? (total * desconto.desconto) / 100 : 0;
  const totalFinal    = total - valorDesconto;

  async function finalizar() {
    if (!cliente) return nav('/login');
    if (itens.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        itens: itens.map(i => ({ produto_id: i.produto_id, quantidade: i.quantidade })),
        forma_pagamento: pagamento,
        cupom_codigo: cupom || undefined,
      };
      const { data } = await api.post('/pedidos', payload);
      limpar();
      nav('/meus-pedidos', { state: { sucesso: `Pedido #${data.pedido_id} realizado! Total: R$ ${Number(data.total_final).toFixed(2).replace('.', ',')}` } });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao finalizar pedido.');
    } finally {
      setLoading(false);
    }
  }

  if (itens.length === 0) return (
    <div className="container" style={{ padding: 60, textAlign: 'center' }}>
      <p style={{ fontSize: 60 }}>🛒</p>
      <h2 style={{ marginTop: 16, marginBottom: 12 }}>Carrinho vazio</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>Adicione produtos para continuar.</p>
      <button className="btn-verde" onClick={() => nav('/')}>Ver Vitrine</button>
    </div>
  );

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1 style={{ marginBottom: 24 }}>Meu Carrinho</h1>

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>

        {/* Itens */}
        <div style={{ flex: 2, minWidth: 300 }}>
          {itens.map(item => (
            <div key={item.produto_id} className="card" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <img src={item.imagem || 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'} style={{ width: 80, height: 80, objectFit: 'cover', background: '#f5f7f2', borderRadius: 8 }}
                onError={e => { e.target.src = 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'; }} />
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

        {/* Resumo */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="card">
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Resumo do Pedido</h2>

            {/* Cupom */}
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Cupom de desconto</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input placeholder="Digite o cupom" value={cupom} onChange={e => setCupom(e.target.value.toUpperCase())} />
              <button className="btn-azul btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={verificarCupom}>Aplicar</button>
            </div>
            {msg  && <p className="sucesso" style={{ marginBottom: 12 }}>{msg}</p>}
            {erro && <p className="erro"    style={{ marginBottom: 12 }}>{erro}</p>}

            {/* Pagamento */}
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Forma de pagamento</p>
            <select value={pagamento} onChange={e => setPagamento(e.target.value)} style={{ marginBottom: 20 }}>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão de Crédito/Débito</option>
              <option value="boleto">Boleto Bancário</option>
            </select>

            {/* Totais */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
              <div style={st.linha}><span>Subtotal</span><span>R$ {total.toFixed(2).replace('.', ',')}</span></div>
              {desconto && (
                <div style={{ ...st.linha, color: '#3A5D3E' }}>
                  <span>Desconto ({desconto.desconto}%)</span>
                  <span>- R$ {valorDesconto.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div style={{ ...st.linha, fontWeight: 800, fontSize: 20, marginTop: 12 }}>
                <span>Total</span>
                <span style={{ color: '#3A5D3E' }}>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button className="btn-verde" style={{ width: '100%', marginTop: 20, fontSize: 16 }}
              onClick={finalizar} disabled={loading}>
              {loading ? 'Processando...' : '✅ Finalizar Compra'}
            </button>
            {!cliente && <p className="erro" style={{ textAlign: 'center', marginTop: 8 }}>Faça login para finalizar.</p>}
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

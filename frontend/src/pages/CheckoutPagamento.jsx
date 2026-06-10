import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PixSimulado from '../components/PixSimulado';
import BoletoSimulado from '../components/BoletoSimulado';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutSimulado from '../components/CheckoutSimulado';
import api from '../services/api';

export default function CheckoutPagamento() {
  const { itens, total, limpar } = useCart();
  const { cliente } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();

  const enderecoFinal  = state?.enderecoFinal  || {};
  const freteSelecionado = state?.frete        || null;

  const [cupom,    setCupom]    = useState('');
  const [desconto, setDesconto] = useState(null);
  const [pagamento, setPagamento] = useState('pix');
  const [msg,      setMsg]      = useState('');
  const [erro,     setErro]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [modalPix,    setModalPix]    = useState(false);
  const [modalBoleto, setModalBoleto] = useState(false);

  // Se chegou sem estado (acesso direto), volta para carrinho
  if (!state?.enderecoFinal) {
    nav('/carrinho');
    return null;
  }

  // Recalcula subtotal direto dos itens (garante valor correto)
  const subtotal      = itens.reduce((acc, i) => acc + (i.preco || i.preco_unit || 0) * i.quantidade, 0);
  const valorDesconto = desconto ? (subtotal * desconto.desconto) / 100 : 0;
  const valorFrete    = freteSelecionado ? freteSelecionado.valor : 0;
  const totalFinal    = subtotal - valorDesconto + valorFrete;

  async function verificarCupom() {
    try {
      const { data } = await api.post('/cupons/verificar', { codigo: cupom });
      setDesconto(data);
      setMsg(`Cupom aplicado! ${data.desconto}% de desconto.`);
      setErro('');
    } catch {
      setDesconto(null);
      setErro('Cupom inválido ou expirado.');
      setMsg('');
    }
  }

  async function finalizar(formaPgto = pagamento) {
    if (!cliente) return nav('/login');
    setLoading(true);
    setErro('');
    try {
      const payload = {
        itens: itens.map(i => ({ produto_id: i.produto_id, quantidade: i.quantidade })),
        forma_pagamento: formaPgto,
        cupom_codigo: cupom || undefined,
        frete: freteSelecionado ? { valor: freteSelecionado.valor, nome: freteSelecionado.nome } : undefined,
        endereco_entrega: enderecoFinal,
      };
      const { data } = await api.post('/pedidos', payload);
      limpar();
      nav('/meus-pedidos', {
        state: {
          sucesso: `Pedido #${data.pedido_id} realizado! Total: R$ ${Number(data.total_final).toFixed(2).replace('.', ',')}`,
        },
      });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao finalizar pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div className="container" style={{ paddingTop: 'clamp(68px,9vw,84px)', paddingBottom: 40, paddingLeft: 'clamp(12px,4vw,20px)', paddingRight: 'clamp(12px,4vw,20px)', maxWidth: 900, margin: '0 auto' }}>

      {/* Stepper */}
      <div style={st.stepper}>
        <div style={st.stepDone}>✓ Carrinho</div>
        <div style={st.stepLine} />
        <div style={st.stepDone}>✓ Entrega</div>
        <div style={st.stepLine} />
        <div style={st.stepActive}>💳 Pagamento</div>
      </div>

      <h1 style={{ marginBottom: 24 }}>Revisão e Pagamento</h1>

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>

        {/* ── Coluna esquerda ── */}
        <div style={{ flex: 2, minWidth: 300 }}>

          {/* Itens do pedido */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>🛒 Itens do pedido</h3>
            {itens.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>Nenhum item no carrinho.</p>}
            {itens.map(item => {
              const preco = item.preco || item.preco_unit || 0;
              return (
                <div key={item.produto_id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f5f5f5' }}>
                  <img
                    src={item.imagem || 'https://via.placeholder.com/50x50/f5f7f2/3A5D3E?text=+'}
                    style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8, background: '#f5f7f2' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/50x50/f5f7f2/3A5D3E?text=+'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{item.nome}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>
                      {item.quantidade} × R$ {Number(preco).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <p style={{ fontWeight: 700, color: '#3A5D3E', fontSize: 14 }}>
                    R$ {(preco * item.quantidade).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Endereço de entrega */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 15 }}>📦 Endereço de entrega</h3>
              <button style={st.btnEditar} onClick={() => nav('/checkout/endereco')}>Alterar</button>
            </div>
            <p style={{ fontSize: 13, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {enderecoFinal.endereco}, Nº {enderecoFinal.numero}{enderecoFinal.complemento ? ` — ${enderecoFinal.complemento}` : ''} · {enderecoFinal.bairro}, {enderecoFinal.cidade}/{enderecoFinal.estado} · CEP {enderecoFinal.cep}
            </p>
            {freteSelecionado && (
              <p style={{ marginTop: 6, fontSize: 12, color: '#3A5D3E', fontWeight: 600 }}>
                {freteSelecionado.icone} {freteSelecionado.nome} — {freteSelecionado.prazo} dias úteis
              </p>
            )}
          </div>

          {/* Forma de pagamento */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>💳 Forma de pagamento</h3>
            {[
              { value: 'pix',    label: 'PIX',                   icon: '💚' },
              { value: 'cartao', label: 'Cartão de Crédito/Débito', icon: '💳' },
              { value: 'boleto', label: 'Boleto Bancário',        icon: '📄' },
            ].map(p => (
              <label key={p.value}
                onClick={() => setPagamento(p.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 12, cursor: 'pointer',
                  padding: '12px 16px', borderRadius: 10,
                  border: pagamento === p.value ? '2px solid #3A5D3E' : '1.5px solid #e0e0e0',
                  background: pagamento === p.value ? '#f0f7f0' : '#fff',
                }}>
                <input type="radio" name="pagamento" value={p.value}
                  checked={pagamento === p.value} onChange={() => setPagamento(p.value)}
                  style={{ accentColor: '#3A5D3E', width: 18, height: 18 }} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {p.icon} {p.label}
                </span>
              </label>
            ))}

            {/* Formulário cartão — só os campos, sem botão */}
            {pagamento === 'cartao' && (
              <div style={{ marginTop: 16 }}>
                <CheckoutSimulado onFinalizar={() => finalizar('cartao')} loading={loading} hideButton={true} />
              </div>
            )}
          </div>
        </div>

        {/* ── Resumo final ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Resumo do Pedido</h2>

            {/* Cupom */}
            <p style={st.label}>Cupom de desconto</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                placeholder="Digite o cupom"
                value={cupom}
                onChange={e => setCupom(e.target.value.toUpperCase())}
              />
              <button className="btn-azul btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={verificarCupom}>
                Aplicar
              </button>
            </div>
            {msg  && <p className="sucesso" style={{ marginBottom: 8 }}>{msg}</p>}
            {erro && <p className="erro"    style={{ marginBottom: 8 }}>{erro}</p>}

            {/* Totais */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 14 }}>
              <div style={st.linha}>
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              {desconto && (
                <div style={{ ...st.linha, color: '#3A5D3E' }}>
                  <span>Desconto ({desconto.desconto}%)</span>
                  <span>- R$ {valorDesconto.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              {freteSelecionado && (
                <div style={st.linha}>
                  <span>Frete ({freteSelecionado.nome})</span>
                  <span>R$ {valorFrete.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div style={{ ...st.linha, fontWeight: 800, fontSize: 20, marginTop: 10 }}>
                <span>Total</span>
                <span style={{ color: '#3A5D3E' }}>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Botão finalizar */}
            <button
              className="btn-verde"
              style={{ width: '100%', marginTop: 20, fontSize: 16 }}
              onClick={() => {
                if (pagamento === 'pix')    { setModalPix(true); return; }
                if (pagamento === 'boleto') { setModalBoleto(true); return; }
                finalizar('cartao');
              }}
              disabled={loading}
            >
              {loading ? 'Processando...' : '✅ Finalizar Compra'}
            </button>

            <button
              style={st.btnVoltar}
              onClick={() => nav('/checkout/endereco')}
            >
              ← Voltar para entrega
            </button>
          </div>
        </div>

      </div>
    </div>
    {/* Modal PIX */}
    {modalPix && (
      <PixSimulado
        total={totalFinal}
        loading={loading}
        onConfirmar={() => { setModalPix(false); finalizar('pix'); }}
        onCancelar={() => setModalPix(false)}
      />
    )}

    {/* Modal Boleto */}
    {modalBoleto && (
      <BoletoSimulado
        total={totalFinal}
        loading={loading}
        onConfirmar={() => { setModalBoleto(false); finalizar('boleto'); }}
        onCancelar={() => setModalBoleto(false)}
      />
    )}
    </>
  );
}

const st = {
  stepper:    { display: 'flex', alignItems: 'center', marginBottom: 28 },
  stepDone:   { fontSize: 13, color: '#3A5D3E', fontWeight: 700 },
  stepActive: { fontSize: 13, color: '#3A5D3E', fontWeight: 700, background: '#e8f5e9', padding: '4px 10px', borderRadius: 20 },
  stepLine:   { flex: 1, height: 1, background: '#ddd', margin: '0 8px' },
  label:      { fontWeight: 600, fontSize: 14, marginBottom: 8 },
  linha:      { display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 8 },
  btnEditar:  { background: 'none', border: '1px solid #3A5D3E', color: '#3A5D3E', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 },
  btnVoltar:  { width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
};

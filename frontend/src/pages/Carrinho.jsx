// frontend/src/pages/Carrinho.jsx
// Mantém o CheckoutSimulado original.
// Ao finalizar: cria o pedido no backend → backend envia e-mail de confirmação.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart }     from '../context/CartContext';
import { useAuth }     from '../context/AuthContext';
import { useViaCep }   from '../hooks/useViaCep';
import { useFrete }    from '../hooks/useFrete';
import api             from '../services/api';
import CheckoutSimulado from '../components/CheckoutSimulado';

export default function Carrinho() {
  const { itens, remover, atualizarQtd, limpar, total } = useCart();
  const { cliente } = useAuth();
  const nav = useNavigate();

  const [cupom,     setCupom]     = useState('');
  const [desconto,  setDesconto]  = useState(null);
  const [pagamento, setPagamento] = useState('cartao');
  const [msg,       setMsg]       = useState('');
  const [erro,      setErro]      = useState('');
  const [loading,   setLoading]   = useState(false);

  const [endereco, setEndereco] = useState({
    cep: '', logradouro: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '',
  });

  const { buscarCep, buscandoCep, erroCep, formatarCep } = useViaCep();
  const { fretes, freteSelecionado, calculando, erroFrete, calcularFrete, selecionarFrete } = useFrete();

  function handleCep(e) {
    const cepFormatado = formatarCep(e.target.value);
    setEndereco(en => ({ ...en, cep: cepFormatado }));
    if (cepFormatado.length === 9) {
      buscarCep(cepFormatado, (end) => {
        setEndereco(en => ({ ...en, ...end }));
        calcularFrete(cepFormatado, itens);
      });
    }
  }

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

  const valorDesconto = desconto         ? (total * desconto.desconto) / 100 : 0;
  const valorFrete    = freteSelecionado ? freteSelecionado.valor             : 0;
  const totalFinal    = total - valorDesconto + valorFrete;

  // ── Chamada ao finalizar (pelo botão direto ou pelo CheckoutSimulado) ──
  async function finalizar(dadosCartao = null) {
    if (!cliente) return nav('/login');
    if (itens.length === 0) return;

    if (!endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.cidade) {
      return setErro('Preencha o endereço de entrega completo.');
    }
    if (!freteSelecionado) {
      return setErro('Selecione uma opção de frete para continuar.');
    }

    setLoading(true);
    setErro('');

    try {
      // Envia pedido ao backend — lá o e-mail é disparado automaticamente
      const { data: pedidoData } = await api.post('/pedidos', {
        itens: itens.map(i => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          nome:       i.nome,
          preco:      i.preco,
        })),
        forma_pagamento: pagamento,
        cupom_codigo:    cupom || undefined,
        endereco,
        frete: {
          servico: freteSelecionado.nome,
          valor:   freteSelecionado.valor,
          prazo:   freteSelecionado.prazo,
        },
        dados_pagamento: dadosCartao, // dados do CheckoutSimulado (não são enviados ao MP)
      });

      // Pequena pausa para dar sensação de processamento
      await new Promise(r => setTimeout(r, 1500));

      limpar();
      nav('/meus-pedidos', {
        state: {
          sucesso: `Pedido #${pedidoData.pedido_id} realizado com sucesso! Um e-mail de confirmação foi enviado para ${cliente.email}.`,
        },
      });

    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ── Carrinho vazio ──────────────────────────────────────
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

        {/* ── Coluna esquerda: Itens + Endereço + Frete ── */}
        <div style={{ flex: 2, minWidth: 300 }}>

          {/* Itens */}
          {itens.map(item => (
            <div key={item.produto_id} className="card" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <img
                src={item.imagem || 'https://via.placeholder.com/80x80/f5f7f2/3A5D3E?text=+'}
                style={{ width: 80, height: 80, objectFit: 'cover', background: '#f5f7f2', borderRadius: 8 }}
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

          {/* Endereço */}
          <div className="card">
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>📍 Endereço de Entrega</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={st.label}>CEP *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={endereco.cep} onChange={handleCep}
                  placeholder="00000-000" maxLength={9} style={{ flex: 1 }}
                />
                <button
                  type="button" className="btn-azul btn-sm" style={{ whiteSpace: 'nowrap' }}
                  onClick={() => buscarCep(endereco.cep, (end) => {
                    setEndereco(en => ({ ...en, ...end }));
                    calcularFrete(endereco.cep, itens);
                  })}
                  disabled={buscandoCep}
                >
                  {buscandoCep ? '⏳' : '🔍 Buscar'}
                </button>
              </div>
              {buscandoCep && <p style={st.info}>🌿 Buscando endereço...</p>}
              {erroCep      && <p style={{ ...st.info, color: '#dc3545' }}>{erroCep}</p>}
              {endereco.cidade && !buscandoCep && (
                <p style={{ ...st.info, color: '#3A5D3E' }}>
                  ✅ {endereco.logradouro}, {endereco.bairro} — {endereco.cidade}/{endereco.estado}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={st.label}>Rua / Logradouro *</label>
                <input value={endereco.logradouro} onChange={e => setEndereco({ ...endereco, logradouro: e.target.value })} placeholder="Preenchido pelo CEP" />
              </div>
              <div>
                <label style={st.label}>Número *</label>
                <input value={endereco.numero} onChange={e => setEndereco({ ...endereco, numero: e.target.value })} placeholder="123" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={st.label}>Complemento</label>
                <input value={endereco.complemento} onChange={e => setEndereco({ ...endereco, complemento: e.target.value })} placeholder="Apto, bloco..." />
              </div>
              <div>
                <label style={st.label}>Bairro *</label>
                <input value={endereco.bairro} onChange={e => setEndereco({ ...endereco, bairro: e.target.value })} placeholder="Preenchido pelo CEP" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={st.label}>Cidade *</label>
                <input value={endereco.cidade} onChange={e => setEndereco({ ...endereco, cidade: e.target.value })} placeholder="Preenchido pelo CEP" />
              </div>
              <div>
                <label style={st.label}>Estado *</label>
                <input value={endereco.estado} maxLength={2} onChange={e => setEndereco({ ...endereco, estado: e.target.value.toUpperCase() })} placeholder="SP" />
              </div>
            </div>
          </div>

          {/* Frete */}
          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>🚚 Opções de Frete</h2>
            {!endereco.cep && (
              <p style={{ color: '#888', fontSize: 14 }}>Digite o CEP acima para calcular o frete.</p>
            )}
            {calculando && (
              <div style={st.freteCalculando}>
                <span style={{ fontSize: 24 }}>⏳</span>
                <p>Calculando frete...</p>
              </div>
            )}
            {erroFrete && <p style={{ color: '#dc3545', fontSize: 14 }}>{erroFrete}</p>}
            {fretes.length > 0 && !calculando && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fretes.map(f => (
                  <div
                    key={f.codigo}
                    style={{
                      ...st.freteOpcao,
                      border:     freteSelecionado?.codigo === f.codigo ? '2px solid #3A5D3E' : '2px solid #e0e7db',
                      background: freteSelecionado?.codigo === f.codigo ? '#f0f7f1' : '#fff',
                    }}
                    onClick={() => selecionarFrete(f)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border:     `2px solid ${freteSelecionado?.codigo === f.codigo ? '#3A5D3E' : '#ccc'}`,
                        background: freteSelecionado?.codigo === f.codigo ? '#3A5D3E' : '#fff',
                      }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{f.icone} {f.nome}</p>
                        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                          Prazo: {f.prazo} {f.prazo === 1 ? 'dia útil' : 'dias úteis'}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 17, color: '#3A5D3E' }}>
                      R$ {f.valor.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Coluna direita: Resumo ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="card">
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Resumo do Pedido</h2>

            {/* Cupom */}
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Cupom de desconto</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                placeholder="Digite o cupom"
                value={cupom}
                onChange={e => setCupom(e.target.value.toUpperCase())}
              />
              <button className="btn-azul btn-sm" onClick={verificarCupom}>Aplicar</button>
            </div>
            {msg && <p className="sucesso" style={{ marginBottom: 12 }}>{msg}</p>}

            {/* Forma de pagamento */}
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Forma de pagamento</p>
            <select value={pagamento} onChange={e => setPagamento(e.target.value)} style={{ marginBottom: 20 }}>
              <option value="cartao">💳 Cartão de Crédito (Simulado)</option>
              <option value="pix">PIX Direto</option>
              <option value="boleto">Boleto Bancário</option>
            </select>

            {/* Totais */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
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
              <div style={st.linha}>
                <span>Frete</span>
                <span>{freteSelecionado ? `R$ ${valorFrete.toFixed(2).replace('.', ',')}` : 'Selecione'}</span>
              </div>
              <div style={{ ...st.linha, fontWeight: 800, fontSize: 20, marginTop: 12 }}>
                <span>Total</span>
                <span style={{ color: '#3A5D3E' }}>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {erro && <p className="erro" style={{ marginTop: 12 }}>{erro}</p>}

            {/* PIX / Boleto: botão direto */}
            {pagamento !== 'cartao' && (
              <button
                className="btn-verde"
                style={{ width: '100%', marginTop: 20, fontSize: 16 }}
                onClick={() => finalizar()}
                disabled={loading}
              >
                {loading ? '⌛ Processando...' : '✅ Finalizar Compra'}
              </button>
            )}

            {/* Cartão: CheckoutSimulado */}
            {pagamento === 'cartao' && (
              <CheckoutSimulado onFinalizar={finalizar} loading={loading} />
            )}

            {!cliente && (
              <p className="erro" style={{ textAlign: 'center', marginTop: 8 }}>
                Faça login para finalizar.
              </p>
            )}

            <div style={st.selos}>
              <span>🔒 Compra segura</span>
              <span>📦 Envio pelos Correios</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const st = {
  label:   { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' },
  linha:   { display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 8 },
  qtdCtrl: { display: 'flex', alignItems: 'center', border: '1.5px solid #d0d7c4', borderRadius: 6, overflow: 'hidden' },
  qtdBtn:  { background: '#f5f7f2', border: 'none', width: 30, height: 30, fontSize: 16, cursor: 'pointer', fontWeight: 700, color: '#3A5D3E' },
  qtdNum:  { width: 34, textAlign: 'center', fontWeight: 700, fontSize: 14 },
  info:    { fontSize: 12, marginTop: 6, fontStyle: 'italic', color: '#888' },
  freteCalculando: { display: 'flex', alignItems: 'center', gap: 12, color: '#3A5D3E', padding: '14px 0', fontSize: 14 },
  freteOpcao:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' },
  selos:           { display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 12, color: '#888', flexWrap: 'wrap' },
};

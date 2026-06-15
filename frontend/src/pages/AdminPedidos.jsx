import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusCor    = {
  pendente: 'badge-amarelo', pago: 'badge-azul', enviado: 'badge-azul',
  entregue: 'badge-verde',   cancelado: 'badge-vermelho', finalizado: 'badge-azul',
};

function etapaRastreio(status) {
  if (status === 'entregue' || status === 'finalizado') return 3;
  if (status === 'enviado') return 2;
  if (status === 'pago')    return 1;
  return 0;
}

function badgeStatus(status) {
  let exibir = status;
  if (status === 'finalizado') exibir = 'pago';
  if (status === 'pago')       exibir = 'preparação';
  return <span className={`badge ${statusCor[status] || 'badge-cinza'}`}>{exibir}</span>;
}

const etapas = [
  { label: 'Preparação', icon: '📦' },
  { label: 'Transporte', icon: '🚚' },
  { label: 'Entregue',   icon: '✅' },
];

// ── Helpers para os dois controles separados: Pagamento e Rastreio ──
// Mesma coluna `status` no banco, mas exibidos de forma independente
// para deixar claro para o usuário do admin o que cada ação representa.
function statusPagamento(status) {
  if (status === 'pendente')  return 'pendente';
  if (status === 'cancelado') return 'cancelado';
  return 'pago'; // pago, enviado, entregue, finalizado -> pagamento já confirmado
}

const labelPagamento = {
  pendente: 'Pendente (Processamento)',
  pago: 'Pago',
  cancelado: 'Cancelado',
};
const corPagamento = { pendente: 'badge-amarelo', pago: 'badge-azul', cancelado: 'badge-vermelho' };

function badgePagamento(status) {
  const pg = statusPagamento(status);
  return <span className={`badge ${corPagamento[pg]}`}>{labelPagamento[pg]}</span>;
}

function opcoesPagamento(status) {
  const pg = statusPagamento(status);
  if (pg === 'pendente') return ['pendente', 'pago', 'cancelado'];
  if (pg === 'pago')     return ['pago', 'cancelado'];
  return ['cancelado']; // já cancelado: terminal, sem outras opções
}

const labelRastreio   = { pago: 'Em Preparação', enviado: 'Em Transporte', entregue: 'Entregue', finalizado: 'Finalizado' };
const opcoesRastreio  = ['pago', 'enviado', 'entregue', 'finalizado'];

function RastreioIcons({ status }) {
  const etapaAt = etapaRastreio(status);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
      {etapas.map((e, i) => {
        const etapaNum = i + 1;
        const ativo = etapaAt >= etapaNum;
        const atual = etapaAt === etapaNum;
        return (
          <div key={e.label} title={e.label}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: ativo ? '#3A5D3E' : '#e8ede5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              boxShadow: atual ? '0 0 0 2px #7ab87e' : 'none',
            }}>{e.icon}</div>
            <span style={{ fontSize: 9, color: ativo ? '#3A5D3E' : '#aaa', fontWeight: ativo ? 700 : 400 }}>
              {e.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RastreioDetalhe({ status }) {
  const etapaAt = etapaRastreio(status);
  return (
    <div style={{ background: '#f8faf5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#3A5D3E', marginBottom: 10 }}>📍 Rastreio do Pedido</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {etapas.map((e, i) => {
          const etapaNum = i + 1;
          const ativo = etapaAt >= etapaNum;
          const atual = etapaAt === etapaNum;
          return (
            <div key={e.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: ativo ? '#3A5D3E' : '#dde5d8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  boxShadow: atual ? '0 0 0 3px #7ab87e' : 'none',
                }}>{e.icon}</div>
                <span style={{ fontSize: 10, fontWeight: ativo ? 700 : 400, color: ativo ? '#3A5D3E' : '#aaa' }}>
                  {e.label}
                </span>
              </div>
              {i < etapas.length - 1 && (
                <div style={{
                  flex: 1, height: 3, margin: '0 4px', marginBottom: 14,
                  background: etapaAt > etapaNum ? '#3A5D3E' : '#dde5d8', borderRadius: 2,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Endereço usando nomes reais do banco ──
function EnderecoEntrega({ p }) {
  const tem = p.endereco_entrega || p.cep_entrega;
  if (!tem) return (
    <div style={{ background: '#fff8e1', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
      <p style={{ fontSize: 12, color: '#e67e22' }}>⚠️ Endereço de entrega não registrado neste pedido</p>
    </div>
  );
  return (
    <div style={{ background: '#f0f7f0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid #c8e6c9' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#3A5D3E', marginBottom: 8 }}>🏠 Endereço de Entrega</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
        {p.endereco_entrega}{p.numero_entrega ? `, Nº ${p.numero_entrega}` : ''}
        {p.complemento_entrega ? ` — ${p.complemento_entrega}` : ''}
      </p>
      <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
        {p.bairro_entrega}{p.cidade_entrega ? ` — ${p.cidade_entrega}` : ''}{p.estado_entrega ? `/${p.estado_entrega}` : ''}
      </p>
      {p.cep_entrega && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>CEP: {p.cep_entrega}</p>}
      {p.frete_servico && (
        <p style={{ fontSize: 12, color: '#3A5D3E', marginTop: 6, fontWeight: 600 }}>
          🚚 {p.frete_servico}
          {p.frete_prazo ? ` — ${p.frete_prazo} dias úteis` : ''}
          {p.frete_valor > 0 ? ` — R$ ${Number(p.frete_valor).toFixed(2).replace('.', ',')}` : ''}
        </p>
      )}
    </div>
  );
}

export default function AdminPedidos() {
  const { admin }  = useAuth();
  const [pedidos,  setPedidos] = useState([]);
  const [detalhe,  setDetalhe] = useState(null);

  useEffect(() => {
    api.get('/pedidos').then(r => setPedidos(r.data));
  }, []);

  async function verDetalhe(id) {
    const { data } = await api.get(`/pedidos/${id}`);
    setDetalhe(data);
  }

  async function mudarStatus(id, status) {
    try {
      await api.put(`/pedidos/${id}/status`, { status });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      if (detalhe?.id === id) setDetalhe({ ...detalhe, status });
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao atualizar status');
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Pedidos</h1>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div className="card table-scroll" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8faf5' }}>
                  <th style={th}>#</th>
                  <th style={th}>Cliente</th>
                  <th style={th}>Total</th>
                  <th style={th}>Pagamento</th>
                  <th style={th}>Rastreio</th>
                  <th style={th}>Posição</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => {
                  const pg = statusPagamento(p.status);
                  const cancelado = p.status === 'cancelado';
                  const pagamentoTravado = cancelado;
                  const rastreioHabilitado = pg === 'pago';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={td}><strong>#{p.id}</strong></td>
                      <td style={td}>
                        <p style={{ fontWeight: 700 }}>{p.cliente_nome}</p>
                        <p style={{ fontSize: 12, color: '#888' }}>
                          {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td style={td}>
                        <strong style={{ color: '#3A5D3E' }}>
                          R$ {Number(p.total_final).toFixed(2).replace('.', ',')}
                        </strong>
                      </td>

                      {/* Coluna Pagamento — dropdown editável (no lugar do antigo badge de Status) */}
                      <td style={td}>
                        {admin.nivel !== 'vendedor' ? (
                          <select
                            value={pg}
                            onChange={e => mudarStatus(p.id, e.target.value)}
                            disabled={pagamentoTravado}
                            title={cancelado ? 'Pedido cancelado — não pode ser alterado' : ''}
                            style={{
                              ...selStyle,
                              opacity: pagamentoTravado ? 0.5 : 1,
                              cursor: pagamentoTravado ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {opcoesPagamento(p.status).map(s => (
                              <option key={s} value={s}>{labelPagamento[s]}</option>
                            ))}
                          </select>
                        ) : (
                          badgePagamento(p.status)
                        )}
                      </td>

                      {/* Coluna Rastreio — ícones, apenas visual */}
                      <td style={td}><RastreioIcons status={p.status} /></td>

                      {/* Coluna Posição — visualizar + dropdown de Rastreio */}
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button className="btn-azul btn-sm" onClick={() => verDetalhe(p.id)}>👁️</button>
                          {rastreioHabilitado ? (
                            <select
                              value={p.status}
                              onChange={e => mudarStatus(p.id, e.target.value)}
                              style={selStyle}
                            >
                              {(admin.nivel === 'vendedor'
                                ? [...new Set([p.status, 'finalizado'])]
                                : opcoesRastreio
                              ).map(s => (
                                <option key={s} value={s}>{labelRastreio[s] ?? s}</option>
                              ))}
                            </select>
                          ) : (
                            <select disabled style={{ ...selStyle, opacity: 0.5, cursor: 'not-allowed' }}>
                              <option>{cancelado ? 'Cancelado' : 'Aguardando pagamento'}</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pedidos.length === 0 && (
              <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Nenhum pedido encontrado.</p>
            )}
          </div>
        </div>

        {detalhe && (
          <div style={{ width: 360, flexShrink: 0 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 20 }}>Pedido #{detalhe.id}</h2>
                <button onClick={() => setDetalhe(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>

              <p style={{ marginBottom: 4 }}><strong>Cliente:</strong> {detalhe.cliente_nome}</p>
              <p style={{ marginBottom: 4 }}><strong>E-mail:</strong> {detalhe.cliente_email}</p>
              <p style={{ marginBottom: 4 }}><strong>Pagamento:</strong> {detalhe.forma_pagamento?.toUpperCase()}</p>
              <p style={{ marginBottom: 4 }}><strong>Status:</strong> {badgeStatus(detalhe.status)}</p>
              <p style={{ marginBottom: 12 }}>
                <strong>Data:</strong> {new Date(detalhe.criado_em).toLocaleDateString('pt-BR')}
              </p>

              <RastreioDetalhe status={detalhe.status} />
              <EnderecoEntrega p={detalhe} />

              <hr style={{ margin: '8px 0 16px', border: 'none', borderTop: '1px solid #eee' }} />
              <p style={{ fontWeight: 700, marginBottom: 10 }}>Itens:</p>
              {detalhe.itens?.map(i => (
                <div key={i.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <img
                    src={i.imagem || 'https://via.placeholder.com/44x44/f5f7f2/3A5D3E?text=+'}
                    style={{ width: 44, height: 44, objectFit: 'cover', background: '#f5f7f2', borderRadius: 6 }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/44x44/f5f7f2/3A5D3E?text=+'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{i.produto_nome}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>Qtd: {i.quantidade} × R$ {Number(i.preco_unit).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>
                    R$ {(i.preco_unit * i.quantidade).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ))}

              <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eee' }} />
              {detalhe.desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6, color: '#3A5D3E' }}>
                  <span>Desconto</span>
                  <span>- R$ {Number(detalhe.desconto).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              {detalhe.frete_valor > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6, color: '#555' }}>
                  <span>Frete ({detalhe.frete_servico || '—'})</span>
                  <span>R$ {Number(detalhe.frete_valor).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
                <span>Total</span>
                <span style={{ color: '#3A5D3E' }}>R$ {Number(detalhe.total_final).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const th = { padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 600 };
const td = { padding: '12px 14px', fontSize: 14 };
const selStyle = { padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1.5px solid #d0d7c4', minWidth: 110 };

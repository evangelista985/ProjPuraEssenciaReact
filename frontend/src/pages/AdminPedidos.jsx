import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusOpcoes = ['pendente','pago','enviado','entregue','cancelado','finalizado'];
const statusCor    = {
  pendente: 'badge-amarelo', pago: 'badge-azul', enviado: 'badge-azul',
  entregue: 'badge-verde',  cancelado: 'badge-vermelho', finalizado: 'badge-roxo',
};

export default function AdminPedidos() {
  const { admin }   = useAuth();
  const [pedidos,   setPedidos]  = useState([]);
  const [detalhe,   setDetalhe]  = useState(null);

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

  const statusDisponiveis = admin.nivel === 'vendedor' ? ['finalizado'] : statusOpcoes;

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Pedidos</h1>

      <div style={{ display: 'flex', gap: 24 }}>

        {/* Lista */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8faf5' }}>
                  <th style={th}>#</th>
                  <th style={th}>Cliente</th>
                  <th style={th}>Total</th>
                  <th style={th}>Status</th>
                  <th style={th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={td}><strong>#{p.id}</strong></td>
                    <td style={td}>
                      <p style={{ fontWeight: 700 }}>{p.cliente_nome}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td style={td}>
                      <strong style={{ color: '#3A5D3E' }}>R$ {Number(p.total_final).toFixed(2).replace('.', ',')}</strong>
                    </td>
                    <td style={td}><span className={`badge ${statusCor[p.status] || 'badge-cinza'}`}>{p.status}</span></td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="btn-azul btn-sm" onClick={() => verDetalhe(p.id)}>👁️</button>
                        <select
                          value={p.status}
                          onChange={e => mudarStatus(p.id, e.target.value)}
                          style={{ padding: '6px 10px', fontSize: 13, borderRadius: 6, border: '1.5px solid #d0d7c4', width: 'auto' }}
                        >
                          {statusDisponiveis.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pedidos.length === 0 && (
              <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Nenhum pedido encontrado.</p>
            )}
          </div>
        </div>

        {/* Painel de detalhe */}
        {detalhe && (
          <div style={{ width: 340, flexShrink: 0 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 20 }}>Pedido #{detalhe.id}</h2>
                <button onClick={() => setDetalhe(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
              <p style={{ marginBottom: 4 }}><strong>Cliente:</strong> {detalhe.cliente_nome}</p>
              <p style={{ marginBottom: 4 }}><strong>E-mail:</strong> {detalhe.cliente_email}</p>
              <p style={{ marginBottom: 4 }}><strong>Pagamento:</strong> {detalhe.forma_pagamento.toUpperCase()}</p>
              <p style={{ marginBottom: 4 }}>
                <strong>Status:</strong>{' '}
                <span className={`badge ${statusCor[detalhe.status] || 'badge-cinza'}`}>{detalhe.status}</span>
              </p>
              <p style={{ marginBottom: 4 }}><strong>Data:</strong> {new Date(detalhe.criado_em).toLocaleDateString('pt-BR')}</p>

              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />
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
                    <p style={{ fontSize: 12, color: '#888' }}>Qtd: {i.quantidade}</p>
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

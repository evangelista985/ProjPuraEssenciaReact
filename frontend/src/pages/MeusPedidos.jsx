import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusCor = {
  pendente: 'badge-amarelo', pago: 'badge-azul', enviado: 'badge-azul',
  entregue: 'badge-verde',   cancelado: 'badge-vermelho', finalizado: 'badge-verde',
};

const etapas = [
  { label: 'Preparação', icon: '📦' },
  { label: 'Transporte', icon: '🚚' },
  { label: 'Entregue',   icon: '✅' },
];

function etapaRastreio(status) {
  if (status === 'entregue' || status === 'finalizado') return 3;
  if (status === 'enviado') return 2;
  if (status === 'pago')    return 1;
  return 0;
}

function RastreioCliente({ status }) {
  const etapaAt = etapaRastreio(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
      {etapas.map((e, i) => {
        const etapaNum = i + 1;
        const ativo = etapaAt >= etapaNum;
        const atual = etapaAt === etapaNum;
        return (
          <div key={e.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: ativo ? '#3A5D3E' : '#dde5d8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
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
  );
}

export default function MeusPedidos() {
  const [pedidos,   setPedidos]   = useState([]);
  const [expandido, setExpandido] = useState(null);
  const { state } = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    api.get('/pedidos/meus').then(r => setPedidos(r.data));
  }, []);

  function toggleExpandir(id) {
    setExpandido(expandido === id ? null : id);
  }

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1 style={{ marginBottom: 24 }}>Meus Pedidos</h1>

      {state?.sucesso && (
        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 8, padding: '14px 20px', marginBottom: 20, color: '#155724', fontWeight: 600 }}>
          ✅ {state.sucesso}
        </div>
      )}

      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48 }}>📦</p>
          <p style={{ color: '#888', marginTop: 16, marginBottom: 24 }}>Você ainda não fez nenhum pedido.</p>
          <button className="btn-verde" onClick={() => nav('/')}>Ver Vitrine</button>
        </div>
      ) : (
        pedidos.map(p => (
          <div key={p.id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>Pedido #{p.id}</p>
                <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                  {new Date(p.criado_em).toLocaleDateString('pt-BR')} • {p.forma_pagamento?.toUpperCase()}
                </p>
                <p style={{ fontSize: 13, marginTop: 6, color: '#555' }}>{p.itens_desc}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${statusCor[p.status] || 'badge-cinza'}`} style={{ marginBottom: 8, display: 'block' }}>
                  {p.status.toUpperCase()}
                </span>
                <p style={{ fontWeight: 800, fontSize: 18, color: '#3A5D3E' }}>
                  R$ {Number(p.total_final).toFixed(2).replace('.', ',')}
                </p>
                <button
                  onClick={() => toggleExpandir(p.id)}
                  style={{ marginTop: 8, background: 'none', border: '1px solid #3A5D3E', color: '#3A5D3E', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}
                >
                  {expandido === p.id ? '▲ Ocultar' : '📍 Ver situação'}
                </button>
              </div>
            </div>

            {expandido === p.id && (
              <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
                <RastreioCliente status={p.status} />

                {/* Endereço — usando nomes reais do banco */}
                {(p.endereco_entrega || p.cep_entrega) ? (
                  <div style={{ background: '#f0f7f0', borderRadius: 10, padding: '12px 16px', marginTop: 8, border: '1px solid #c8e6c9' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#3A5D3E', marginBottom: 6 }}>🏠 Endereço de entrega</p>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>
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
                ) : null}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

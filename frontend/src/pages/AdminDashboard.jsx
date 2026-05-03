import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [dados,   setDados]   = useState(null);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    api.get(`/admin/dashboard?periodo=${periodo}`).then(r => setDados(r.data));
  }, [periodo]);

  if (!dados) return <p style={{ color: '#3A5D3E' }}>🌿 Carregando...</p>;

  const { totais, porStatus, topProdutos, vendasDia } = dados;
  const maxReceita = Math.max(...vendasDia.map(v => Number(v.receita)), 1);

  const statusCor = {
    pendente: '#D4AF37', pago: '#2c6fa8', enviado: '#17a2b8',
    entregue: '#3A5D3E', cancelado: '#dc3545', finalizado: '#6f42c1',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 32 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['dia','semana','mes','ano'].map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: periodo === p ? '#3A5D3E' : '#fff',
                color:      periodo === p ? '#fff'    : '#333',
                border: `1.5px solid #3A5D3E`, cursor: 'pointer' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards KPI */}
      <div style={s.grid3}>
        <Card titulo="Total de Pedidos" valor={totais.total_pedidos}                                                    icone="📦" cor="#3A5D3E" />
        <Card titulo="Receita Total"    valor={`R$ ${Number(totais.receita_total).toFixed(2).replace('.', ',')}`}      icone="💰" cor="#D4AF37" />
        <Card titulo="Ticket Médio"     valor={`R$ ${Number(totais.ticket_medio).toFixed(2).replace('.', ',')}`}       icone="📈" cor="#2c6fa8" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>

        {/* Gráfico de Vendas */}
        <div className="card">
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Vendas (últimos 7 dias)</h2>
          {vendasDia.length === 0 ? <p style={{ color: '#888' }}>Sem dados.</p> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
              {vendasDia.map((v, i) => {
                const h = Math.max((Number(v.receita) / maxReceita) * 140, 4);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#888' }}>R${Number(v.receita).toFixed(0)}</span>
                    <div style={{ width: '100%', height: h, background: '#3A5D3E', borderRadius: '4px 4px 0 0' }} title={`${v.pedidos} pedidos`} />
                    <span style={{ fontSize: 10, color: '#888' }}>
                      {new Date(v.dia + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status dos Pedidos */}
        <div className="card">
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Pedidos por Status</h2>
          {porStatus.length === 0 ? <p style={{ color: '#888' }}>Sem dados.</p> : (
            porStatus.map(s => (
              <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14 }}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 100, height: 8, background: '#eee', borderRadius: 4 }}>
                    <div style={{ width: `${Math.min((s.qtd / totais.total_pedidos) * 100, 100)}%`, height: '100%', background: statusCor[s.status] || '#888', borderRadius: 4 }} />
                  </div>
                  <strong style={{ width: 24, textAlign: 'right' }}>{s.qtd}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Produtos */}
      <div className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Top 5 Produtos Mais Vendidos</h2>
        {topProdutos.length === 0 ? <p style={{ color: '#888' }}>Sem dados.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={th}>#</th>
                <th style={th}>Produto</th>
                <th style={th}>Qtd Vendida</th>
                <th style={th}>Receita</th>
              </tr>
            </thead>
            <tbody>
              {topProdutos.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={td}><strong style={{ color: '#3A5D3E' }}>{i + 1}º</strong></td>
                  <td style={td}>{p.nome}</td>
                  <td style={td}>{p.total_vendido} un.</td>
                  <td style={td}><strong style={{ color: '#D4AF37' }}>R$ {Number(p.receita).toFixed(2).replace('.', ',')}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Card({ titulo, valor, icone, cor }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${cor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{titulo}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: cor }}>{valor}</p>
        </div>
        <span style={{ fontSize: 36 }}>{icone}</span>
      </div>
    </div>
  );
}

const s  = { grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 } };
const th = { padding: '10px 12px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 600 };
const td = { padding: '10px 12px', fontSize: 14 };

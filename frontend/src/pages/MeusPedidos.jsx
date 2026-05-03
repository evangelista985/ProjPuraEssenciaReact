import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusCor = {
  pendente: 'badge-amarelo', pago: 'badge-azul', enviado: 'badge-azul',
  entregue: 'badge-verde',  cancelado: 'badge-vermelho', finalizado: 'badge-verde',
};

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const { state } = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    api.get('/pedidos/meus').then(r => setPedidos(r.data));
  }, []);

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
                  {new Date(p.criado_em).toLocaleDateString('pt-BR')} • {p.forma_pagamento.toUpperCase()}
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
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// =============================================
// USUÁRIOS ADMIN
// =============================================
export function AdminUsuarios() {
  const { admin } = useAuth();
  const [usuarios,    setUsuarios]    = useState([]);
  const [form,        setForm]        = useState({ nome: '', email: '', senha: '', nivel: 'vendedor' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [msg,         setMsg]         = useState('');

  const niveisPermitidos = admin.nivel === 'admin' ? ['admin','gerente','vendedor'] : ['vendedor'];

  async function carregar() {
    const { data } = await api.get('/admin/usuarios');
    setUsuarios(data);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar() {
    try {
      await api.post('/admin/usuarios', form);
      setMsg('Usuário criado com sucesso!');
      setMostrarForm(false);
      setForm({ nome: '', email: '', senha: '', nivel: 'vendedor' });
      carregar();
    } catch (err) {
      setMsg(err.response?.data?.erro || 'Erro ao criar usuário');
    }
  }

  async function excluir(id) {
    if (id === admin.id) return alert('Você não pode excluir a si mesmo.');
    if (!confirm('Deseja excluir este usuário?')) return;
    await api.delete(`/admin/usuarios/${id}`);
    carregar();
  }

  const badgeCor = { admin: 'badge-vermelho', gerente: 'badge-azul', vendedor: 'badge-verde' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>Usuários Admin</h1>
        <button className="btn-verde" onClick={() => setMostrarForm(true)}>+ Novo Usuário</button>
      </div>

      {msg && <p className="sucesso" style={{ marginBottom: 16 }}>{msg}</p>}

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Novo Usuário</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Campo label="Nome"><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></Campo>
            <Campo label="E-mail"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Campo>
            <Campo label="Senha"><input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} /></Campo>
            <Campo label="Nível de Acesso">
              <select value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })}>
                {niveisPermitidos.map(n => (
                  <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                ))}
              </select>
            </Campo>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn-verde" onClick={salvar}>💾 Salvar</button>
            <button onClick={() => setMostrarForm(false)}
              style={{ background: '#eee', color: '#333', padding: '12px 20px', borderRadius: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card table-scroll" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8faf5' }}>
              <th style={th}>Nome</th>
              <th style={th}>E-mail</th>
              <th style={th}>Nível</th>
              <th style={th}>Cadastro</th>
              {admin.nivel === 'admin' && <th style={th}>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={td}><strong>{u.nome}</strong></td>
                <td style={td}>{u.email}</td>
                <td style={td}><span className={`badge ${badgeCor[u.nivel] || 'badge-cinza'}`}>{u.nivel}</span></td>
                <td style={td}>{new Date(u.criado_em).toLocaleDateString('pt-BR')}</td>
                {admin.nivel === 'admin' && (
                  <td style={td}>
                    {u.id !== admin.id && (
                      <button className="btn-perigo btn-sm" onClick={() => excluir(u.id)}>🗑️</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================
// CUPONS
// =============================================
export function AdminCupons() {
  const [cupons,      setCupons]      = useState([]);
  const [form,        setForm]        = useState({ codigo: '', desconto_percent: '', validade: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [msg,         setMsg]         = useState('');

  async function carregar() {
    const { data } = await api.get('/admin/cupons');
    setCupons(data);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar() {
    try {
      await api.post('/admin/cupons', form);
      setMsg('Cupom criado com sucesso!');
      setMostrarForm(false);
      setForm({ codigo: '', desconto_percent: '', validade: '' });
      carregar();
    } catch (err) {
      setMsg(err.response?.data?.erro || 'Erro ao criar cupom');
    }
  }

  async function toggleAtivo(id, ativo) {
    await api.put(`/admin/cupons/${id}`, { ativo: ativo ? 0 : 1 });
    carregar();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>Cupons de Desconto</h1>
        <button className="btn-verde" onClick={() => setMostrarForm(true)}>+ Novo Cupom</button>
      </div>

      {msg && <p className="sucesso" style={{ marginBottom: 16 }}>{msg}</p>}

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Novo Cupom</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Campo label="Código">
              <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="EX: ORGANICO10" />
            </Campo>
            <Campo label="Desconto (%)">
              <input type="number" min="1" max="100" value={form.desconto_percent} onChange={e => setForm({ ...form, desconto_percent: e.target.value })} placeholder="10" />
            </Campo>
            <Campo label="Validade (opcional)">
              <input type="date" value={form.validade} onChange={e => setForm({ ...form, validade: e.target.value })} />
            </Campo>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn-verde" onClick={salvar}>💾 Salvar</button>
            <button onClick={() => setMostrarForm(false)}
              style={{ background: '#eee', color: '#333', padding: '12px 20px', borderRadius: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card table-scroll" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8faf5' }}>
              <th style={th}>Código</th>
              <th style={th}>Desconto</th>
              <th style={th}>Validade</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cupons.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={td}><strong style={{ letterSpacing: 1 }}>{c.codigo}</strong></td>
                <td style={td}><strong style={{ color: '#3A5D3E' }}>{c.desconto_percent}%</strong></td>
                <td style={td}>
                  {c.validade
                    ? new Date(c.validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                      : 'Sem vencimento'}
                </td>
                <td style={td}>
                  <span className={`badge ${c.ativo ? 'badge-verde' : 'badge-cinza'}`}>
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={td}>
                  <button
                    onClick={() => toggleAtivo(c.id, c.ativo)}
                    style={{
                      background: c.ativo ? '#dc3545' : '#3A5D3E',
                      color: '#fff', padding: '6px 14px', borderRadius: 6,
                      fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 700,
                    }}
                  >
                    {c.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cupons.length === 0 && (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Nenhum cupom cadastrado.</p>
        )}
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' }}>{label}</label>
      {children}
    </div>
  );
}

const th = { padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 600 };
const td = { padding: '12px 14px', fontSize: 14 };

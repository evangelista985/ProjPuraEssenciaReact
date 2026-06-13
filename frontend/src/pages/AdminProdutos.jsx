import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const vazio = { nome: '', descricao: '', preco: '', imagem: '', categoria_id: '', quantidade: 0 };

const CATEGORIA_ICONE = {
  'Chás': '🍵',
  'Temperos': '🌶️',
  'Orgânicos': '🌱',
  'Cosméticos': '✨',
};

const CATEGORIA_COR = {
  'Chás': '#2c6fa8',
  'Temperos': '#D4AF37',
  'Orgânicos': '#3A5D3E',
  'Cosméticos': '#8B4789',
};

export default function AdminProdutos() {
  const { admin }         = useAuth();
  const [produtos,        setProdutos]        = useState([]);
  const [categorias,      setCategorias]      = useState([]);
  const [form,            setForm]            = useState(vazio);
  const [editId,          setEditId]          = useState(null);
  const [mostrarForm,     setMostrarForm]     = useState(false);
  const [msg,             setMsg]             = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busca,           setBusca]           = useState('');

  async function carregar() {
    const [{ data: p }, { data: c }] = await Promise.all([
      api.get('/produtos'),
      api.get('/produtos/categorias'),
    ]);
    setProdutos(p);
    setCategorias(c);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar() {
    try {
      if (editId) {
        await api.put(`/produtos/${editId}`, form);
      } else {
        await api.post('/produtos', form);
      }
      setMsg('Produto salvo com sucesso!');
      setForm(vazio); setEditId(null); setMostrarForm(false);
      carregar();
    } catch {
      setMsg('Erro ao salvar produto.');
    }
  }

  async function excluir(id) {
    if (!confirm('Deseja remover este produto?')) return;
    await api.delete(`/produtos/${id}`);
    carregar();
  }

  function editar(p) {
    setForm({ nome: p.nome, descricao: p.descricao, preco: p.preco, imagem: p.imagem, categoria_id: p.categoria_id, quantidade: p.quantidade, ativo: p.ativo });
    setEditId(p.id);
    setMostrarForm(true);
  }

  // Filtros aplicados
  const produtosFiltrados = produtos.filter(p => {
    const matchCategoria = filtroCategoria === '' || String(p.categoria_id) === String(filtroCategoria);
    const matchBusca     = busca === '' || p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  // Categoria selecionada para destaque visual
  const catSelecionada = categorias.find(c => String(c.id) === String(filtroCategoria));
  const corDestaque    = catSelecionada ? (CATEGORIA_COR[catSelecionada.nome] || '#3A5D3E') : '#3A5D3E';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>Produtos</h1>
        <button className="btn-verde" onClick={() => { setForm(vazio); setEditId(null); setMostrarForm(true); }}>+ Novo Produto</button>
      </div>

      {msg && <p className="sucesso" style={{ marginBottom: 16 }}>{msg}</p>}

      {/* Filtros por Categoria */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setFiltroCategoria('')}
          style={{
            padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: filtroCategoria === '' ? '#3A5D3E' : '#f5f7f2',
            color:      filtroCategoria === '' ? '#fff'    : '#3A5D3E',
            border: '2px solid #3A5D3E', transition: 'all 0.2s'
          }}
        >
          🌿 Todos ({produtos.length})
        </button>
        {categorias.map(c => {
          const cor    = CATEGORIA_COR[c.nome] || '#3A5D3E';
          const icone  = CATEGORIA_ICONE[c.nome] || '📦';
          const qtd    = produtos.filter(p => String(p.categoria_id) === String(c.id)).length;
          const ativo  = String(filtroCategoria) === String(c.id);
          const vazia  = qtd === 0;
          return (
            <button
              key={c.id}
              onClick={() => setFiltroCategoria(ativo ? '' : c.id)}
              title={vazia ? `Nenhum produto em "${c.nome}" ainda. Clique em "+ Novo Produto" para adicionar!` : ''}
              style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: ativo ? cor : '#f5f7f2',
                color:      ativo ? '#fff' : cor,
                border: `2px solid ${cor}`,
                transition: 'all 0.2s',
                opacity: vazia ? 0.65 : 1,
              }}
            >
              {icone} {c.nome} ({qtd}){vazia ? ' ✚' : ''}
            </button>
          );
        })}

        {/* Busca por nome */}
        <input
          placeholder="🔍 Buscar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '8px 16px', borderRadius: 20,
            border: '1.5px solid #d0d7c4', fontSize: 13, outline: 'none', minWidth: 200
          }}
        />
      </div>

      {/* Destaque de categoria selecionada */}
      {catSelecionada && (
        <div style={{
          background: `${corDestaque}15`,
          border: `1.5px solid ${corDestaque}40`,
          borderRadius: 10, padding: '10px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{CATEGORIA_ICONE[catSelecionada.nome] || '📦'}</span>
            <div>
              <strong style={{ color: corDestaque, fontSize: 15 }}>{catSelecionada.nome}</strong>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>
                {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {produtosFiltrados.length === 0 && (
            <button
              className="btn-verde"
              style={{ fontSize: 13, padding: '8px 16px' }}
              onClick={() => {
                setForm({ ...vazio, categoria_id: catSelecionada.id });
                setEditId(null);
                setMostrarForm(true);
              }}
            >
              + Adicionar primeiro produto de {catSelecionada.nome}
            </button>
          )}
        </div>
      )}

      {/* Formulário */}
      {mostrarForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Campo label="Nome *"><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></Campo>
            <Campo label="Preço (R$) *"><input type="number" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} /></Campo>
            <Campo label="Categoria">
              <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                <option value="">Selecione...</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>
                    {CATEGORIA_ICONE[c.nome] || ''} {c.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Quantidade em Estoque">
              <input type="number" min="0" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: parseInt(e.target.value) || 0 })} />
            </Campo>
            <Campo label="URL da Imagem" style={{ gridColumn: '1 / -1' }}>
              <input value={form.imagem} onChange={e => setForm({ ...form, imagem: e.target.value })} placeholder="/img/produto.jpg ou https://..." />
            </Campo>
            <Campo label="Descrição" style={{ gridColumn: '1 / -1' }}>
              <textarea rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #d0d7c4', fontFamily: 'Lato', fontSize: 14 }}
                value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </Campo>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn-verde" onClick={salvar}>💾 Salvar</button>
            <button onClick={() => setMostrarForm(false)} style={{ background: '#eee', color: '#333', padding: '12px 20px', borderRadius: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', background: '#f8faf5' }}>
              <th style={th}>Produto</th>
              <th style={th}>Categoria</th>
              <th style={th}>Preço</th>
              <th style={th}>Estoque</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map(p => {
                const cor   = CATEGORIA_COR[p.categoria_nome] || '#888';
                const icone = CATEGORIA_ICONE[p.categoria_nome] || '📦';
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.imagem || 'https://via.placeholder.com/44x44/f5f7f2/3A5D3E?text=+'} style={{ width: 44, height: 44, objectFit: 'cover', background: '#f5f7f2', borderRadius: 6 }}
                          onError={e => { e.target.src = 'https://via.placeholder.com/44x44/f5f7f2/3A5D3E?text=+'; }} />
                        <strong>{p.nome}</strong>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{
                        background: `${cor}18`, color: cor,
                        padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                        border: `1px solid ${cor}40`
                      }}>
                        {icone} {p.categoria_nome}
                      </span>
                    </td>
                    <td style={td}>R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                    <td style={td}>
                      <span className={`badge ${p.quantidade > 0 ? 'badge-verde' : 'badge-vermelho'}`}>
                        {p.quantidade} un.
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-azul btn-sm" onClick={() => editar(p)}>✏️ Editar</button>
                        {admin.nivel !== 'vendedor' && (
                          <button className="btn-perigo btn-sm" onClick={() => excluir(p.id)}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Campo({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' }}>{label}</label>
      {children}
    </div>
  );
}

const th = { padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 600 };
const td = { padding: '12px 14px', fontSize: 14 };

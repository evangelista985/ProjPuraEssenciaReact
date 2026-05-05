import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useViaCep } from '../hooks/useViaCep';

const st = {
  page:      { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg, #f5f7f2 0%, #e8f0e9 100%)' },
  box:       { width: '100%', maxWidth: 520 },
  campo:     { marginBottom: 16 },
  label:     { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' },
  grid2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  secao:     { borderTop: '1px solid #e8f0e9', paddingTop: 16, marginTop: 8, marginBottom: 4 },
  secaoTit:  { fontSize: 13, fontWeight: 700, color: '#3A5D3E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 },
  cepWrap:   { display: 'flex', gap: 8 },
  cepStatus: { fontSize: 12, marginTop: 6, fontStyle: 'italic' },
};

export function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const { loginCliente } = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setErro('');
    try {
      const { data } = await api.post('/clientes/login', form);
      loginCliente(data.token, data.cliente);
      nav('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    }
  }

  return (
    <div style={st.page}>
      <div className="card" style={st.box}>
        <h1 style={{ marginBottom: 8 }}>Entrar</h1>
        <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Acesse sua conta para comprar</p>
        <form onSubmit={handleSubmit}>
          <div style={st.campo}>
            <label style={st.label}>E-mail</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com" />
          </div>
          <div style={st.campo}>
            <label style={st.label}>Senha</label>
            <input type="password" required value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
              placeholder="••••••" />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn-verde" style={{ width: '100%', marginTop: 20 }}>Entrar</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          Não tem conta? <Link to="/cadastro" style={{ color: '#3A5D3E', fontWeight: 700 }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export function Cadastro() {
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', telefone: '',
    cep: '', logradouro: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '',
  });
  const [erro,   setErro]   = useState('');
  const [sucesso,setSucesso] = useState('');
  const nav = useNavigate();
  const { buscarCep, buscandoCep, erroCep, formatarCep } = useViaCep();

  function handleCep(e) {
    const cepFormatado = formatarCep(e.target.value);
    setForm(f => ({ ...f, cep: cepFormatado }));
    if (cepFormatado.length === 9) {
      buscarCep(cepFormatado, (end) => {
        setForm(f => ({ ...f, logradouro: end.logradouro, bairro: end.bairro, cidade: end.cidade, estado: end.estado }));
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setErro(''); setSucesso('');
    try {
      await api.post('/clientes/cadastro', form);
      setSucesso('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => nav('/login'), 1800);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar');
    }
  }

  return (
    <div style={st.page}>
      <div className="card" style={st.box}>
        <h1 style={{ marginBottom: 8 }}>Criar Conta</h1>
        <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Preencha seus dados para se cadastrar</p>
        <form onSubmit={handleSubmit}>

          <div style={st.campo}>
            <label style={st.label}>Nome completo *</label>
            <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome completo" />
          </div>

          <div style={st.grid2}>
            <div style={st.campo}>
              <label style={st.label}>E-mail *</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" />
            </div>
            <div style={st.campo}>
              <label style={st.label}>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div style={st.campo}>
            <label style={st.label}>Senha *</label>
            <input type="password" required value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </div>

          <div style={st.secao}>
            <p style={st.secaoTit}>📍 Endereço de entrega</p>
          </div>

          <div style={st.campo}>
            <label style={st.label}>CEP *</label>
            <div style={st.cepWrap}>
              <input value={form.cep} onChange={handleCep} placeholder="00000-000" maxLength={9} style={{ flex: 1 }} />
              <button type="button" className="btn-azul btn-sm" style={{ whiteSpace: 'nowrap' }}
                onClick={() => buscarCep(form.cep, (end) => setForm(f => ({ ...f, ...end })))}
                disabled={buscandoCep}>
                {buscandoCep ? '⏳' : '🔍 Buscar'}
              </button>
            </div>
            {buscandoCep && <p style={{ ...st.cepStatus, color: '#3A5D3E' }}>🌿 Buscando endereço...</p>}
            {erroCep     && <p style={{ ...st.cepStatus, color: '#dc3545' }}>{erroCep}</p>}
          </div>

          <div style={{ ...st.grid2, gridTemplateColumns: '2fr 1fr' }}>
            <div style={st.campo}>
              <label style={st.label}>Rua / Logradouro *</label>
              <input value={form.logradouro} onChange={e => setForm({ ...form, logradouro: e.target.value })} placeholder="Preenchido pelo CEP" />
            </div>
            <div style={st.campo}>
              <label style={st.label}>Número *</label>
              <input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="123" />
            </div>
          </div>

          <div style={st.grid2}>
            <div style={st.campo}>
              <label style={st.label}>Complemento</label>
              <input value={form.complemento} onChange={e => setForm({ ...form, complemento: e.target.value })} placeholder="Apto, bloco..." />
            </div>
            <div style={st.campo}>
              <label style={st.label}>Bairro *</label>
              <input value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} placeholder="Preenchido pelo CEP" />
            </div>
          </div>

          <div style={st.grid2}>
            <div style={st.campo}>
              <label style={st.label}>Cidade *</label>
              <input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Preenchido pelo CEP" />
            </div>
            <div style={st.campo}>
              <label style={st.label}>Estado *</label>
              <input value={form.estado} maxLength={2} onChange={e => setForm({ ...form, estado: e.target.value.toUpperCase() })} placeholder="SP" />
            </div>
          </div>

          {erro   && <p className="erro"    style={{ marginTop: 4 }}>{erro}</p>}
          {sucesso && <p className="sucesso" style={{ marginTop: 4 }}>{sucesso}</p>}

          <button type="submit" className="btn-verde" style={{ width: '100%', marginTop: 20, fontSize: 15 }}>
            🌿 Criar Conta
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          Já tem conta? <Link to="/login" style={{ color: '#3A5D3E', fontWeight: 700 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}

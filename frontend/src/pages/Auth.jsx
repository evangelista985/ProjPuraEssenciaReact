import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const st = {
  page:  { minHeight: '100vh', paddingTop: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg, #f5f7f2 0%, #e8f0e9 100%)', paddingTop: 120 },
  box:   { width: '100%', maxWidth: 420 },
  campo: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' },
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
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" />
          </div>
          <div style={st.campo}>
            <label style={st.label}>Senha</label>
            <input type="password" required value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="••••••" />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn-verde" style={{ width: '100%', marginTop: 20 }}>Entrar</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          <Link to="/esqueci-senha" style={{ color: '#3A5D3E', fontWeight: 700 }}>Esqueci minha senha</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 14, color: '#888' }}>
          Não tem conta? <Link to="/cadastro" style={{ color: '#3A5D3E', fontWeight: 700 }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' });
  const [erro,   setErro]   = useState('');
  const [sucesso,setSucesso] = useState('');
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setErro(''); setSucesso('');
    try {
      await api.post('/clientes/cadastro', form);
      setSucesso('Cadastro realizado! Redirecionando...');
      setTimeout(() => nav('/login'), 1500);
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
            <label style={st.label}>Nome completo</label>
            <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" />
          </div>
          <div style={st.campo}>
            <label style={st.label}>E-mail</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" />
          </div>
          <div style={st.campo}>
            <label style={st.label}>Telefone (opcional)</label>
            <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
          </div>
          <div style={st.campo}>
            <label style={st.label}>Senha</label>
            <input type="password" required value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </div>
          {erro   && <p className="erro"  >{erro}</p>}
          {sucesso && <p className="sucesso">{sucesso}</p>}
          <button type="submit" className="btn-verde" style={{ width: '100%', marginTop: 20 }}>Criar Conta</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          Já tem conta? <Link to="/login" style={{ color: '#3A5D3E', fontWeight: 700 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}

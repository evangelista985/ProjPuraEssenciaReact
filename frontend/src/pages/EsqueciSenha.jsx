import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const st = {
  page:  { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg, #f5f7f2 0%, #e8f0e9 100%)' },
  box:   { width: '100%', maxWidth: 440 },
  campo: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3A5D3E' },
  erro:  { color: '#c0392b', fontSize: 13, marginTop: 8, textAlign: 'center' },
  ok:    { color: '#3A5D3E', fontSize: 13, marginTop: 8, textAlign: 'center', background: '#e8f5e9', padding: '8px 12px', borderRadius: 6 },
};

// ── Passo 1: Informa o e-mail ──────────────────────────────────────────────────
function PassoEmail({ onNext }) {
  const [email, setEmail] = useState('');
  const [erro,  setErro]  = useState('');
  const [ok,    setOk]    = useState('');
  const [load,  setLoad]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setErro(''); setOk(''); setLoad(true);
    try {
      const res = await api.post('/clientes/esqueci-senha', { email });
      setOk(res.data.mensagem);
      setTimeout(() => onNext(email), 1500);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao enviar o código');
    } finally { setLoad(false); }
  }

  return (
    <div style={st.page}>
      <div className="card" style={st.box}>
        <h1 style={{ marginBottom: 8 }}>Esqueci a senha</h1>
        <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
          Informe seu e-mail e enviaremos um código de verificação.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={st.campo}>
            <label style={st.label}>E-mail</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          {erro && <p style={st.erro}>{erro}</p>}
          {ok   && <p style={st.ok}>✅ {ok}</p>}
          <button type="submit" className="btn-verde" style={{ width: '100%', marginTop: 20 }} disabled={load}>
            {load ? 'Enviando...' : '🌿 Enviar código por e-mail'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          Lembrou a senha?{' '}
          <Link to="/login" style={{ color: '#3A5D3E', fontWeight: 700 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}

// ── Passo 2: Código + nova senha ───────────────────────────────────────────────
function PassoCodigo({ email, onSucesso }) {
  const [form, setForm] = useState({ codigo: '', novaSenha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [load, setLoad] = useState(false);

  function set(campo, valor) { setForm(f => ({ ...f, [campo]: valor })); }

  async function handleSubmit(e) {
    e.preventDefault(); setErro('');
    if (form.novaSenha !== form.confirmar) return setErro('As senhas não coincidem');
    if (form.novaSenha.length < 6) return setErro('A senha deve ter no mínimo 6 caracteres');
    setLoad(true);
    try {
      await api.post('/clientes/redefinir-senha', {
        email,
        codigo: form.codigo,
        novaSenha: form.novaSenha,
      });
      onSucesso();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Código inválido ou expirado');
    } finally { setLoad(false); }
  }

  return (
    <div style={st.page}>
      <div className="card" style={st.box}>
        <h1 style={{ marginBottom: 8 }}>Redefinir senha</h1>
        <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
          Enviamos um código para <strong>{email}</strong>.<br />
          Verifique sua caixa de entrada.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={st.campo}>
            <label style={st.label}>Código de verificação</label>
            <input
              required maxLength={6} value={form.codigo}
              onChange={e => set('codigo', e.target.value)}
              placeholder="000000"
              style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center' }}
            />
          </div>
          <div style={st.campo}>
            <label style={st.label}>Nova senha</label>
            <input
              type="password" required value={form.novaSenha}
              onChange={e => set('novaSenha', e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div style={st.campo}>
            <label style={st.label}>Confirmar nova senha</label>
            <input
              type="password" required value={form.confirmar}
              onChange={e => set('confirmar', e.target.value)}
              placeholder="Repita a senha"
            />
          </div>
          {erro && <p style={st.erro}>{erro}</p>}
          <button type="submit" className="btn-verde" style={{ width: '100%', marginTop: 20 }} disabled={load}>
            {load ? 'Salvando...' : '🌿 Redefinir senha'}
          </button>
        </form>
        <p
          style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888', cursor: 'pointer' }}
          onClick={() => window.location.reload()}
        >
          Não recebeu o código?{' '}
          <span style={{ color: '#3A5D3E', fontWeight: 700 }}>Reenviar</span>
        </p>
      </div>
    </div>
  );
}

// ── Passo 3: Sucesso ───────────────────────────────────────────────────────────
function PassoSucesso() {
  return (
    <div style={st.page}>
      <div className="card" style={{ ...st.box, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <h1 style={{ marginBottom: 8 }}>Senha redefinida!</h1>
        <p style={{ color: '#888', marginBottom: 28, fontSize: 14 }}>
          Sua senha foi alterada com sucesso.<br />Faça login para continuar.
        </p>
        <Link to="/login">
          <button className="btn-verde" style={{ width: '100%' }}>🌿 Fazer login</button>
        </Link>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function EsqueciSenha() {
  const [passo, setPasso] = useState(1);
  const [email, setEmail] = useState('');

  if (passo === 1) return <PassoEmail onNext={e => { setEmail(e); setPasso(2); }} />;
  if (passo === 2) return <PassoCodigo email={email} onSucesso={() => setPasso(3)} />;
  return <PassoSucesso />;
}

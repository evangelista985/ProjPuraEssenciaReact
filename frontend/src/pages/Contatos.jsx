import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Contato() {
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [status, setStatus] = useState(null); // null | 'enviando' | 'sucesso' | 'erro'
  const [erro, setErro] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('enviando');
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/contato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao enviar mensagem');
      setStatus('sucesso');
      setForm({ nome: '', email: '', mensagem: '' });
    } catch (err) {
      setStatus('erro');
      setErro(err.message);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.titulo}>Fale conosco</h1>
        <p style={s.subtitulo}>
          Envie sua dúvida, sugestão ou solicitação e nossa equipe responderá em breve.
        </p>

        <div style={s.grid}>
          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>Nome</label>
            <input
              type="text" name="nome" required
              value={form.nome} onChange={handleChange}
              placeholder="Seu nome" style={s.input}
            />

            <label style={s.label}>E-mail</label>
            <input
              type="email" name="email" required
              value={form.email} onChange={handleChange}
              placeholder="seuemail@exemplo.com" style={s.input}
            />

            <label style={s.label}>Mensagem</label>
            <textarea
              name="mensagem" required rows={5}
              value={form.mensagem} onChange={handleChange}
              placeholder="Escreva sua mensagem..." style={s.textarea}
            />

            <button type="submit" disabled={status === 'enviando'} style={s.botao}>
              {status === 'enviando' ? 'Enviando...' : 'Enviar mensagem'}
            </button>

            {status === 'sucesso' && (
              <p style={s.sucesso}>
                ✅ Mensagem enviada! Vamos analisar sua solicitação e retornaremos em breve.
              </p>
            )}
            {status === 'erro' && (
              <p style={s.erroMsg}>❌ {erro}</p>
            )}
          </form>

          <div style={s.lateral}>
            <h3 style={s.lateralTitulo}>Outros canais</h3>
            <ul style={s.lateralLista}>
              <li>📍 R. Guiapá, 678 – Vila Leopoldina<br />CEP 05089-001 – São Paulo, SP</li>
              <li>📞 (11) 3456-7890</li>
              <li>✉️ puraessenciaetec@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#F5F7F2', minHeight: '60vh', padding: '40px 20px' },
  container: { maxWidth: 900, margin: '0 auto' },
  titulo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: '#1A3628', marginBottom: '0.4rem' },
  subtitulo: { color: '#5A7E5C', fontSize: '0.95rem', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', color: '#1A3628', fontWeight: 600, marginTop: '0.6rem' },
  input: {
    padding: '12px 14px', borderRadius: 8, border: '1px solid #d4d4a8',
    fontSize: '0.95rem', fontFamily: "'Jost', sans-serif", outline: 'none',
  },
  textarea: {
    padding: '12px 14px', borderRadius: 8, border: '1px solid #d4d4a8',
    fontSize: '0.95rem', fontFamily: "'Jost', sans-serif", outline: 'none', resize: 'vertical',
  },
  botao: {
    marginTop: '1rem', padding: '14px', background: '#1A3628', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600,
    cursor: 'pointer', letterSpacing: '0.04em',
  },
  sucesso: { marginTop: '1rem', color: '#2d6a2d', fontSize: '0.9rem', lineHeight: 1.6 },
  erroMsg: { marginTop: '1rem', color: '#a32d2d', fontSize: '0.9rem' },
  lateral: { background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e0e0c8' },
  lateralTitulo: { fontSize: '0.85rem', fontWeight: 700, color: '#1A3628', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', borderBottom: '1px solid #e0e0c8', paddingBottom: '0.6rem' },
  lateralLista: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.85rem', color: '#5A7E5C', lineHeight: 1.6, padding: 0 },
};
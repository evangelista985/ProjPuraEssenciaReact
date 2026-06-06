import { useState, useEffect } from 'react';

export default function PixSimulado({ total, onConfirmar, onCancelar, loading }) {
  const [tempo, setTempo] = useState(30 * 60); // 30 minutos
  const [copiado, setCopiado] = useState(false);

  const chavePix = 'puraessenciaetec@gmail.com';
  const txid = `PURA${Date.now().toString().slice(-8)}`;

  useEffect(() => {
    if (tempo <= 0) return;
    const timer = setInterval(() => setTempo(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [tempo]);

  const minutos = String(Math.floor(tempo / 60)).padStart(2, '0');
  const segundos = String(tempo % 60).padStart(2, '0');
  const expirado = tempo <= 0;
  const urgente = tempo < 300; // menos de 5 min

  function copiar() {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div style={st.overlay}>
      <div style={st.modal}>

        {/* Header */}
        <div style={st.header}>
          <div style={st.pixLogo}>
            <svg viewBox="0 0 100 100" width="32" height="32">
              <path d="M25 50 L50 25 L75 50 L50 75 Z" fill="#32BCAD"/>
              <path d="M15 40 L25 50 L15 60 Z" fill="#32BCAD" opacity="0.6"/>
              <path d="M85 40 L75 50 L85 60 Z" fill="#32BCAD" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <h2 style={st.titulo}>Pague com PIX</h2>
            <p style={st.subtitulo}>Escaneie o QR Code ou copie a chave</p>
          </div>
        </div>

        {/* Timer */}
        <div style={{ ...st.timer, background: urgente ? '#fff3f3' : '#f0f7f0', borderColor: urgente ? '#dc3545' : '#3A5D3E' }}>
          <span style={{ fontSize: 13, color: urgente ? '#dc3545' : '#3A5D3E', fontWeight: 600 }}>
            {expirado ? '❌ QR Code expirado' : `⏱ Expira em: ${minutos}:${segundos}`}
          </span>
        </div>

        {/* QR Code simulado */}
        <div style={st.qrWrap}>
          <div style={st.qrCode}>
            {/* QR Code SVG simulado */}
            <svg viewBox="0 0 200 200" width="160" height="160" style={{ opacity: expirado ? 0.3 : 1 }}>
              {/* Bordas dos cantos */}
              <rect x="10" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="8"/>
              <rect x="20" y="20" width="30" height="30" fill="#000"/>
              <rect x="140" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="8"/>
              <rect x="150" y="20" width="30" height="30" fill="#000"/>
              <rect x="10" y="140" width="50" height="50" fill="none" stroke="#000" strokeWidth="8"/>
              <rect x="20" y="150" width="30" height="30" fill="#000"/>
              {/* Padrão central simulado */}
              {[0,1,2,3,4,5,6].map(row =>
                [0,1,2,3,4,5,6].map(col => {
                  const val = (row * 7 + col * 3 + row + col) % 3;
                  if (val === 0) return null;
                  const x = 75 + col * 8;
                  const y = 75 + row * 8;
                  if (x > 130 || y > 130) return null;
                  return <rect key={`${row}-${col}`} x={x} y={y} width="6" height="6" fill="#000"/>;
                })
              )}
              {/* Logo PIX no centro */}
              <rect x="88" y="88" width="24" height="24" fill="#fff" rx="3"/>
              <path d="M93 100 L100 93 L107 100 L100 107 Z" fill="#32BCAD"/>
            </svg>
            {expirado && (
              <div style={st.qrExpirado}>
                <p style={{ fontWeight: 700, color: '#dc3545' }}>QR Code expirado</p>
              </div>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, textAlign: 'center' }}>
            QR Code simulado — em produção seria gerado pelo banco
          </p>
        </div>

        {/* Valor */}
        <div style={st.valorBox}>
          <span style={{ fontSize: 13, color: '#888' }}>Valor a pagar</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#3A5D3E' }}>
            R$ {Number(total).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Chave PIX */}
        <div style={st.chaveBox}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Chave PIX</p>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{chavePix}</p>
          </div>
          <button onClick={copiar} style={st.btnCopiar}>
            {copiado ? '✅ Copiado!' : '📋 Copiar'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: '8px 0 16px' }}>
          ID da transação: {txid}
        </p>

        {/* Instruções */}
        <div style={st.instrucoes}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Como pagar:</p>
          {['Abra o app do seu banco', 'Escaneie o QR Code ou cole a chave PIX', 'Confirme o pagamento no valor exato', 'Clique em "Confirmar Pagamento" abaixo'].map((p, i) => (
            <p key={i} style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
              <span style={{ color: '#3A5D3E', fontWeight: 700 }}>{i + 1}.</span> {p}
            </p>
          ))}
        </div>

        {/* Botões */}
        <button
          style={{ ...st.btnConfirmar, opacity: expirado ? 0.5 : 1 }}
          onClick={onConfirmar}
          disabled={loading || expirado}
        >
          {loading ? '⏳ Processando...' : '✅ Confirmar Pagamento'}
        </button>

        <button onClick={onCancelar} style={st.btnCancelar}>
          Cancelar e escolher outra forma
        </button>
      </div>
    </div>
  );
}

const st = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:      { background: '#fff', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  header:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  pixLogo:    { width: 48, height: 48, background: '#e8faf8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  titulo:     { fontSize: 18, fontWeight: 700, margin: 0 },
  subtitulo:  { fontSize: 13, color: '#888', margin: 0 },
  timer:      { border: '1.5px solid', borderRadius: 8, padding: '8px 14px', textAlign: 'center', marginBottom: 16 },
  qrWrap:     { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 },
  qrCode:     { position: 'relative', background: '#fff', border: '2px solid #eee', borderRadius: 12, padding: 12 },
  qrExpirado: { position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  valorBox:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faf5', borderRadius: 10, padding: '12px 16px', marginBottom: 12 },
  chaveBox:   { display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '10px 14px', marginBottom: 8 },
  btnCopiar:  { background: '#f0f7f0', border: '1px solid #3A5D3E', color: '#3A5D3E', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' },
  instrucoes: { background: '#fafafa', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  btnConfirmar: { width: '100%', background: '#3A5D3E', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  btnCancelar:  { width: '100%', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
};

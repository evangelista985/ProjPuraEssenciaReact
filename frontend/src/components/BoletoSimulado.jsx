import { useState } from 'react';

export default function BoletoSimulado({ total, onConfirmar, onCancelar, loading }) {
  const [copiado, setCopiado] = useState(false);

  // Gera código de barras fictício no formato real
  const hoje = new Date();
  const vencimento = new Date(hoje);
  vencimento.setDate(vencimento.getDate() + 3);
  const dataVenc = vencimento.toLocaleDateString('pt-BR');

  const nossoNumero = String(Date.now()).slice(-10);
  const codigoBarras = `34191.${nossoNumero.slice(0,5)} ${nossoNumero.slice(5)}.123456 78901.234567 8 ${String(Math.floor(total * 100)).padStart(10, '0')}`;
  const linhaDigitavel = codigoBarras;

  function copiar() {
    navigator.clipboard.writeText(codigoBarras.replace(/\s/g, ''));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function imprimir() {
    const janela = window.open('', '_blank');
    janela.document.write(`
      <html>
        <head>
          <title>Boleto Pura Essência</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
            .logo { font-size: 22px; font-weight: 800; color: #3A5D3E; }
            .banco { font-size: 18px; font-weight: 700; }
            .linha { font-family: monospace; font-size: 14px; letter-spacing: 1px; background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 16px 0; word-break: break-all; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
            .campo { border: 1px solid #ddd; padding: 8px 12px; border-radius: 4px; }
            .campo label { font-size: 11px; color: #888; display: block; }
            .campo span { font-weight: 700; font-size: 15px; }
            .barras { text-align: center; margin: 24px 0; font-size: 60px; letter-spacing: -2px; color: #000; }
            .aviso { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #856404; margin-top: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌿 Pura Essência</div>
            <div class="banco">Banco Simulado S/A · 341-7</div>
          </div>
          <div class="linha">${linhaDigitavel}</div>
          <div class="info">
            <div class="campo"><label>Beneficiário</label><span>Pura Essência LTDA</span></div>
            <div class="campo"><label>CNPJ</label><span>00.000.000/0001-00</span></div>
            <div class="campo"><label>Vencimento</label><span>${dataVenc}</span></div>
            <div class="campo"><label>Valor</label><span>R$ ${Number(total).toFixed(2).replace('.', ',')}</span></div>
            <div class="campo"><label>Nosso Número</label><span>${nossoNumero}</span></div>
            <div class="campo"><label>Espécie Doc</label><span>DM</span></div>
          </div>
          <div class="barras">||| || ||| | || ||| | || ||| |||| | || |||</div>
          <div class="aviso">⚠️ Este é um boleto simulado para fins de demonstração. Em produção, seria emitido por uma instituição financeira real.</div>
          <br/>
          <button onclick="window.print()">🖨️ Imprimir</button>
        </body>
      </html>
    `);
    janela.document.close();
  }

  return (
    <div style={st.overlay}>
      <div style={st.modal}>

        {/* Header */}
        <div style={st.header}>
          <div style={st.boletoIcon}>📄</div>
          <div>
            <h2 style={st.titulo}>Boleto Bancário</h2>
            <p style={st.subtitulo}>Vencimento em {dataVenc}</p>
          </div>
        </div>

        {/* Aviso */}
        <div style={st.aviso}>
          ⚠️ Boleto simulado — em produção seria emitido por um banco real
        </div>

        {/* Valor */}
        <div style={st.valorBox}>
          <span style={{ fontSize: 13, color: '#888' }}>Valor do boleto</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#3A5D3E' }}>
            R$ {Number(total).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Código de barras visual */}
        <div style={st.barcodeWrap}>
          <div style={st.barcode}>
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} style={{
                width: i % 3 === 0 ? 3 : i % 5 === 0 ? 5 : 2,
                height: '100%',
                background: '#000',
                marginRight: 1,
                opacity: i % 7 === 0 ? 0.4 : 1,
              }} />
            ))}
          </div>
        </div>

        {/* Linha digitável */}
        <div style={st.linhaBox}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Linha digitável</p>
          <p style={st.linhaDigitavel}>{codigoBarras}</p>
          <button onClick={copiar} style={st.btnCopiar}>
            {copiado ? '✅ Copiado!' : '📋 Copiar código'}
          </button>
        </div>

        {/* Informações */}
        <div style={st.infoGrid}>
          {[
            { label: 'Beneficiário', valor: 'Pura Essência LTDA' },
            { label: 'Vencimento', valor: dataVenc },
            { label: 'Nosso Número', valor: nossoNumero },
            { label: 'Instrução', valor: 'Não receber após vencimento' },
          ].map(({ label, valor }) => (
            <div key={label} style={st.infoItem}>
              <span style={st.infoLabel}>{label}</span>
              <span style={st.infoValor}>{valor}</span>
            </div>
          ))}
        </div>

        {/* Instruções */}
        <div style={st.instrucoes}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Como pagar:</p>
          {[
            'Copie o código ou baixe o boleto',
            'Pague pelo app do banco, lotérica ou agência',
            'O pagamento é processado em até 2 dias úteis',
            'Clique em "Confirmar" para registrar seu pedido',
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
              <span style={{ color: '#3A5D3E', fontWeight: 700 }}>{i + 1}.</span> {p}
            </p>
          ))}
        </div>

        {/* Botões */}
        <button onClick={imprimir} style={st.btnImprimir}>
          🖨️ Visualizar / Imprimir Boleto
        </button>

        <button onClick={onConfirmar} style={st.btnConfirmar} disabled={loading}>
          {loading ? '⏳ Processando...' : '✅ Confirmar Pedido'}
        </button>

        <button onClick={onCancelar} style={st.btnCancelar}>
          Cancelar e escolher outra forma
        </button>
      </div>
    </div>
  );
}

const st = {
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:         { background: '#fff', borderRadius: 16, padding: 28, maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  header:        { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  boletoIcon:    { width: 48, height: 48, background: '#fff8e1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
  titulo:        { fontSize: 18, fontWeight: 700, margin: 0 },
  subtitulo:     { fontSize: 13, color: '#e67e22', fontWeight: 600, margin: 0 },
  aviso:         { background: '#fff8e1', border: '1px solid #ffc107', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#856404', marginBottom: 16 },
  valorBox:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faf5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  barcodeWrap:   { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  barcode:       { display: 'flex', alignItems: 'stretch', height: 60, padding: '4px 12px', background: '#fff', border: '1px solid #eee', borderRadius: 4 },
  linhaBox:      { border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  linhaDigitavel:{ fontFamily: 'monospace', fontSize: 12, color: '#333', letterSpacing: 0.5, marginBottom: 10, wordBreak: 'break-all' },
  btnCopiar:     { background: '#f0f7f0', border: '1px solid #3A5D3E', color: '#3A5D3E', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  infoGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 },
  infoItem:      { background: '#fafafa', borderRadius: 8, padding: '8px 12px' },
  infoLabel:     { display: 'block', fontSize: 11, color: '#888', marginBottom: 2 },
  infoValor:     { display: 'block', fontSize: 13, fontWeight: 600, color: '#333' },
  instrucoes:    { background: '#fafafa', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  btnImprimir:   { width: '100%', background: '#fff', border: '1.5px solid #3A5D3E', color: '#3A5D3E', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10 },
  btnConfirmar:  { width: '100%', background: '#3A5D3E', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  btnCancelar:   { width: '100%', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
};

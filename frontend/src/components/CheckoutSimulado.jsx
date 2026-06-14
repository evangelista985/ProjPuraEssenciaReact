import React, { useState, useEffect } from 'react';

// SVG inline das bandeiras para garantir que apareçam sem depender de URL externa
const BANDEIRA_SVG = {
  visa: (
    <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" style={{height:'100%',width:'100%'}}>
      <rect width="750" height="471" rx="40" fill="#fff"/>
      <path d="M278.2 336.5l33.4-195.9h53.4l-33.4 195.9h-53.4zM524.3 144.5c-10.6-4-27.2-8.2-47.9-8.2-52.8 0-90 26.5-90.3 64.5-.3 28.1 26.6 43.7 46.9 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-3-50.3-10.4l-6.9-3.1-7.5 43.6c12.5 5.4 35.6 10.2 59.6 10.4 56.3 0 92.8-26.2 93.2-66.8.2-22.2-14-39.2-44.7-53.1-18.6-9-30-15-30-24.2.1-8.1 9.7-16.7 30.6-16.7 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.7-44.3zM657.2 140.6h-41.2c-12.8 0-22.4 3.5-28 16.2l-79.4 178.7h56.1s9.2-24 11.3-29.2l68.5.1c1.6 6.8 6.5 29.1 6.5 29.1h49.6l-43.4-194.9zm-65.9 126.1c4.4-11.2 21.3-54.5 21.3-54.5-.3.5 4.4-11.3 7.1-18.7l3.6 16.9s10.2 46.5 12.3 56.3h-44.3zM222.9 140.6l-52.4 133.6-5.6-27.2c-9.7-31.1-40.1-64.8-74-81.7l47.9 170.2h56.5l84-194.9h-56.4z"/>
      <path d="M144.1 140.6H57.8l-.7 3.9c67.1 16.2 111.4 55.4 129.8 102.5l-18.7-89.7c-3.2-12.5-12.6-16.2-24.1-16.7z" fill="#F9A51A"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 152.4 108" xmlns="http://www.w3.org/2000/svg" style={{height:'100%',width:'100%'}}>
      <circle cx="55.8" cy="54" r="54" fill="#EB001B"/>
      <circle cx="96.6" cy="54" r="54" fill="#F79E1B"/>
      <path d="M76.2 19.4a54 54 0 0 1 0 69.2 54 54 0 0 1 0-69.2z" fill="#FF5F00"/>
    </svg>
  ),
  elo: (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{height:'100%',width:'100%'}}>
      <rect width="200" height="80" fill="#000"/>
      <text x="10" y="55" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="46" fill="#FFD700">elo</text>
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" style={{height:'100%',width:'100%'}}>
      <rect width="60" height="38" rx="4" fill="#007BC1"/>
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="9" fill="#fff" letterSpacing="1">AMEX</text>
    </svg>
  ),
  diners: (
    <svg viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" style={{height:'100%',width:'100%'}}>
      <rect width="60" height="38" rx="4" fill="#004A97"/>
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="7" fill="#fff" letterSpacing="0.5">DINERS</text>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" style={{height:'100%',width:'100%'}}>
      <rect width="60" height="38" rx="4" fill="rgba(255,255,255,0.25)"/>
      <rect x="5" y="12" width="50" height="14" rx="2" fill="rgba(255,255,255,0.3)"/>
    </svg>
  )
};

const BANDEIRA_NOME = {
  visa: 'Visa detectado ✓',
  mastercard: 'Mastercard detectado ✓',
  elo: 'Elo detectado ✓',
  amex: 'American Express detectado ✓',
  diners: 'Diners Club detectado ✓',
  default: ''
};

const BANDEIRA_COR_BADGE = {
  visa: '#1a1f71',
  mastercard: '#eb001b',
  elo: '#000',
  amex: '#007BC1',
  diners: '#004A97',
  default: '#888'
};

const cardBackgrounds = {
  visa:       'linear-gradient(135deg, #1a1f71 0%, #0055a5 100%)',
  mastercard: 'linear-gradient(135deg, #eb001b 0%, #ff5f00 100%)',
  elo:        'linear-gradient(135deg, #212121 0%, #555 100%)',
  amex:       'linear-gradient(135deg, #007bc1 0%, #00a3e0 100%)',
  diners:     'linear-gradient(135deg, #000 0%, #444 100%)',
  default:    'linear-gradient(135deg, #3A5D3E 0%, #1e3121 100%)'
};

const detectarBandeira = (numero) => {
  const num = numero.replace(/\D/g, '');
  if (!num) return 'default';

  // Visa
  if (/^4/.test(num)) return 'visa';
  // Mastercard
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
  // Amex
  if (/^3[47]/.test(num)) return 'amex';
  // Elo (BINs completos — inclui débito e crédito)
  if (/^(4011(78|79)|431274|438935|451416|457393|457631|457632|504175|506699|5067[0-9]{2}|509[0-9]{3}|627780|636297|636368|6363(68|69)|650[4-9][0-9]{2}|6516[5-7][0-9]|6550[0-4][0-9]|655021)/.test(num)) return 'elo';
  // Diners
  if (/^3(0[0-5]|[68])/.test(num)) return 'diners';

  return 'default';
};

export default function CheckoutSimulado({ onFinalizar, loading, hideButton = false }) {
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '', parcelas: '1' });
  const [bandeira, setBandeira] = useState('default');
  const [virado, setVirado] = useState(false);

  useEffect(() => {
    setBandeira(detectarBandeira(cartao.numero));
  }, [cartao.numero]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'numero') {
      const digits = value.replace(/\D/g, '');
      value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    }
    if (name === 'validade') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
    }
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
      // Vira para o verso ao começar a digitar
      if (value.length > 0 && value.length < 3) setVirado(true);
      // Vira de volta para frente quando tiver 3+ dígitos
      if (value.length >= 3) {
        setTimeout(() => setVirado(false), 600);
      }
    } else {
      setVirado(false);
    }
    setCartao(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartao.numero.replace(/\D/g,'').length < 13 || cartao.validade.length < 5 || cartao.cvv.length < 3) {
      alert('Por favor, preencha os dados do cartão corretamente.');
      return;
    }
    onFinalizar(cartao);
  };

  const bg = cardBackgrounds[bandeira] || cardBackgrounds.default;

  return (
    <div style={st.container}>
      <h3 style={st.titulo}>💳 Dados do Cartão</h3>

      <form onSubmit={handleSubmit}>
        {/* ── Cartão visual ── */}
        <div
          style={{ ...st.cardOuter, cursor: 'pointer' }}
          onClick={() => setVirado(v => !v)}
          title="Clique no cartão para ver o verso"
          className="card-flip-outer"
        >
          <div style={{ ...st.cardInner, transform: virado ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

            {/* Frente */}
            <div style={{ ...st.cardFace, ...st.cardFront, background: bg }}>
              <div style={st.cardChip} />
              {/* Bandeira no canto superior direito */}
              <div style={st.cardBandeiraTopo}>
                <div style={st.cardBandeiraBox}>
                  {BANDEIRA_SVG[bandeira]}
                </div>
              </div>
              <div style={st.cardNumber}>
                {cartao.numero || '**** **** **** ****'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={st.cardLabel}>TITULAR</div>
                  <div style={st.cardValue}>{cartao.nome || 'NOME DO TITULAR'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={st.cardLabel}>VIDADE</div>
                  <div style={st.cardValue}>{cartao.validade || 'MM/AA'}</div>
                </div>
              </div>
            </div>

            {/* Verso */}
            <div style={{ ...st.cardFace, ...st.cardBack, background: bg }}>
              <div style={st.tarja} />
              <div style={st.assinatura}>
                <span style={st.cvvLabel}>CVV</span>
                <span style={st.cvvValue}>{cartao.cvv || '•••'}</span>
              </div>
              <div style={st.cardBandeiraVerso}>
                <div style={{ ...st.cardBandeiraBox, width: 50, height: 32 }}>
                  {BANDEIRA_SVG[bandeira]}
                </div>
              </div>
            </div>

          </div>
        </div>
        <p style={st.flipHint}>Clique no cartão para ver o verso</p>

        {/* Badge de bandeira detectada */}
        {bandeira !== 'default' && (
          <div style={{ ...st.badge, borderColor: BANDEIRA_COR_BADGE[bandeira] }}>
            <div style={{ width: 38, height: 24, flexShrink: 0 }}>
              {BANDEIRA_SVG[bandeira]}
            </div>
            <span style={{ color: BANDEIRA_COR_BADGE[bandeira], fontWeight: 700, fontSize: 14 }}>
              {BANDEIRA_NOME[bandeira]}
            </span>
          </div>
        )}

        {/* Número */}
        <div style={st.inputGroup}>
          <label style={st.label}>Número do Cartão *</label>
          <div style={{ position: 'relative' }}>
            <input
              name="numero" value={cartao.numero} onChange={handleChange}
              placeholder="0000 0000 0000 0000" required autoComplete="cc-number"
              style={{ ...st.input, paddingRight: '52px' }}
            />
            {bandeira !== 'default' && (
              <div style={st.inputBandeiraBox}>
                {BANDEIRA_SVG[bandeira]}
              </div>
            )}
          </div>
        </div>

        {/* Nome */}
        <div style={st.inputGroup}>
          <label style={st.label}>Nome do Titular *</label>
          <input
            name="nome" value={cartao.nome} onChange={handleChange}
            placeholder="Como está no cartão" required autoComplete="cc-name"
            style={st.input}
          />
        </div>

        {/* Validade + CVV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div style={st.inputGroup}>
            <label style={st.label}>Validade *</label>
            <input
              name="validade" value={cartao.validade} onChange={handleChange}
              placeholder="MM/AA" required autoComplete="cc-exp"
              style={st.input}
            />
          </div>
          <div style={st.inputGroup}>
            <label style={st.label}>CVV *</label>
            <input
              name="cvv" value={cartao.cvv} onChange={handleChange}
              placeholder="123" required autoComplete="cc-csc"
              style={st.input}
              onFocus={() => setVirado(true)}
              onBlur={() => { if (cartao.cvv.length < 3) setVirado(false); }}
            />
          </div>
        </div>

        {/* Parcelas */}
        <div style={st.inputGroup}>
          <label style={st.label}>Parcelas</label>
          <select name="parcelas" value={cartao.parcelas} onChange={handleChange} style={st.input}>
            <option value="1">1x sem juros</option>
            <option value="2">2x sem juros</option>
            <option value="3">3x sem juros</option>
          </select>
        </div>

        {!hideButton && (
          <button type="submit" style={st.btn} disabled={loading}>
            {loading ? '⌛ Processando...' : '✅ Finalizar Compra'}
          </button>
        )}
      </form>
    </div>
  );
}

const st = {
  container: {
    marginTop: 20, padding: 20, background: '#fff',
    borderRadius: 12, border: '1px solid #e0e7db',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  titulo: {
    fontSize: 18, marginBottom: 20, color: '#3A5D3E',
    textAlign: 'center', fontWeight: 700
  },
  // Flip card — responsivo para mobile (ratio 1.586:1)
  cardOuter: {
    perspective: 1000,
    width: '100%',
    maxWidth: 340,
    margin: '0 auto 6px auto',
    position: 'relative',
    paddingTop: 'min(63%, 214px)', // 214/340 ≈ 63% mantém proporção de cartão
  },
  cardInner: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    transition: 'transform 0.6s', transformStyle: 'preserve-3d'
  },
  cardFace: {
    position: 'absolute', width: '100%', height: '100%',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    borderRadius: 15, color: '#fff',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    padding: 20, boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
  },
  cardFront: {},
  cardBack: { transform: 'rotateY(180deg)', padding: 0, justifyContent: 'flex-start' },
  // Chip
  cardChip: {
    width: 45, height: 34,
    background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
    borderRadius: 6
  },
  // Bandeira no topo direito da frente
  cardBandeiraTopo: {
    position: 'absolute', top: 16, right: 16
  },
  cardBandeiraBox: {
    width: 56, height: 36,
    background: 'rgba(255,255,255,0.18)',
    borderRadius: 6, padding: 3,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden'
  },
  cardNumber: {
    fontSize: 'clamp(14px, 4vw, 20px)', letterSpacing: 3,
    fontFamily: 'monospace', textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  cardLabel: { fontSize: 9, textTransform: 'uppercase', opacity: 0.7, marginBottom: 2 },
  cardValue: { fontSize: 13, fontWeight: 600, textTransform: 'uppercase' },
  // Verso
  tarja: { height: 48, background: '#111', marginTop: 28, width: '100%' },
  assinatura: {
    background: '#f0f0f0', margin: '14px 20px 0',
    borderRadius: 4, padding: '8px 12px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  cvvLabel: { color: '#333', fontSize: 12, fontWeight: 600 },
  cvvValue: { color: '#333', fontFamily: 'monospace', fontSize: 18, letterSpacing: 4 },
  cardBandeiraVerso: {
    position: 'absolute', bottom: 16, right: 16
  },
  // Dica
  flipHint: { textAlign: 'center', fontSize: 11, color: '#999', margin: '0 0 14px' },
  // Badge
  badge: {
    display: 'flex', alignItems: 'center', gap: 10,
    border: '2px solid', borderRadius: 8,
    padding: '8px 14px', marginBottom: 16,
    background: '#fafafa'
  },
  // Form
  inputGroup: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, marginBottom: 5, color: '#444', fontWeight: 600 },
  input: {
    width: '100%', padding: '11px 12px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s'
  },
  inputBandeiraBox: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    width: 38, height: 24, pointerEvents: 'none'
  },
  btn: {
    width: '100%', padding: 15, fontSize: 16, fontWeight: 'bold',
    marginTop: 8, borderRadius: 8, cursor: 'pointer',
    background: '#3A5D3E', color: '#fff', border: 'none'
  }
};

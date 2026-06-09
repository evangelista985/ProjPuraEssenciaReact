import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFrete } from '../hooks/useFrete';
import { useViaCep } from '../hooks/useViaCep';
import api from '../services/api';

export default function CheckoutEndereco() {
  const { itens } = useCart();
  const nav = useNavigate();

  // Dados do cliente buscados direto da API
  const [clienteDB, setClienteDB] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [opcao, setOpcao]           = useState('');
  const [cep, setCep]               = useState('');
  const [endereco, setEndereco]     = useState('');
  const [numero, setNumero]         = useState('');
  const [bairro, setBairro]         = useState('');
  const [cidade, setCidade]         = useState('');
  const [estado, setEstado]         = useState('');
  const [complemento, setComplemento] = useState('');
  const [salvando, setSalvando]     = useState(false);
  const [erro, setErro]             = useState('');

  const { buscarCep, buscandoCep, erroCep, formatarCep } = useViaCep();
  const { fretes, freteSelecionado, calculando, erroFrete, calcularFrete, selecionarFrete } = useFrete();

  // Busca dados atualizados do cliente no banco
  useEffect(() => {
    api.get('/clientes/me')
      .then(r => setClienteDB(r.data))
      .catch(() => setClienteDB(null))
      .finally(() => setCarregando(false));
  }, []);

  // Calcula frete automaticamente ao selecionar opção cadastro
  useEffect(() => {
    if (opcao === 'cadastro' && clienteDB?.cep) {
      calcularFrete(clienteDB.cep, itens);
    }
  }, [opcao, clienteDB]);

  async function handleBuscarCep(cepVal) {
    await buscarCep(cepVal, (dados) => {
      setEndereco(dados.logradouro || '');
      setBairro(dados.bairro || '');
      setCidade(dados.cidade || '');
      setEstado(dados.estado || '');
      calcularFrete(cepVal, itens);
    });
  }

  function handleCepChange(e) {
    const val = formatarCep(e.target.value);
    setCep(val);
    if (val.replace('-', '').length === 8) handleBuscarCep(val);
  }

  function selecionarOpcao(op) {
    setOpcao(op);
    setErro('');
    if (op !== 'cadastro') {
      setCep(''); setEndereco(''); setNumero('');
      setBairro(''); setCidade(''); setEstado(''); setComplemento('');
    }
  }

  async function salvarEnderecoCadastro() {
    setSalvando(true);
    try {
      await api.put('/clientes/endereco', { cep, endereco, numero, bairro, cidade, estado });
      setSalvando(false);
      return true;
    } catch {
      setErro('Erro ao salvar endereço.');
      setSalvando(false);
      return false;
    }
  }

  async function prosseguir() {
    if (!opcao) { setErro('Selecione uma opção de entrega.'); return; }
    if (!freteSelecionado) { setErro('Selecione uma opção de frete.'); return; }

    let enderecoFinal = {};

    if (opcao === 'cadastro') {
      enderecoFinal = {
        cep:         clienteDB.cep        || '',
        endereco:    clienteDB.endereco   || '',
        numero:      clienteDB.numero     || '',
        bairro:      clienteDB.bairro     || '',
        cidade:      clienteDB.cidade     || '',
        estado:      clienteDB.estado     || '',
        complemento: clienteDB.complemento || '',
      };
    } else {
      if (!cep || !endereco || !numero || !bairro || !cidade || !estado) {
        setErro('Preencha todos os campos obrigatórios.'); return;
      }
      enderecoFinal = { cep, endereco, numero, bairro, cidade, estado, complemento };
      if (opcao === 'atualizar') {
        const ok = await salvarEnderecoCadastro();
        if (!ok) return;
      }
    }

    nav('/checkout/pagamento', {
      state: { enderecoFinal, frete: freteSelecionado }
    });
  }

  const temEndereco = clienteDB?.endereco && clienteDB?.cidade;

  const formEndereco = (
    <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}
      onClick={e => e.stopPropagation()}>
      <div className="form-row-2">
        <div style={{ gridColumn: '1/-1' }}>
          <label style={st.label}>CEP *</label>
          <input style={st.input} placeholder="00000-000" value={cep}
            onChange={handleCepChange} maxLength={9} />
          {erroCep && <p style={st.erro}>{erroCep}</p>}
          {buscandoCep && <p style={st.hint}>Buscando CEP...</p>}
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={st.label}>Rua / Endereço *</label>
          <input style={st.input} value={endereco}
            onChange={e => setEndereco(e.target.value)} placeholder="Rua, Avenida..." />
        </div>
        <div>
          <label style={st.label}>Número *</label>
          <input style={st.input} value={numero}
            onChange={e => setNumero(e.target.value)} placeholder="Número" />
        </div>
        <div>
          <label style={st.label}>Complemento</label>
          <input style={st.input} value={complemento}
            onChange={e => setComplemento(e.target.value)} placeholder="Apto, bloco..." />
        </div>
        <div>
          <label style={st.label}>Bairro *</label>
          <input style={st.input} value={bairro}
            onChange={e => setBairro(e.target.value)} placeholder="Bairro" />
        </div>
        <div>
          <label style={st.label}>Cidade *</label>
          <input style={st.input} value={cidade}
            onChange={e => setCidade(e.target.value)} placeholder="Cidade" />
        </div>
        <div>
          <label style={st.label}>Estado *</label>
          <input style={st.input} value={estado}
            onChange={e => setEstado(e.target.value)} placeholder="SP" maxLength={2} />
        </div>
      </div>
    </div>
  );

  if (carregando) return (
    <div className="container" style={{ padding: 60, textAlign: 'center' }}>
      <p>Carregando...</p>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 'clamp(84px,12vw,100px)', paddingBottom: 40, paddingLeft: 'clamp(12px,4vw,20px)', paddingRight: 'clamp(12px,4vw,20px)', maxWidth: 640, margin: '0 auto' }}>

      {/* Stepper */}
      <div style={{ ...st.stepper, position: 'relative', zIndex: 1 }}>
        <span style={st.stepDone} onClick={() => nav('/carrinho')}>✓ Carrinho</span>
        <div style={st.stepLine} />
        <span style={st.stepActive}>📦 Entrega</span>
        <div style={st.stepLine} />
        <span style={st.stepNext}>💳 Pagamento</span>
      </div>

      <button onClick={() => nav('/carrinho')} style={st.btnVoltar}>← Voltar ao carrinho</button>

      <h1 style={{ marginTop: 16, marginBottom: 6, fontSize: 26 }}>Para onde vamos entregar?</h1>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Escolha uma das opções abaixo</p>

      {/* Opção 1 — Endereço cadastrado */}
      <div style={{ ...st.card, borderColor: opcao === 'cadastro' ? '#3A5D3E' : '#e0e0e0', borderWidth: opcao === 'cadastro' ? 2 : 1 }}
        onClick={() => selecionarOpcao('cadastro')}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <input type="radio" checked={opcao === 'cadastro'} onChange={() => selecionarOpcao('cadastro')}
            style={{ marginTop: 3, accentColor: '#3A5D3E', width: 18, height: 18, cursor: 'pointer' }} />
          <div style={{ flex: 1 }}>
            <p style={st.opcaoTitulo}>Entregar no meu endereço</p>
            {temEndereco ? (
              <>
                <p style={{ color: '#3A5D3E', fontWeight: 600, fontSize: 14, marginTop: 4 }}>
                  📍 {clienteDB.endereco}, Nº {clienteDB.numero || 'S/N'}
                </p>
                <p style={{ color: '#555', fontSize: 13 }}>
                  {clienteDB.bairro} — {clienteDB.cidade}/{clienteDB.estado}
                </p>
                <p style={{ color: '#888', fontSize: 12 }}>CEP: {clienteDB.cep}</p>
              </>
            ) : (
              <p style={{ color: '#e67e22', fontSize: 13, marginTop: 4 }}>Nenhum endereço cadastrado</p>
            )}
            <span style={st.badge}>Meu endereço padrão</span>
          </div>
        </div>
      </div>

      {/* Opção 2 — Endereço temporário */}
      <div style={{ ...st.card, borderColor: opcao === 'temporario' ? '#3A5D3E' : '#e0e0e0', borderWidth: opcao === 'temporario' ? 2 : 1 }}
        onClick={() => selecionarOpcao('temporario')}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <input type="radio" checked={opcao === 'temporario'} onChange={() => selecionarOpcao('temporario')}
            style={{ marginTop: 3, accentColor: '#3A5D3E', width: 18, height: 18, cursor: 'pointer' }} />
          <div style={{ flex: 1 }}>
            <p style={st.opcaoTitulo}>Entregar em outro endereço</p>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
              Apenas para este pedido — seu cadastro não será alterado
            </p>
            <span style={{ ...st.badge, background: '#eef2ff', color: '#4c6ef5' }}>Endereço temporário</span>
          </div>
        </div>
        {opcao === 'temporario' && formEndereco}
      </div>

      {/* Opção 3 — Atualizar cadastro */}
      <div style={{ ...st.card, borderColor: opcao === 'atualizar' ? '#3A5D3E' : '#e0e0e0', borderWidth: opcao === 'atualizar' ? 2 : 1 }}
        onClick={() => selecionarOpcao('atualizar')}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <input type="radio" checked={opcao === 'atualizar'} onChange={() => selecionarOpcao('atualizar')}
            style={{ marginTop: 3, accentColor: '#3A5D3E', width: 18, height: 18, cursor: 'pointer' }} />
          <div style={{ flex: 1 }}>
            <p style={st.opcaoTitulo}>Atualizar meu endereço padrão</p>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
              Informe um novo endereço e salve no seu cadastro
            </p>
          </div>
        </div>
        {opcao === 'atualizar' && formEndereco}
      </div>

      {/* Frete */}
      {calculando && (
        <p style={st.hint}>⏳ Calculando frete...</p>
      )}
      {erroFrete && <p style={st.erro}>{erroFrete}</p>}

      {fretes.filter(f => !f.erro && f.valor > 0).length > 0 && (
        <div style={{ ...st.card, borderColor: '#e0e0e0', marginTop: 0 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Escolha o frete</p>
          {fretes.filter(f => !f.erro && f.valor > 0).map(f => (
            <div key={f.codigo} onClick={() => selecionarFrete(f)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                border: freteSelecionado?.codigo === f.codigo ? '2px solid #3A5D3E' : '1px solid #e0e0e0',
                background: freteSelecionado?.codigo === f.codigo ? '#f0f7f0' : '#fff',
              }}>
              <span style={{ fontWeight: 600 }}>{f.icone} {f.nome}</span>
              <span style={{ fontWeight: 700, color: '#3A5D3E' }}>
                R$ {f.valor.toFixed(2).replace('.', ',')}
              </span>
              <span style={{ fontSize: 12, color: '#888' }}>{f.prazo} dias úteis</span>
            </div>
          ))}
        </div>
      )}

      {erro && <p style={{ ...st.erro, marginBottom: 12 }}>{erro}</p>}

      <button className="btn-verde"
        style={{ width: '100%', fontSize: 16, padding: '14px 0', marginTop: 8 }}
        onClick={prosseguir} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Prosseguir para pagamento →'}
      </button>
    </div>
  );
}

const st = {
  stepper:    { display: 'flex', alignItems: 'center', marginBottom: 16 },
  stepDone:   { fontSize: 13, color: '#3A5D3E', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' },
  stepActive: { fontSize: 13, color: '#3A5D3E', fontWeight: 700, background: '#e8f5e9', padding: '4px 10px', borderRadius: 20 },
  stepNext:   { fontSize: 13, color: '#aaa' },
  stepLine:   { flex: 1, height: 1, background: '#ddd', margin: '0 8px' },
  btnVoltar:  { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' },
  card:       { borderStyle: 'solid', borderRadius: 12, padding: '16px 18px', marginBottom: 12, cursor: 'pointer', background: '#fff', transition: 'all 0.2s' },
  opcaoTitulo:{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' },
  badge:      { display: 'inline-block', background: '#e8f5e9', color: '#3A5D3E', fontSize: 11, padding: '3px 10px', borderRadius: 20, marginTop: 8 },
  label:      { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5, color: '#444' },
  input:      { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  hint:       { fontSize: 12, color: '#888', margin: '8px 0' },
  erro:       { color: '#dc3545', fontSize: 13 },
};

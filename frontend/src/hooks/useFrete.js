import { useState } from 'react';
import api from '../services/api';

export function useFrete() {
  const [fretes,         setFretes]         = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [calculando,     setCalculando]     = useState(false);
  const [erroFrete,      setErroFrete]      = useState('');

  // peso em kg estimado baseado nos itens do carrinho
  function estimarPeso(itens) {
    // Média de 0.1kg por item de ervas/orgânicos
    const total = itens.reduce((acc, i) => acc + i.quantidade * 0.1, 0);
    return Math.max(total, 0.3).toFixed(2); // mínimo 300g
  }

  async function calcularFrete(cepDestino, itens) {
    const cepLimpo = cepDestino.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setCalculando(true);
    setErroFrete('');
    setFretes([]);
    setFreteSelecionado(null);

    try {
      const { data } = await api.post('/frete/calcular', {
        cep_destino: cepLimpo,
        peso:        estimarPeso(itens),
        comprimento: '20',
        altura:      '10',
        largura:     '15',
        diametro:    '0',
      });

      const disponiveis = data.resultados.filter(f => !f.erro && f.valor > 0);
      const indisponiveis = data.resultados.filter(f => f.erro || f.valor <= 0);

      setFretes(data.resultados);

      if (disponiveis.length === 0) {
        setErroFrete('Nenhuma opção de frete disponível para este CEP.');
      }
    } catch (err) {
      setErroFrete(
        err.response?.data?.erro ||
        'Não foi possível calcular o frete. Tente novamente em alguns instantes.'
      );
    } finally {
      setCalculando(false);
    }
  }

  function selecionarFrete(frete) {
    setFreteSelecionado(frete);
  }

  function limparFrete() {
    setFretes([]);
    setFreteSelecionado(null);
    setErroFrete('');
  }

  return {
    fretes,
    freteSelecionado,
    calculando,
    erroFrete,
    calcularFrete,
    selecionarFrete,
    limparFrete,
  };
}

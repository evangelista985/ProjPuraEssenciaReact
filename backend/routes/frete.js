const express = require('express');
const router  = express.Router();

/**
 * TABELA DE FRETE POR REGIÃO (Simulada para projeto estudantil)
 * Baseada na primeira letra do CEP ou UF
 */
const TABELA_FRETE = {
  'SP': { capital: 12.90, interior: 18.50, prazo_capital: 2, prazo_interior: 4 },
  'RJ': { capital: 19.90, interior: 25.00, prazo_capital: 3, prazo_interior: 5 },
  'MG': { capital: 19.90, interior: 26.00, prazo_capital: 3, prazo_interior: 6 },
  'ES': { capital: 21.00, interior: 28.00, prazo_capital: 3, prazo_interior: 6 },
  'SUL': { capital: 25.00, interior: 32.00, prazo_capital: 5, prazo_interior: 8 },
  'CENTRO-OESTE': { capital: 28.00, interior: 35.00, prazo_capital: 5, prazo_interior: 9 },
  'NORDESTE': { capital: 35.00, interior: 45.00, prazo_capital: 7, prazo_interior: 12 },
  'NORTE': { capital: 42.00, interior: 55.00, prazo_capital: 10, prazo_interior: 15 },
};

// Mapeamento de UF para Região da Tabela
const UF_PARA_REGIAO = {
  'SP': 'SP', 'RJ': 'RJ', 'MG': 'MG', 'ES': 'ES',
  'PR': 'SUL', 'SC': 'SUL', 'RS': 'SUL',
  'DF': 'CENTRO-OESTE', 'GO': 'CENTRO-OESTE', 'MT': 'CENTRO-OESTE', 'MS': 'CENTRO-OESTE',
  'BA': 'NORDESTE', 'SE': 'NORDESTE', 'AL': 'NORDESTE', 'PE': 'NORDESTE', 'PB': 'NORDESTE', 'RN': 'NORDESTE', 'CE': 'NORDESTE', 'PI': 'NORDESTE', 'MA': 'NORDESTE',
  'AM': 'NORTE', 'PA': 'NORTE', 'AC': 'NORTE', 'RO': 'NORTE', 'RR': 'NORTE', 'AP': 'NORTE', 'TO': 'NORTE'
};

// POST /api/frete/calcular
router.post('/calcular', async (req, res) => {
  const { cep_destino, peso, itens } = req.body;

  const cepLimpo = cep_destino?.replace(/\D/g, '');
  if (!cepLimpo || cepLimpo.length !== 8) {
    return res.status(400).json({ erro: 'CEP de destino inválido' });
  }

  try {
    // Identificar o estado pela faixa de CEP (Lógica simplificada)
    // Para um projeto estudantil, podemos usar o primeiro dígito ou buscar na ViaCEP
    // Aqui vamos usar uma busca rápida na ViaCEP apenas para pegar a UF
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.status(400).json({ erro: 'CEP não encontrado para cálculo de frete.' });
    }

    const uf = data.uf;
    const regiaoKey = UF_PARA_REGIAO[uf] || 'SP';
    const config = TABELA_FRETE[regiaoKey];

    // Simulação de Capital vs Interior (simplificada: se termina em 000 é capital)
    const isCapital = cepLimpo.endsWith('000') || uf === 'DF';
    
    const valorBase = isCapital ? config.capital : config.interior;
    const prazoBase = isCapital ? config.prazo_capital : config.prazo_interior;

    // Adicional por peso (R$ 2,00 por kg acima de 1kg)
    const pesoNum = parseFloat(peso) || 0.5;
    const adicionalPeso = pesoNum > 1 ? (pesoNum - 1) * 2 : 0;

    const resultados = [
      {
        codigo: '04510',
        nome: 'PAC (Econômico)',
        icone: '📦',
        valor: parseFloat((valorBase + adicionalPeso).toFixed(2)),
        prazo: prazoBase + 3,
        erro: null
      },
      {
        codigo: '04014',
        nome: 'SEDEX (Expresso)',
        icone: '🚀',
        valor: parseFloat(((valorBase + adicionalPeso) * 1.8).toFixed(2)),
        prazo: Math.max(1, prazoBase - 1),
        erro: null
      }
    ];

    res.json({ resultados });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao calcular frete. Tente novamente.' });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const https   = require('https');

// CEP de origem da loja Pura Essência (Vila Leopoldina - SP)
const CEP_ORIGEM = '05089001';

// Códigos dos serviços Correios
// 04510 = PAC  |  04014 = SEDEX  |  04782 = SEDEX 12
const SERVICOS = [
  { codigo: '04510', nome: 'PAC',      icone: '📦' },
  { codigo: '04014', nome: 'SEDEX',    icone: '🚀' },
  { codigo: '04782', nome: 'SEDEX 12', icone: '⚡' },
];

// POST /api/correios/frete
router.post('/frete', async (req, res) => {
  const { cep_destino, peso, comprimento, altura, largura, diametro } = req.body;

  const cepLimpo = cep_destino?.replace(/\D/g, '');
  if (!cepLimpo || cepLimpo.length !== 8) {
    return res.status(400).json({ erro: 'CEP de destino inválido' });
  }

  // Dimensões padrão para pacote pequeno de ervas/orgânicos
  const params = new URLSearchParams({
    nCdEmpresa:          '',
    sDsSenha:            '',
    sCepOrigem:          CEP_ORIGEM,
    sCepDestino:         cepLimpo,
    nVlPeso:             peso        || '0.5',
    nCdFormato:          '1',          // 1 = caixa/pacote
    nVlComprimento:      comprimento || '20',
    nVlAltura:           altura      || '10',
    nVlLargura:          largura     || '15',
    nVlDiametro:         diametro    || '0',
    sCdMaoPropria:       'N',
    nVlValorDeclarado:   '0',
    sCdAvisoRecebimento: 'N',
    nCdServico:          SERVICOS.map(s => s.codigo).join(','),
    nVlDiametro:         '0',
    StrRetorno:          'xml',
    nIndicaCalculo:      '3',
  });

  const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params.toString()}`;

  try {
    const xmlData = await fetchUrl(url);
    const resultados = parsearXML(xmlData);
    res.json({ resultados });
  } catch (err) {
    res.status(500).json({ erro: 'Serviço dos Correios indisponível no momento. Tente novamente.' });
  }
});

// ─── helpers ──────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    lib.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parsearXML(xml) {
  const resultados = [];

  // Extrai cada bloco <cServico>
  const blocos = xml.match(/<cServico>([\s\S]*?)<\/cServico>/g) || [];

  blocos.forEach(bloco => {
    const get = (tag) => {
      const match = bloco.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`));
      return match ? match[1].trim() : '';
    };

    const codigo = get('Codigo');
    const servico = SERVICOS.find(s => s.codigo === codigo);
    const erro    = get('Erro');
    const msgErro = get('MsgErro');

    if (erro !== '0' && erro !== '') {
      resultados.push({
        codigo,
        nome:   servico?.nome   || codigo,
        icone:  servico?.icone  || '📦',
        erro:   msgErro || `Serviço indisponível (erro ${erro})`,
      });
      return;
    }

    const valorStr = get('Valor').replace(',', '.');
    const prazo    = parseInt(get('PrazoEntrega')) || 0;

    resultados.push({
      codigo,
      nome:   servico?.nome  || codigo,
      icone:  servico?.icone || '📦',
      valor:  parseFloat(valorStr) || 0,
      prazo,
      erro:   null,
    });
  });

  return resultados;
}

module.exports = router;

const express = require('express');
const router  = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { authCliente } = require('../middleware/auth');

// Configuração do Mercado Pago (Usando Access Token de Teste por padrão)
// Em produção, isso deve vir do .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-8314352125213214-050514-6ca73c7857e28509a0c03a972c81d2bd0' 
});

// POST /api/pagamentos/criar-preferencia
router.post('/criar-preferencia', authCliente, async (req, res) => {
  const { itens, frete, pedido_id } = req.body;

  try {
    const preference = new Preference(client);

    const body = {
      items: itens.map(item => ({
        id: item.produto_id.toString(),
        title: item.nome || 'Produto Pura Essência',
        quantity: Number(item.quantidade),
        unit_price: Number(item.preco),
        currency_id: 'BRL'
      })),
      // Adiciona o frete como um item separado para garantir que o valor seja somado corretamente
      ...(frete && {
        shipments: {
          cost: Number(frete.valor),
          mode: 'not_specified'
        }
      }),
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/meus-pedidos?status=success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrinho?status=failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/meus-pedidos?status=pending`,
      },
      auto_return: 'approved',
      external_reference: pedido_id.toString(),
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/pagamentos/webhook`,
    };

    const response = await preference.create({ body });
    
    if (!response.id) {
      throw new Error('Mercado Pago não retornou um ID de preferência válido.');
    }

    res.json({ id: response.id, init_point: response.init_point });
  } catch (error) {
    console.error('Erro detalhado MP:', error.message || error);
    // Retorna o erro específico se disponível para ajudar no debug
    const msgErro = error.cause?.[0]?.description || 'Erro ao processar pagamento com Mercado Pago';
    res.status(500).json({ erro: msgErro });
  }
});

// POST /api/pagamentos/webhook (Para receber notificações de pagamento)
router.post('/webhook', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;

  console.log('Webhook recebido:', topic, query.id);

  // Aqui você implementaria a lógica para atualizar o status do pedido no banco de dados
  // Exemplo: se topic === 'payment', buscar o pagamento via SDK e atualizar o pedido correspondente

  res.sendStatus(200);
});

module.exports = router;

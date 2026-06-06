const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authCliente, authAdmin } = require('../middleware/auth');
const { enviarEmailConfirmacaoPedido } = require('../config/email');

// POST /api/pedidos
router.post('/', authCliente, async (req, res) => {
  const { itens, forma_pagamento, cupom_codigo, frete, endereco_entrega: endEntrega } = req.body;
  if (!itens || itens.length === 0) return res.status(400).json({ erro: 'Carrinho vazio' });
  if (!forma_pagamento) return res.status(400).json({ erro: 'Forma de pagamento obrigatória' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0, desconto = 0, cupom_id = null;

    if (cupom_codigo) {
      const [cupons] = await conn.query(
        'SELECT * FROM cupons WHERE codigo = ? AND ativo = 1 AND (validade IS NULL OR validade >= CURDATE())',
        [cupom_codigo]
      );
      if (cupons.length > 0) { cupom_id = cupons[0].id; desconto = cupons[0].desconto_percent; }
    }

    for (const item of itens) {
      const [produto] = await conn.query('SELECT preco FROM produtos WHERE id = ? AND ativo = 1', [item.produto_id]);
      if (produto.length === 0) throw new Error(`Produto ${item.produto_id} não encontrado`);
      const [est] = await conn.query('SELECT quantidade FROM estoque WHERE produto_id = ?', [item.produto_id]);
      if (est.length === 0 || est[0].quantidade < item.quantidade)
        throw new Error('Estoque insuficiente para um dos produtos');
      total += produto[0].preco * item.quantidade;
    }

    const valorDesconto = (total * desconto) / 100;
    const frete_valor   = frete?.valor  || 0;
    const frete_servico = frete?.nome   || null;
    const frete_prazo   = frete?.prazo  || null;
    const total_final   = total - valorDesconto + frete_valor;

    // ── Endereço de entrega — usando nomes do banco real ──
    const e = endEntrega || {};
    const cep_entrega         = e.cep          || null;
    const endereco_entrega = e.endereco || null;
    const numero_entrega      = e.numero        || null;
    const complemento_entrega = e.complemento   || null;
    const bairro_entrega      = e.bairro        || null;
    const cidade_entrega      = e.cidade        || null;
    const estado_entrega      = e.estado        || null;

    const [pedido] = await conn.query(
      `INSERT INTO pedidos
        (cliente_id, total, desconto, total_final, forma_pagamento, cupom_id, status,
         frete_valor, frete_servico, frete_prazo,
         cep_entrega, endereco_entrega, numero_entrega, complemento_entrega,
         bairro_entrega, cidade_entrega, estado_entrega)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [req.cliente.id, total, valorDesconto, total_final, forma_pagamento, cupom_id, 'pago',
       frete_valor, frete_servico, frete_prazo,
       cep_entrega, endereco_entrega, numero_entrega, complemento_entrega,
       bairro_entrega, cidade_entrega, estado_entrega]
    );

    const pedido_id = pedido.insertId;
    const itensSalvos = [];

    for (const item of itens) {
      const [produto] = await conn.query('SELECT preco, nome FROM produtos WHERE id = ?', [item.produto_id]);
      await conn.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unit) VALUES (?,?,?,?)',
        [pedido_id, item.produto_id, item.quantidade, produto[0].preco]
      );
      await conn.query(
        'UPDATE estoque SET quantidade = quantidade - ? WHERE produto_id = ?',
        [item.quantidade, item.produto_id]
      );
      itensSalvos.push({ nome: produto[0].nome, quantidade: item.quantidade, preco_unit: produto[0].preco });
    }

    await conn.commit();

    const [clienteRows] = await db.query('SELECT id, nome, email FROM clientes WHERE id = ?', [req.cliente.id]);

    enviarEmailConfirmacaoPedido({
      cliente: clienteRows[0],
      pedido: {
        id: pedido_id, status: 'pago', forma_pagamento,
        total, desconto: valorDesconto, frete_valor, frete_servico, frete_prazo, total_final,
        endereco_entrega, numero_entrega, bairro_entrega, cidade_entrega, estado_entrega, cep_entrega,
      },
      itens: itensSalvos,
    });

    res.status(201).json({ mensagem: 'Pedido realizado!', pedido_id, total_final });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ erro: err.message || 'Erro ao criar pedido' });
  } finally {
    conn.release();
  }
});

// GET /api/pedidos/meus
router.get('/meus', authCliente, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.*,
        GROUP_CONCAT(CONCAT(pr.nome,' x',pi.quantidade) SEPARATOR ' | ') AS itens_desc
       FROM pedidos p
       LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
       LEFT JOIN produtos pr    ON pr.id = pi.produto_id
       WHERE p.cliente_id = ?
       GROUP BY p.id ORDER BY p.criado_em DESC`,
      [req.cliente.id]
    );
    res.json(pedidos);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
});

// GET /api/pedidos (admin)
router.get('/', authAdmin, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.*, cl.nome AS cliente_nome, cl.email AS cliente_email
       FROM pedidos p
       JOIN clientes cl ON cl.id = p.cliente_id
       ORDER BY p.criado_em DESC`
    );
    res.json(pedidos);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
});

// GET /api/pedidos/:id (admin)
router.get('/:id', authAdmin, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.*, cl.nome AS cliente_nome, cl.email AS cliente_email
       FROM pedidos p JOIN clientes cl ON cl.id = p.cliente_id
       WHERE p.id = ?`, [req.params.id]
    );
    if (pedidos.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado' });
    const [itens] = await db.query(
      `SELECT pi.*, pr.nome AS produto_nome, pr.imagem FROM pedido_itens pi
       JOIN produtos pr ON pr.id = pi.produto_id WHERE pi.pedido_id = ?`, [req.params.id]
    );
    res.json({ ...pedidos[0], itens });
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
});

// PUT /api/pedidos/:id/status
router.put('/:id/status', authAdmin, async (req, res) => {
  const { status } = req.body;
  const permitidos = ['pendente','pago','enviado','entregue','cancelado','finalizado'];
  if (req.admin.nivel === 'vendedor' && status !== 'finalizado')
    return res.status(403).json({ erro: 'Vendedor só pode finalizar pedidos' });
  if (!permitidos.includes(status)) return res.status(400).json({ erro: 'Status inválido' });
  try {
    await db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ mensagem: 'Status atualizado!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

// PUT /api/pedidos/:id/rastreio
router.put('/:id/rastreio', authAdmin, async (req, res) => {
  const { statusRastreio } = req.body;
  const statusMap = { 0: 'pago', 1: 'enviado', 2: 'entregue' };
  const status = statusMap[statusRastreio];
  if (status === undefined) return res.status(400).json({ erro: 'Status inválido' });
  try {
    await db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ mensagem: 'Rastreio atualizado!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao atualizar rastreio' });
  }
});

module.exports = router;

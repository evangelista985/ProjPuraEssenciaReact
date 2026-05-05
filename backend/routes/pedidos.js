const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authCliente, authAdmin } = require('../middleware/auth');

// POST /api/pedidos - cliente faz pedido
router.post('/', authCliente, async (req, res) => {
  const { itens, forma_pagamento, cupom_codigo, endereco } = req.body;
  if (!itens || itens.length === 0) return res.status(400).json({ erro: 'Carrinho vazio' });
  if (!forma_pagamento) return res.status(400).json({ erro: 'Forma de pagamento obrigatória' });
  if (!endereco?.cep) return res.status(400).json({ erro: 'Endereço de entrega obrigatório' });

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
    const total_final   = total - valorDesconto;

    const [pedido] = await conn.query(
      `INSERT INTO pedidos
        (cliente_id, total, desconto, total_final, forma_pagamento, cupom_id,
         cep_entrega, logradouro_entrega, numero_entrega, complemento_entrega, bairro_entrega, cidade_entrega, estado_entrega)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [req.cliente.id, total, valorDesconto, total_final, forma_pagamento, cupom_id,
       endereco.cep, endereco.logradouro, endereco.numero,
       endereco.complemento || null, endereco.bairro, endereco.cidade, endereco.estado]
    );

    for (const item of itens) {
      const [produto] = await conn.query('SELECT preco FROM produtos WHERE id = ?', [item.produto_id]);
      await conn.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unit) VALUES (?,?,?,?)',
        [pedido.insertId, item.produto_id, item.quantidade, produto[0].preco]
      );
      await conn.query(
        'UPDATE estoque SET quantidade = quantidade - ? WHERE produto_id = ?',
        [item.quantidade, item.produto_id]
      );
    }

    await conn.commit();
    res.status(201).json({ mensagem: 'Pedido realizado!', pedido_id: pedido.insertId, total_final });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ erro: err.message || 'Erro ao criar pedido' });
  } finally {
    conn.release();
  }
});

// GET /api/pedidos/meus - pedidos do cliente logado
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

// GET /api/pedidos - todos os pedidos (admin)
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

// GET /api/pedidos/:id - detalhe (admin)
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

module.exports = router;

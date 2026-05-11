const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authAdmin, nivelMinimo } = require('../middleware/auth');

// GET /api/produtos - listar com filtros (público)
router.get('/', async (req, res) => {
  const { nome, categoria_id } = req.query;
  let sql = `
    SELECT p.*, c.nome AS categoria_nome, COALESCE(e.quantidade, 0) AS quantidade
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN estoque    e ON e.produto_id = p.id
    WHERE p.ativo = 1
  `;
  const params = [];
  if (nome)         { sql += ' AND p.nome LIKE ?';      params.push(`%${nome}%`); }
  if (categoria_id) { sql += ' AND p.categoria_id = ?'; params.push(categoria_id); }
  sql += ' ORDER BY c.id, p.id';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// GET /api/produtos/categorias (público)
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY id');
    res.json(rows);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

// GET /api/produtos/:id - detalhe (público)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nome AS categoria_nome, COALESCE(e.quantidade, 0) AS quantidade
       FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       LEFT JOIN estoque    e ON e.produto_id = p.id
       WHERE p.id = ? AND p.ativo = 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

// POST /api/produtos - criar (admin)
router.post('/', authAdmin, async (req, res) => {
  const { nome, descricao, preco, imagem, categoria_id, quantidade } = req.body;
  if (!nome || !preco) return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  try {
    const [result] = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, imagem, categoria_id) VALUES (?, ?, ?, ?, ?)',
      [nome, descricao || '', preco, imagem || '', categoria_id || null]
    );
    await db.query(
      'INSERT INTO estoque (produto_id, quantidade) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantidade = ?',
      [result.insertId, quantidade || 0, quantidade || 0]
    );
    res.status(201).json({ mensagem: 'Produto cadastrado!', id: result.insertId });
  } catch {
    res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  }
});

// PUT /api/produtos/:id - editar (admin)
router.put('/:id', authAdmin, async (req, res) => {
  const { nome, descricao, preco, imagem, categoria_id, ativo, quantidade } = req.body;
  try {
    await db.query(
      'UPDATE produtos SET nome=?, descricao=?, preco=?, imagem=?, categoria_id=?, ativo=? WHERE id=?',
      [nome, descricao, preco, imagem, categoria_id, ativo ?? 1, req.params.id]
    );
    if (quantidade !== undefined) {
      await db.query(
        'INSERT INTO estoque (produto_id, quantidade) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantidade = ?',
        [req.params.id, quantidade, quantidade]
      );
    }
    res.json({ mensagem: 'Produto atualizado!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// DELETE /api/produtos/:id - desativar (gerente+)
router.delete('/:id', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  try {
    await db.query('UPDATE produtos SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Produto removido!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao remover produto' });
  }
});

module.exports = router;

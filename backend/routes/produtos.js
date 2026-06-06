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
    WHERE p.ativo = true
  `;
  const params = [];
  if (nome)         { sql += ' AND p.nome ILIKE ?';      params.push(`%${nome}%`); }
  if (categoria_id) { sql += ' AND p.categoria_id = ?'; params.push(categoria_id); }
  sql += ' ORDER BY c.id, p.id';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar produtos', detalhe: err.message });
  }
});

// GET /api/produtos/categorias (público)
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar categorias', detalhe: err.message });
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
       WHERE p.id = ? AND p.ativo = true`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar produto:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar produto', detalhe: err.message });
  }
});

// POST /api/produtos - criar (admin)
router.post('/', authAdmin, async (req, res) => {
  const { nome, descricao, preco, imagem, categoria_id, quantidade } = req.body;
  if (!nome || !preco) return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  try {
    const [result] = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, imagem, categoria_id) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [nome, descricao || '', preco, imagem || '', categoria_id || null]
    );
    const newId = result[0].id;
    await db.query(
      'INSERT INTO estoque (produto_id, quantidade) VALUES (?, ?) ON CONFLICT (produto_id) DO UPDATE SET quantidade = EXCLUDED.quantidade',
      [newId, quantidade || 0]
    );
    res.status(201).json({ mensagem: 'Produto cadastrado!', id: newId });
  } catch (err) {
    console.error('Erro ao cadastrar produto:', err.message);
    res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhe: err.message });
  }
});

// PUT /api/produtos/:id - editar (admin)
router.put('/:id', authAdmin, async (req, res) => {
  const { nome, descricao, preco, imagem, categoria_id, ativo, quantidade } = req.body;
  try {
    await db.query(
      'UPDATE produtos SET nome=?, descricao=?, preco=?, imagem=?, categoria_id=?, ativo=? WHERE id=?',
      [nome, descricao, preco, imagem, categoria_id, ativo ?? true, req.params.id]
    );
    if (quantidade !== undefined) {
      await db.query(
        'INSERT INTO estoque (produto_id, quantidade) VALUES (?, ?) ON CONFLICT (produto_id) DO UPDATE SET quantidade = EXCLUDED.quantidade',
        [req.params.id, quantidade]
      );
    }
    res.json({ mensagem: 'Produto atualizado!' });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: err.message });
  }
});

// DELETE /api/produtos/:id - desativar (gerente+)
router.delete('/:id', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  try {
    await db.query('UPDATE produtos SET ativo = false WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Produto removido!' });
  } catch (err) {
    console.error('Erro ao remover produto:', err.message);
    res.status(500).json({ erro: 'Erro ao remover produto', detalhe: err.message });
  }
});

module.exports = router;
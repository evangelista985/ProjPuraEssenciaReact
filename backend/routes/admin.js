const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { authAdmin, nivelMinimo } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios' });
  try {
    const result = await db.query('SELECT * FROM admin_usuarios WHERE email = $1', [email]);
    const rows = result.rows;
    if (rows.length === 0) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const ok = await bcrypt.compare(senha, rows[0].senha);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const token = jwt.sign(
      { id: rows[0].id, nome: rows[0].nome, email: rows[0].email, nivel: rows[0].nivel, tipo: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
    res.json({ token, usuario: { id: rows[0].id, nome: rows[0].nome, nivel: rows[0].nivel } });
  } catch (err) {
    console.error('ERRO NO LOGIN ADMIN:', err);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

// ===== USUÁRIOS =====
router.get('/usuarios', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  const result = await db.query('SELECT id, nome, email, nivel, criado_em FROM admin_usuarios ORDER BY criado_em DESC');
  res.json(result.rows);
});

router.post('/usuarios', authAdmin, async (req, res) => {
  const { nome, email, senha, nivel } = req.body;
  const permitidos = { admin: ['admin','gerente','vendedor'], gerente: ['vendedor'], vendedor: [] };
  if (!permitidos[req.admin.nivel]?.includes(nivel))
    return res.status(403).json({ erro: 'Sem permissão para criar este nível' });
  try {
    const existeResult = await db.query('SELECT id FROM admin_usuarios WHERE email = $1', [email]);
    if (existeResult.rows.length > 0) return res.status(400).json({ erro: 'E-mail já cadastrado' });
    const hash = await bcrypt.hash(senha, 10);
    await db.query('INSERT INTO admin_usuarios (nome, email, senha, nivel) VALUES ($1,$2,$3,$4)', [nome, email, hash, nivel]);
    res.status(201).json({ mensagem: 'Usuário criado!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

router.delete('/usuarios/:id', authAdmin, nivelMinimo('admin'), async (req, res) => {
  await db.query('DELETE FROM admin_usuarios WHERE id = $1', [req.params.id]);
  res.json({ mensagem: 'Usuário removido!' });
});

// ===== CUPONS =====
router.get('/cupons', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  const result = await db.query(
    `SELECT * FROM cupons WHERE excluido = false OR excluido IS NULL ORDER BY criado_em DESC`
  );
  res.json(result.rows);
});

router.post('/cupons', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  const { codigo, desconto_percent, validade } = req.body;
  try {
    await db.query('INSERT INTO cupons (codigo, desconto_percent, validade) VALUES ($1,$2,$3)',
      [codigo, desconto_percent, validade || null]);
    res.status(201).json({ mensagem: 'Cupom criado!' });
  } catch {
    res.status(400).json({ erro: 'Erro ao criar cupom (código duplicado?)' });
  }
});

router.put('/cupons/:id', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  const { ativo } = req.body;
  await db.query('UPDATE cupons SET ativo = $1 WHERE id = $2', [ativo, req.params.id]);
  res.json({ mensagem: 'Cupom atualizado!' });
});

// PUT /api/admin/cupons/:id/excluir — soft delete (mantém histórico)
router.put('/cupons/:id/excluir', authAdmin, nivelMinimo('gerente'), async (req, res) => {
  try {
    await db.query('UPDATE cupons SET excluido = true WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Cupom excluído!' });
  } catch {
    res.status(400).json({ erro: 'Erro ao excluir cupom' });
  }
});

// ===== DASHBOARD =====
router.get('/dashboard', authAdmin, async (req, res) => {
  const { periodo } = req.query;
  const filtros = {
    dia:    `DATE(p.criado_em) = CURRENT_DATE`,
    semana: `DATE_TRUNC('week', p.criado_em) = DATE_TRUNC('week', CURRENT_DATE)`,
    mes:    `DATE_TRUNC('month', p.criado_em) = DATE_TRUNC('month', CURRENT_DATE)`,
    ano:    `DATE_TRUNC('year', p.criado_em) = DATE_TRUNC('year', CURRENT_DATE)`,
  };
  const w = filtros[periodo] || filtros['mes'];
  try {
    const totaisResult = await db.query(`
      SELECT COUNT(*) AS total_pedidos,
        COALESCE(SUM(p.total_final),0) AS receita_total,
        COALESCE(AVG(p.total_final),0) AS ticket_medio
      FROM pedidos p WHERE ${w} AND p.status != 'cancelado'
    `);
    const totais = totaisResult.rows[0];

    const porStatusResult = await db.query(`
      SELECT p.status, COUNT(*) AS qtd FROM pedidos p WHERE ${w} GROUP BY p.status
    `);

    const topProdutosResult = await db.query(`
      SELECT pr.nome, SUM(pi.quantidade) AS total_vendido, SUM(pi.quantidade*pi.preco_unit) AS receita
      FROM pedido_itens pi
      JOIN pedidos  p  ON p.id  = pi.pedido_id
      JOIN produtos pr ON pr.id = pi.produto_id
      WHERE ${w} AND p.status != 'cancelado'
      GROUP BY pr.id, pr.nome ORDER BY total_vendido DESC LIMIT 5
    `);

    const vendasDiaResult = await db.query(`
      SELECT DATE(p.criado_em) AS dia, COUNT(*) AS pedidos, COALESCE(SUM(p.total_final),0) AS receita
      FROM pedidos p
      WHERE p.criado_em >= CURRENT_DATE - INTERVAL '7 days' AND p.status != 'cancelado'
      GROUP BY DATE(p.criado_em) ORDER BY dia
    `);

    res.json({
      totais,
      porStatus: porStatusResult.rows,
      topProdutos: topProdutosResult.rows,
      vendasDia: vendasDiaResult.rows,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao carregar dashboard' });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

// POST /api/clientes/cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  try {
    const [existe] = await db.query('SELECT id FROM clientes WHERE email = ?', [email]);
    if (existe.length > 0) return res.status(400).json({ erro: 'E-mail já cadastrado' });
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
      'INSERT INTO clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
      [nome, email, hash, telefone || null]
    );
    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

// POST /api/clientes/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  try {
    const [rows] = await db.query('SELECT * FROM clientes WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    const cliente = rows[0];
    const senhaOk = await bcrypt.compare(senha, cliente.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    const token = jwt.sign(
      { id: cliente.id, nome: cliente.nome, email: cliente.email, tipo: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
    res.json({ token, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } });
  } catch {
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

module.exports = router;

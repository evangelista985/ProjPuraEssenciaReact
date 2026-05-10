const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Armazena códigos em memória ────────────────────────────────────────────────
// { "email@x.com": { codigo: "123456", expira: timestamp } }
const codigosReset = new Map();

// ── POST /api/clientes/cadastro ────────────────────────────────────────────────
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

// ── POST /api/clientes/login ───────────────────────────────────────────────────
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

// ── POST /api/clientes/esqueci-senha ──────────────────────────────────────────
router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });

  try {
    // Verifica se o e-mail existe no banco
    const [rows] = await db.query('SELECT id, nome FROM clientes WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ erro: 'E-mail não encontrado' });

    const cliente = rows[0];

    // Gera código de 6 dígitos e define expiração de 15 minutos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = Date.now() + 15 * 60 * 1000;
    codigosReset.set(email, { codigo, expira });

    // Envia e-mail com o código
    await transporter.sendMail({
      from: `"Pura Essência 🌿" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código para redefinir sua senha — Pura Essência',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f7; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #3A5D3E; font-size: 24px; margin: 0;">🌿 Pura Essência</h1>
          </div>

          <p style="color: #444; font-size: 15px;">Olá, <strong>${cliente.nome}</strong>!</p>
          <p style="color: #444; font-size: 15px;">Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo:</p>

          <div style="background: #3A5D3E; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #fff; font-size: 13px; margin: 0 0 8px;">Seu código de verificação</p>
            <span style="color: #fff; font-size: 42px; font-weight: bold; letter-spacing: 10px;">${codigo}</span>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center;">⏱ Este código expira em <strong>15 minutos</strong>.</p>
          <p style="color: #888; font-size: 13px; text-align: center;">Se você não solicitou a redefinição, ignore este e-mail.</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="color: #bbb; font-size: 11px; text-align: center;">Pura Essência — Cosméticos Naturais 🌿</p>
        </div>
      `,
    });

    res.json({ mensagem: 'Código enviado para o seu e-mail!' });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    res.status(500).json({ erro: 'Erro ao enviar e-mail. Tente novamente.' });
  }
});

// ── POST /api/clientes/redefinir-senha ────────────────────────────────────────
router.post('/redefinir-senha', async (req, res) => {
  const { email, codigo, novaSenha } = req.body;
  if (!email || !codigo || !novaSenha) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  if (novaSenha.length < 6) return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres' });

  try {
    const entrada = codigosReset.get(email);

    if (!entrada) return res.status(400).json({ erro: 'Nenhum código solicitado para este e-mail' });

    if (Date.now() > entrada.expira) {
      codigosReset.delete(email);
      return res.status(400).json({ erro: 'Código expirado. Solicite um novo.' });
    }

    if (entrada.codigo !== codigo) return res.status(400).json({ erro: 'Código inválido' });

    // Atualiza a senha no banco
    const hash = await bcrypt.hash(novaSenha, 10);
    await db.query('UPDATE clientes SET senha = ? WHERE email = ?', [hash, email]);

    codigosReset.delete(email); // remove o código após uso

    res.json({ mensagem: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

module.exports = router;

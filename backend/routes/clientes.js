const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { enviarEmailConfirmacaoPedido } = require('../config/email');
const nodemailer = require('nodemailer');

// ── Transportador de e-mail (reutiliza config do .env) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Armazena códigos temporários em memória: { email: { codigo, expira } }
const codigosReset = {};

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

// POST /api/clientes/esqueci-senha
// Gera código de 6 dígitos e envia por e-mail
router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });

  try {
    const [rows] = await db.query('SELECT id, nome FROM clientes WHERE email = ?', [email]);
    // Retorna sucesso mesmo se não encontrar (segurança)
    if (rows.length === 0) {
      return res.json({ mensagem: 'Se este e-mail estiver cadastrado, você receberá o código em breve.' });
    }

    const cliente = rows[0];

    // Gera código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = Date.now() + 15 * 60 * 1000; // 15 minutos

    codigosReset[email] = { codigo, expira };

    // Envia e-mail com o código
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || 'Pura Essência <puraessenciaetec@gmail.com>',
      to:      email,
      subject: '🔑 Código para redefinir sua senha — Pura Essência',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f5f7f2;padding:32px;border-radius:12px">
          <div style="background:#3A5D3E;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
            <p style="margin:0;color:#D4AF37;font-size:22px;font-weight:700">🌿 PURA ESSÊNCIA</p>
          </div>
          <h2 style="color:#3A5D3E;margin-bottom:8px">Redefinição de senha</h2>
          <p style="color:#555;margin-bottom:24px">Olá, <strong>${cliente.nome}</strong>! Use o código abaixo para redefinir sua senha.</p>
          <div style="background:#fff;border:2px solid #3A5D3E;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">Seu código</p>
            <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:10px;color:#3A5D3E">${codigo}</p>
          </div>
          <p style="color:#888;font-size:13px;text-align:center">Este código expira em <strong>15 minutos</strong>.<br>Se não foi você, ignore este e-mail.</p>
        </div>
      `,
    });

    res.json({ mensagem: 'Código enviado para seu e-mail!' });
  } catch (err) {
  console.error('Erro ao enviar código:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  res.status(500).json({ erro: 'Erro ao enviar o código. Tente novamente.' });

  }
});

// POST /api/clientes/redefinir-senha
// Valida código e salva nova senha
router.post('/redefinir-senha', async (req, res) => {
  const { email, codigo, novaSenha } = req.body;
  if (!email || !codigo || !novaSenha) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });

  const registro = codigosReset[email];

  if (!registro) return res.status(400).json({ erro: 'Nenhum código solicitado para este e-mail' });
  if (Date.now() > registro.expira) {
    delete codigosReset[email];
    return res.status(400).json({ erro: 'Código expirado. Solicite um novo.' });
  }
  if (registro.codigo !== codigo) return res.status(400).json({ erro: 'Código inválido' });
  if (novaSenha.length < 6) return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres' });

  try {
    const hash = await bcrypt.hash(novaSenha, 10);
    await db.query('UPDATE clientes SET senha = ? WHERE email = ?', [hash, email]);
    delete codigosReset[email];
    res.json({ mensagem: 'Senha redefinida com sucesso!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao redefinir senha' });
  }
});

module.exports = router;

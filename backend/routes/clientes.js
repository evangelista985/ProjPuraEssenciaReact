const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { enviarEmailConfirmacaoPedido, enviarEmail } = require('../config/email');

const codigosReset = {};

// POST /api/clientes/cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, telefone, cep, endereco, numero, bairro, cidade, estado } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  try {
    const [existe] = await db.query('SELECT id FROM clientes WHERE email = ?', [email]);
    if (existe.length > 0) return res.status(400).json({ erro: 'E-mail já cadastrado' });
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
      'INSERT INTO clientes (nome, email, senha, telefone, cep, endereco, numero, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, email, hash, telefone || null, cep || null, endereco || null, numero || null, bairro || null, cidade || null, estado || null]
    );
    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', id: result.insertId });
  } catch (err) {
    console.error(err);
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
    res.json({
      token,
      cliente: {
        id:       cliente.id,
        nome:     cliente.nome,
        email:    cliente.email,
        cep:      cliente.cep      || '',
        endereco: cliente.endereco || '',
        numero:   cliente.numero   || '',
        bairro:   cliente.bairro   || '',
        cidade:   cliente.cidade   || '',
        estado:   cliente.estado   || ''
      }
    });
  } catch {
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

// POST /api/clientes/esqueci-senha
router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });
  try {
    const [rows] = await db.query('SELECT id, nome FROM clientes WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ mensagem: 'Se este e-mail estiver cadastrado, você receberá o código em breve.' });
    }
    const cliente = rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = Date.now() + 15 * 60 * 1000;
    codigosReset[email] = { codigo, expira };

    await enviarEmail({
      to:      email,
      nome:    cliente.nome,
      subject: '🔑 Código para redefinir sua senha — Pura Essência',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f5f7f2;padding:32px;border-radius:12px">
          <div style="background:#3A5D3E;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
            <img src="https://proj-pura-essencia-react.vercel.app/img/logo_escrito.png" alt="Pura Essência" width="200" style="max-width:200px;height:auto;display:block;margin:0 auto" />
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

// PUT /api/clientes/endereco — atualiza endereço padrão do cliente logado
router.put('/endereco', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const token   = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id      = decoded.id;
    const { cep, endereco, numero, bairro, cidade, estado } = req.body;
    if (!cep || !endereco || !numero || !bairro || !cidade || !estado) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }
    await db.query(
      `UPDATE clientes SET cep=?, endereco=?, numero=?, bairro=?, cidade=?, estado=? WHERE id=?`,
      [cep, endereco, numero, bairro, cidade, estado, id]
    );
    res.json({ mensagem: 'Endereço atualizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar endereço' });
  }
});

// GET /api/clientes/me — retorna dados atualizados do cliente logado
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const jwt = require('jsonwebtoken');
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.query(
      'SELECT id, nome, email, telefone, cep, endereco, numero, complemento, bairro, cidade, estado FROM clientes WHERE id = ?',
      [decoded.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(401).json({ erro: 'Token inválido' });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const { enviarEmail } = require('../config/email');

// ── Template: e-mail recebido pela equipe Pura Essência ─────────
function templateContatoEmpresa({ nome, email, mensagem }) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f5f7f2;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f2;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
        <tr><td style="background:#3A5D3E;padding:28px 40px;text-align:center">
          <p style="margin:0;color:#D4AF37;font-size:24px;font-weight:700">🌿 PURA ESSÊNCIA</p>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Nova mensagem de contato</p>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:14px;color:#888;width:90px">Nome</td><td style="padding:8px 0;font-size:15px;color:#333;font-weight:700">${nome}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#888">E-mail</td><td style="padding:8px 0;font-size:15px;color:#3A5D3E">${email}</td></tr>
          </table>
          <p style="margin:20px 0 8px;font-size:14px;color:#888">Mensagem</p>
          <div style="background:#f5f7f2;border-left:4px solid #3A5D3E;border-radius:0 8px 8px 0;padding:16px 18px;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap">${mensagem}</div>
        </td></tr>
        <tr><td style="background:#2E4D37;padding:18px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#6a9e6e">Recebido pelo formulário de contato do site</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Template: resposta automática para o cliente ─────────────────
function templateRespostaAutomatica({ nome }) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f5f7f2;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f2;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
        <tr><td style="background:#3A5D3E;padding:32px 40px;text-align:center">
          <p style="margin:0;color:#D4AF37;font-size:26px;font-weight:700;letter-spacing:1px">🌿 PURA ESSÊNCIA</p>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Produtos Naturais e Orgânicos</p>
        </td></tr>
        <tr><td style="padding:36px 40px">
          <h1 style="margin:0 0 12px;font-size:22px;color:#3A5D3E">Recebemos sua mensagem!</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6">
            Olá, <strong>${nome}</strong>! Obrigado por entrar em contato com a Pura Essência.
          </p>
          <div style="background:#e8f0e9;border-left:4px solid #3A5D3E;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:16px">
            <p style="margin:0;font-size:14px;color:#3A5D3E;line-height:1.6">
              Vamos analisar sua solicitação e retornaremos em breve.
            </p>
          </div>
          <p style="margin:0;font-size:13px;color:#888;line-height:1.6">
            Este é um e-mail automático — não é necessário responder.
          </p>
        </td></tr>
        <tr><td style="background:#2E4D37;padding:24px 40px;text-align:center">
          <p style="margin:0 0 6px;font-size:13px;color:#a8c4aa">Outros canais:</p>
          <p style="margin:0;font-size:13px;color:#D4AF37">puraessenciaetec@gmail.com · (11) 3456-7890</p>
          <p style="margin:12px 0 0;font-size:12px;color:#6a9e6e">© ${new Date().getFullYear()} Pura Essência — Desenvolvido com 🌿 e cuidado</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// POST /api/contato
router.post('/', async (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  const okEmpresa = await enviarEmail({
    to:      'puraessenciaetec@gmail.com',
    nome:    'Pura Essência',
    subject: `📩 Nova mensagem de contato — ${nome}`,
    html:    templateContatoEmpresa({ nome, email, mensagem }),
  });

  // Resposta automática para o cliente
  await enviarEmail({
    to:      email,
    nome,
    subject: '✅ Recebemos sua mensagem — Pura Essência',
    html:    templateRespostaAutomatica({ nome }),
  });

  if (!okEmpresa) {
    return res.status(500).json({ erro: 'Erro ao enviar mensagem. Tente novamente.' });
  }

  res.json({ mensagem: 'Mensagem enviada com sucesso!' });
});

module.exports = router;
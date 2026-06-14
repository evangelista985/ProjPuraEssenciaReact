// backend/config/email.js
// Serviço de envio de e-mails usando a API HTTP da Brevo (antigo Sendinblue)
// Instale com: npm install sib-api-v3-sdk
//
// Por que Brevo em vez de Nodemailer/SMTP?
// O Render bloqueia/restringe portas SMTP de saída (465/587), causando
// ENETUNREACH / Connection timeout. A API da Brevo usa HTTPS (porta 443),
// que sempre funciona.
//
// Configuração necessária no Render (Environment):
//   BREVO_API_KEY = xkeysib-... (gerada em Settings > SMTP & API > API Keys)

const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = process.env.BREVO_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

const REMETENTE = {
  name: 'Pura Essência',
  email: process.env.EMAIL_FROM || 'puraessenciaetec@gmail.com',
};

// ── Template HTML do e-mail de confirmação de pedido ───────
function templateConfirmacaoPedido({ cliente, pedido, itens }) {
  const linhasItens = itens.map(i => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8f0e9;font-size:14px;color:#333">${i.nome}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8f0e9;font-size:14px;color:#333;text-align:center">${i.quantidade}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8f0e9;font-size:14px;color:#333;text-align:right">R$ ${Number(i.preco_unit * i.quantidade).toFixed(2).replace('.', ',')}</td>
    </tr>
  `).join('');

  const statusLabel = {
    pago:     '✅ Pagamento aprovado',
    pendente: '⏳ Pagamento em processamento',
  }[pedido.status] || pedido.status;

  const tituloPrincipal = pedido.status === 'pendente'
    ? 'Pedido recebido!'
    : 'Pedido confirmado!';

  const mensagemPrincipal = pedido.status === 'pendente'
    ? `Olá, <strong>${cliente.nome}</strong>! Recebemos seu pedido <strong>#${pedido.id}</strong> e estamos aguardando a confirmação do pagamento via <strong>${pedido.forma_pagamento.toUpperCase()}</strong>.`
    : `Olá, <strong>${cliente.nome}</strong>! Seu pedido <strong>#${pedido.id}</strong> foi recebido com sucesso.`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f7f2;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f2;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">

        <!-- Cabeçalho -->
        <tr><td style="background:#3A5D3E;padding:32px 40px;text-align:center">
          <img src="https://proj-pura-essencia-react.vercel.app/img/logo_escrito.png" alt="Pura Essência" width="240" style="max-width:240px;height:auto;display:block;margin:0 auto" />
          <p style="margin:12px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Produtos Naturais e Orgânicos</p>
        </td></tr>

        <!-- Mensagem principal -->
        <tr><td style="padding:36px 40px 24px">
          <h1 style="margin:0 0 8px;font-size:22px;color:#3A5D3E">${tituloPrincipal}</h1>
          <p style="margin:0;font-size:15px;color:#555;line-height:1.6">
            ${mensagemPrincipal}
          </p>
        </td></tr>

        <!-- Status -->
        <tr><td style="padding:0 40px 24px">
          <div style="background:#e8f0e9;border-left:4px solid #3A5D3E;border-radius:0 8px 8px 0;padding:14px 18px">
            <p style="margin:0;font-size:14px;font-weight:700;color:#3A5D3E">${statusLabel}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#555">
              Forma de pagamento: <strong>${pedido.forma_pagamento.toUpperCase()}</strong>
            </p>
          </div>
        </td></tr>

        <!-- Itens do pedido -->
        <tr><td style="padding:0 40px 24px">
          <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#333">Itens do pedido</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8f0e9;border-radius:8px;overflow:hidden">
            <tr style="background:#f5f7f2">
              <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#3A5D3E;text-transform:uppercase;letter-spacing:0.5px">Produto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:700;color:#3A5D3E;text-transform:uppercase;letter-spacing:0.5px">Qtd</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#3A5D3E;text-transform:uppercase;letter-spacing:0.5px">Valor</th>
            </tr>
            ${linhasItens}
          </table>
        </td></tr>

        <!-- Totais -->
        <tr><td style="padding:0 40px 24px">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${pedido.desconto > 0 ? `
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#555">Subtotal</td>
              <td style="padding:6px 0;font-size:14px;color:#555;text-align:right">R$ ${Number(pedido.total).toFixed(2).replace('.', ',')}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#3A5D3E">Desconto</td>
              <td style="padding:6px 0;font-size:14px;color:#3A5D3E;text-align:right">- R$ ${Number(pedido.desconto).toFixed(2).replace('.', ',')}</td>
            </tr>
            ` : ''}
            ${pedido.frete_valor > 0 ? `
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#555">Frete (${pedido.frete_servico || 'Correios'})</td>
              <td style="padding:6px 0;font-size:14px;color:#555;text-align:right">R$ ${Number(pedido.frete_valor).toFixed(2).replace('.', ',')}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#333;border-top:2px solid #e8f0e9">Total</td>
              <td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#3A5D3E;text-align:right;border-top:2px solid #e8f0e9">R$ ${Number(pedido.total_final).toFixed(2).replace('.', ',')}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Endereço de entrega -->
        ${pedido.endereco_entrega ? `
        <tr><td style="padding:0 40px 28px">
          <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#333">📍 Endereço de entrega</p>
          <div style="background:#f5f7f2;border-radius:8px;padding:14px 16px;font-size:14px;color:#555;line-height:1.8">
            ${pedido.endereco_entrega}, ${pedido.numero_entrega}
            ${pedido.complemento_entrega ? ' — ' + pedido.complemento_entrega : ''}<br>
            ${pedido.bairro_entrega} — ${pedido.cidade_entrega}/${pedido.estado_entrega}<br>
            CEP: ${pedido.cep_entrega}
          </div>
        </td></tr>
        ` : ''}

        <!-- Rodapé -->
        <tr><td style="background:#2E4D37;padding:24px 40px;text-align:center">
          <p style="margin:0 0 6px;font-size:13px;color:#a8c4aa">Dúvidas? Entre em contato:</p>
          <p style="margin:0;font-size:13px;color:#D4AF37">puraessenciaetec@gmail.com · (11) 3456-7890</p>
          <p style="margin:12px 0 0;font-size:12px;color:#6a9e6e">© ${new Date().getFullYear()} Pura Essência — Desenvolvido com 🌿 e cuidado</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Função genérica de envio via Brevo ─────────────────────
async function enviarEmail({ to, nome, subject, html }) {
  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = REMETENTE;
  email.to = [{ email: to, name: nome }];
  email.subject = subject;
  email.htmlContent = html;

  try {
    await transactionalApi.sendTransacEmail(email);
    console.log(`📧 E-mail enviado para ${to} — "${subject}"`);
    return true;
  } catch (err) {
    const detalhe = err.response?.text || err.message;
    console.error('⚠️  Falha ao enviar e-mail via Brevo:', detalhe);
    return false;
  }
}

// ── Função principal de envio: confirmação de pedido ───────
async function enviarEmailConfirmacaoPedido({ cliente, pedido, itens }) {
  const subject = pedido.status === 'pendente'
    ? `⏳ Pedido #${pedido.id} recebido — pagamento em processamento`
    : `✅ Pedido #${pedido.id} confirmado — Pura Essência`;

  return enviarEmail({
    to: cliente.email,
    nome: cliente.nome,
    subject,
    html: templateConfirmacaoPedido({ cliente, pedido, itens }),
  });
}

module.exports = { enviarEmailConfirmacaoPedido, enviarEmail };

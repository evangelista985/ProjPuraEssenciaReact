const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = require('./config/db');

// Rotas principais
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/pedidos',  require('./routes/pedidos'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/correios', require('./routes/correios'));
app.use('/api/frete',    require('./routes/frete'));
app.use('/api/contato', require('./routes/contato'));
const bannersRouter = require('./routes/banners');
app.use('/api/banners', bannersRouter);

// Servir imagens
app.use('/img', express.static(path.join(__dirname, 'img')));

// Verificar cupom
app.post('/api/cupons/verificar', async (req, res) => {
  const { codigo } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM cupons WHERE codigo = $1 AND ativo = true AND (validade IS NULL OR validade >= CURRENT_DATE)',
      [codigo]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Cupom inválido ou expirado' });
    res.json({ desconto: rows[0].desconto_percent, codigo: rows[0].codigo });
  } catch (error) {
    console.error('Erro ao verificar cupom:', error);
    res.status(500).json({ erro: 'Erro interno ao processar cupom' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Pura Essência API rodando na porta ${PORT}`);
});
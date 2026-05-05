const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/produtos',  require('./routes/produtos'));
app.use('/api/pedidos',   require('./routes/pedidos'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/correios',  require('./routes/correios'));

// Verificar cupom (público)
const db = require('./config/db');
app.post('/api/cupons/verificar', async (req, res) => {
  const { codigo } = req.body;
  const [rows] = await db.query(
    'SELECT * FROM cupons WHERE codigo = ? AND ativo = 1 AND (validade IS NULL OR validade >= CURDATE())',
    [codigo]
  );
  if (rows.length === 0) return res.status(404).json({ erro: 'Cupom inválido ou expirado' });
  res.json({ desconto: rows[0].desconto_percent, codigo: rows[0].codigo });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Pura Essência API rodando na porta ${PORT}`));

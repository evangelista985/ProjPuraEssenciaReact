const jwt = require('jsonwebtoken');

function authCliente(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    if (dados.tipo !== 'cliente') return res.status(403).json({ erro: 'Acesso negado' });
    req.cliente = dados;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

function authAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    if (dados.tipo !== 'admin') return res.status(403).json({ erro: 'Acesso negado' });
    req.admin = dados;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

function nivelMinimo(nivelRequerido) {
  const hierarquia = { admin: 3, gerente: 2, vendedor: 1 };
  return (req, res, next) => {
    const nivelAtual   = hierarquia[req.admin?.nivel] || 0;
    const nivelNecessario = hierarquia[nivelRequerido] || 0;
    if (nivelAtual < nivelNecessario) {
      return res.status(403).json({ erro: 'Permissão insuficiente' });
    }
    next();
  };
}

module.exports = { authCliente, authAdmin, nivelMinimo };

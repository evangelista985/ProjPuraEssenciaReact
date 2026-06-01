// Adicione este arquivo como routes/banners.js no backend Node

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authAdmin } = require('../middleware/auth');

// GET /api/banners — público (usado pelo app Android)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM banners WHERE ativo = 1 ORDER BY ordem ASC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar banners' });
  }
});

// POST /api/banners — admin
router.post('/', authAdmin, async (req, res) => {
  const { titulo, subtitulo, imagem, cor_fundo, ordem } = req.body;
  if (!titulo || !imagem) return res.status(400).json({ erro: 'Título e imagem são obrigatórios' });
  try {
    const [result] = await db.query(
      'INSERT INTO banners (titulo, subtitulo, imagem, cor_fundo, ordem) VALUES (?, ?, ?, ?, ?)',
      [titulo, subtitulo || '', imagem, cor_fundo || '#1B4D1A', ordem || 0]
    );
    res.status(201).json({ mensagem: 'Banner criado!', id: result.insertId });
  } catch {
    res.status(500).json({ erro: 'Erro ao criar banner' });
  }
});

// PUT /api/banners/:id — admin
router.put('/:id', authAdmin, async (req, res) => {
  const { titulo, subtitulo, imagem, cor_fundo, ordem, ativo } = req.body;
  try {
    await db.query(
      'UPDATE banners SET titulo=?, subtitulo=?, imagem=?, cor_fundo=?, ordem=?, ativo=? WHERE id=?',
      [titulo, subtitulo, imagem, cor_fundo, ordem, ativo ?? 1, req.params.id]
    );
    res.json({ mensagem: 'Banner atualizado!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao atualizar banner' });
  }
});

// DELETE /api/banners/:id — admin
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await db.query('UPDATE banners SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Banner removido!' });
  } catch {
    res.status(500).json({ erro: 'Erro ao remover banner' });
  }
});

module.exports = router;

const db = require('./config/db');

async function criar() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        subtitulo VARCHAR(200) DEFAULT '',
        imagem VARCHAR(500) NOT NULL,
        cor_fundo VARCHAR(20) DEFAULT '#1B4D1A',
        ativo TINYINT(1) DEFAULT 1,
        ordem INT DEFAULT 0,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela banners criada!');

    await db.query(`
      INSERT IGNORE INTO banners (id, titulo, subtitulo, imagem, cor_fundo, ordem) VALUES
      (1, '🌿 Bem-vindo', 'Natureza e saúde para você', '/img/chaHortela.jpg', '#1B4D1A', 1),
      (2, '✨ Cosméticos', 'Cuide da sua pele', '/img/chaCamomila.jpg', '#4A2D6B', 2),
      (3, '🌶 Temperos', 'Sabor e saúde', '/img/temperoAlecrim.jpg', '#7A2A0A', 3)
    `);
    console.log('✅ Banners inseridos!');
    process.exit(0);
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
}

criar();

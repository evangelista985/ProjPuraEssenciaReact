-- =============================================
-- PURA ESSÊNCIA - Schema MySQL
-- =============================================


CREATE DATABASE IF NOT EXISTS loja_pura_essencia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loja_pura_essencia;

-- Clientes (compradores)
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuários administrativos
CREATE TABLE admin_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nivel ENUM('admin', 'gerente', 'vendedor') NOT NULL DEFAULT 'vendedor',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias de produtos
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtos
CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  imagem VARCHAR(300),
  categoria_id INT,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Estoque por produto (quantidade simples)
CREATE TABLE estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL UNIQUE,
  quantidade INT DEFAULT 0,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- Cupons de desconto
CREATE TABLE cupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  desconto_percent DECIMAL(5,2) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  validade DATE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total_final DECIMAL(10,2) NOT NULL,
  forma_pagamento ENUM('pix','cartao','boleto') NOT NULL,
  status ENUM('pendente','pago','enviado','entregue','cancelado','finalizado') DEFAULT 'pendente',
  cupom_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (cupom_id) REFERENCES cupons(id)
);

-- Itens do pedido
CREATE TABLE pedido_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Admin padrão (senha: admin123)
INSERT INTO admin_usuarios (nome, email, senha, nivel) VALUES
('Administrador', 'admin@puraessencia.com', '$2b$10$OmsQsG90XP67Yv4SaOWFBuft2lT8XeFCbb90aXlQppyK9NgGdtUKa', 'admin');

-- Categorias
INSERT INTO categorias (nome) VALUES ('Chás'), ('Temperos'), ('Orgânicos');

-- Produtos
INSERT INTO produtos (nome, descricao, preco, imagem, categoria_id) VALUES
('Hortelã 20g',       'A hortelã é uma erva aromática muito conhecida pelo seu aroma fresco e sabor refrescante, utilizada na culinária e na medicina caseira para aliviar dores de estômago, melhorar a digestão e refrescar a respiração.', 4.75,  '/img/chaHortela.jpg',        1),
('Camomila flor 15g', 'A camomila é uma planta medicinal conhecida por seu efeito calmante. Muito usada em chás, ajuda a aliviar ansiedade, melhorar o sono e reduzir inflamações. Possui flores pequenas e brancas com aroma suave.', 6.15,  '/img/chaCamomila.jpg',       1),
('Chá Mate 250g',     'O chá-mate é feito das folhas da erva-mate, conhecido pelo sabor levemente amargo e efeito estimulante. Muito consumido quente ou gelado, ajuda a dar energia, melhorar concentração e auxiliar na digestão.', 9.90,  '/img/chaMate.jpg',           1),
('Manjericão 20g',    'O manjericão é uma erva aromática muito usada na culinária italiana. Tem folhas verdes perfumadas com sabor levemente doce e picante. Além de realçar o sabor, possui propriedades antioxidantes e anti-inflamatórias.', 8.40,  '/img/temperoManjericao.jpg', 2),
('Alecrim 25g',       'O alecrim é uma erva de aroma forte e marcante, muito usada em carnes, batatas e pães. Além de realçar sabores, é conhecido por ajudar na memória, concentração e na digestão.', 5.35,  '/img/temperoAlecrim.jpg',    2),
('Orégano 10g',       'O orégano é muito utilizado em pizzas, molhos e carnes. Tem sabor marcante e levemente picante, rico em antioxidantes e com propriedades antimicrobianas.', 9.40,  '/img/temperoOregano.jpg',    2),
('Café Orgânico 250g','O café orgânico é cultivado sem agrotóxicos ou produtos sintéticos, respeitando o meio ambiente. Preserva melhor o sabor natural do grão, resultando em uma bebida mais pura e aromática.', 30.49, '/img/organicoCafe.jpg',      3),
('Açúcar Orgânico 1kg','O açúcar orgânico é produzido sem agrotóxicos ou aditivos artificiais. Passa por processo menos refinado, preservando mais nutrientes naturais da cana com coloração levemente mais escura.', 9.20,  '/img/organicoAcucar.jpg',    3),
('Chocolate Orgânico 400g','O chocolate orgânico vem de cacau cultivado sem agrotóxicos ou conservantes. Processo mais natural e sustentável, valorizando a biodiversidade e o trabalho dos produtores.', 23.89, '/img/organicoChocolatePo.jpg',3);

-- Estoque
INSERT INTO estoque (produto_id, quantidade) VALUES
(1,50),(2,40),(3,35),(4,30),(5,45),(6,25),(7,20),(8,60),(9,15);

-- Cupons de exemplo
INSERT INTO cupons (codigo, desconto_percent, validade) VALUES
('BEMVINDO10', 10.00, '2025-12-31'),
('ORGANICO15', 15.00, '2025-06-30');

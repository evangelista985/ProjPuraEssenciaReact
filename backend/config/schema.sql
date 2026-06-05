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
INSERT INTO categorias (nome) VALUES ('Chás'), ('Temperos'), ('Orgânicos'), ('Cosméticos');

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
('Chocolate Orgânico 400g','O chocolate orgânico vem de cacau cultivado sem agrotóxicos ou conservantes. Processo mais natural e sustentável, valorizando a biodiversidade e o trabalho dos produtores.', 23.89, '/img/organicoChocolatePo.jpg',3),
('Óleo de Argan 30ml',    'O óleo de argan é extraído das sementes da árvore Argânia, nativa do Marrocos. Rico em vitamina E e ácidos graxos, hidrata profundamente a pele e os cabelos, reduzindo o frizz e devolvendo brilho natural.', 49.90, '/img/cosmeticoOleoArgan.jpg', 4),
('Creme Hidratante de Manteiga de Karité 150g', 'Creme elaborado com manteiga de karité pura, extraída de forma sustentável. Nutre e protege a pele seca, restaurando a barreira cutânea e proporcionando hidratação duradoura sem resíduos.', 34.50, '/img/cosmeticoKarite.jpg', 4),
('Sérum Vitamina C 30ml', 'Sérum facial concentrado com vitamina C estabilizada, extrato de roseira e ácido hialurônico. Ilumina o tom da pele, combate manchas e estimula a produção de colágeno para um aspecto mais jovem.', 69.90, '/img/cosmeticoSerumVitC.jpg', 4),
('Sabonete de Lavanda 90g','Sabonete artesanal com extrato de lavanda e óleos vegetais. Limpa suavemente sem ressecar, com aroma relaxante que transforma o banho em um momento de aromaterapia.', 18.90, '/img/cosmeticoSabonete.jpg', 4);

-- Estoque
INSERT INTO estoque (produto_id, quantidade) VALUES
(1,50),(2,40),(3,35),(4,30),(5,45),(6,25),(7,20),(8,60),(9,15),(10,30),(11,25),(12,20),(13,40);

-- Cupons de exemplo
INSERT INTO cupons (codigo, desconto_percent, validade) VALUES
('BEMVINDO10', 10.00, '2025-12-31'),
('ORGANICO15', 15.00, '2025-06-30');

-- tela cosmesticos
INSERT INTO categorias (id, nome) VALUES (4, 'Cosméticos')
ON DUPLICATE KEY UPDATE nome = 'Cosméticos';

SELECT * FROM categorias ORDER BY id;

INSERT INTO produtos (nome, descricao, preco, imagem, categoria_id, ativo)
VALUES ('Creme Hidratante Natural 200ml','Creme hidratante feito com ingredientes 100% naturais, ideal para pele seca e sensível.', 29.90, '/img/creme_hidratante.jpg', 4, 1);
INSERT INTO produtos (nome, descricao, preco, imagem, categoria_id, ativo) VALUES
('Óleo de Argan Puro 30ml', 'Óleo vegetal extraído a frio, rico em vitamina E e ácidos graxos. Hidrata profundamente cabelos e pele, reduzindo o frizz e devolvendo o brilho natural.', 34.90, '/img/oleo_argan.jpg', 4, 1),
('Sabonete de Argila Verde 90g', 'Sabonete artesanal com argila verde, ideal para pele oleosa e acneica. Limpa os poros em profundidade e controla a oleosidade sem ressecar.', 14.50, '/img/sabonete_argila.jpg', 4, 1),
('Máscara Facial de Mel e Aveia 150g', 'Máscara nutritiva com mel puro e aveia colloidal. Suaviza, hidrata e ilumina a pele, deixando-a macia e revitalizada após o uso.', 27.90, '/img/mascara_mel_aveia.jpg', 4, 1),
('Sérum Vitamina C Natural 30ml', 'Sérum concentrado com vitamina C estabilizada e extrato de rosa mosqueta. Uniformiza o tom da pele, reduz manchas e estimula a produção de colágeno.', 49.90, '/img/serum_vitamina_c.jpg', 4, 1),
('Desodorante Natural de Bambu 60g', 'Desodorante em pasta sem alumínio, com carvão ativado de bambu e óleo essencial de lavanda. Eficaz por até 24h sem agredir a pele.', 22.00, '/img/desodorante_bambu.jpg', 4, 1),
('Esfoliante Corporal de Café 200g', 'Esfoliante com grãos de café, açúcar mascavo e óleo de coco. Remove células mortas, combate a celulite e deixa a pele suave e perfumada.', 31.50, '/img/esfoliante_cafe.jpg', 4, 1),
('Shampoo Sólido de Babosa 80g', 'Shampoo em barra com gel de babosa e pantenol. Hidrata o couro cabeludo, reduz a queda e fortalece os fios. Rende até 80 lavagens.', 19.90, '/img/shampoo_babosa.jpg', 4, 1),
('Lip Balm de Manteiga de Karité 10g', 'Protetor labial com manteiga de karité, cera de abelha e óleo de rosa mosqueta. Hidrata e repara lábios ressecados com textura leve e agradável.', 12.00, '/img/lip_balm_karite.jpg', 4, 1);

DELETE c1 FROM categorias c1
INNER JOIN categorias c2
WHERE c1.id > c2.id AND c1.nome = c2.nome;


DELETE FROM `loja_pura_essencia`.`produtos` WHERE `categoria_id` IN (11);
DELETE FROM `loja_pura_essencia`.`categorias` WHERE `id` IN (11);
SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 1;
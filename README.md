# 🌿 Pura Essência — E-commerce Full Stack

Loja virtual de produtos naturais e orgânicos.  
**Stack:** React + Vite (frontend) · Node.js + Express (backend) · MySQL (banco de dados)

---

## 📁 Estrutura do Projeto

```
pura-essencia/
├── backend/
│   ├── config/
│   │   ├── db.js          # Pool de conexão MySQL
│   │   └── schema.sql     # Script de criação do banco
│   ├── middleware/
│   │   └── auth.js        # JWT (cliente e admin)
│   ├── routes/
│   │   ├── clientes.js    # Cadastro e login de clientes
│   │   ├── produtos.js    # CRUD de produtos + categorias
│   │   ├── pedidos.js     # Criação e gestão de pedidos
│   │   └── admin.js       # Login admin, usuários, cupons, dashboard
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Login cliente e admin
    │   │   └── CartContext.jsx   # Carrinho em memória
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Vitrine.jsx                 # Home com carrossel + grid
    │   │   ├── DetalhesProduto.jsx         # Detalhe + adicionar ao carrinho
    │   │   ├── Carrinho.jsx                # Cupom, pagamento, finalizar
    │   │   ├── Auth.jsx                    # Login e Cadastro de clientes
    │   │   ├── MeusPedidos.jsx             # Histórico do cliente
    │   │   ├── Admin.jsx                   # Login admin + layout sidebar
    │   │   ├── AdminDashboard.jsx          # KPIs, gráfico, top produtos
    │   │   ├── AdminProdutos.jsx           # CRUD produtos + estoque
    │   │   ├── AdminPedidos.jsx            # Lista pedidos + painel detalhe
    │   │   └── AdminUsuariosECupons.jsx    # Gestão de usuários e cupons
    │   ├── services/
    │   │   └── api.js           # Axios com interceptor JWT
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css            # Tema verde (#3A5D3E) e dourado (#D4AF37)
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Como rodar

### 1. Banco de dados

```bash
mysql -u root -p < backend/config/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais MySQL
npm install
npm run dev       # porta 3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # porta 5173
```

Acesse: **http://localhost:5173**

---

## 🔐 Credenciais padrão

| Tipo      | E-mail                        | Senha      |
|-----------|-------------------------------|------------|
| Admin     | admin@puraessencia.com        | admin123   |

> Clientes se cadastram pela própria loja.

---

## 🛒 Funcionalidades

### Loja (público)
- Vitrine com carrossel de imagens e banner promocional
- Grid de produtos com filtro por nome e categoria
- Página de detalhe do produto com controle de quantidade
- Carrinho com ajuste de quantidade por item
- Aplicação de cupom de desconto
- Escolha de pagamento (PIX, Cartão, Boleto)
- Finalização de pedido com controle de estoque transacional
- Histórico de pedidos do cliente

### Painel Admin (`/admin/login`)
- **Dashboard** — KPIs (pedidos, receita, ticket médio), gráfico de barras (7 dias), pedidos por status, top 5 produtos
- **Produtos** — Cadastro, edição, controle de estoque, remoção
- **Pedidos** — Lista completa com painel de detalhe lateral, troca de status
- **Usuários** — Criar/remover usuários admin por nível (admin > gerente > vendedor)
- **Cupons** — Criar, ativar e desativar cupons de desconto

### Permissões por nível
| Ação                       | Admin | Gerente | Vendedor |
|----------------------------|:-----:|:-------:|:--------:|
| Ver dashboard              | ✅    | ✅      | ✅       |
| Gerenciar produtos         | ✅    | ✅      | ✅       |
| Remover produtos           | ✅    | ✅      | ❌       |
| Ver e atualizar pedidos    | ✅    | ✅      | somente finalizar |
| Gerenciar usuários/cupons  | ✅    | parcial | ❌       |
| Criar admins               | ✅    | ❌      | ❌       |

---

## 🎨 Design

- Cores: Verde `#3A5D3E` · Dourado `#D4AF37` · Fundo `#f5f7f2`
- Fontes: **Playfair Display** (títulos) · **Lato** (texto)
- Layout responsivo com CSS puro (sem frameworks)

---

## 🗃️ Banco de dados

Tabelas: `clientes` · `admin_usuarios` · `categorias` · `produtos` · `estoque` · `cupons` · `pedidos` · `pedido_itens`

Dados iniciais incluídos: 1 admin, 3 categorias, 9 produtos com estoque, 2 cupons de exemplo.

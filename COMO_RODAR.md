# 🌿 Como Rodar o Projeto Pura Essência

O erro `ENOENT: no such file or directory` acontece porque o projeto é dividido em **Backend** e **Frontend**. Você precisa instalar as dependências e rodar cada um em um terminal separado.

---

### 1. Configurando o Backend
Abra um terminal na pasta raiz do projeto e digite:
```bash
cd backend
npm install
npm start
```
*O backend rodará em: `http://localhost:3001`*

### 2. Configurando o Frontend
Abra **outro** terminal na pasta raiz do projeto e digite:
```bash
cd frontend
npm install
npm run dev
```
*O frontend rodará em: `http://localhost:5173`*

---

### 💡 Dicas Importantes:
1. **Banco de Dados:** Certifique-se de que seu MySQL está rodando e que você configurou as credenciais no arquivo `backend/config/db.js` ou no arquivo `.env`.
2. **Mercado Pago:** O token de teste já está configurado em `backend/routes/pagamentos.js`, mas você pode alterá-lo para o seu token real quando desejar.
3. **BrasilAPI:** Já está configurada e funcionando automaticamente para CEP e Frete.

---

### Estrutura de Pastas:
- `/backend`: Servidor Node.js (API, Banco de Dados, Mercado Pago, BrasilAPI).
- `/frontend`: Interface React (Vite).
- `/img`: Imagens dos produtos.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Wrapper compatível com a sintaxe mysql2 já usada no projeto
// mysql2 retorna [rows, fields] — mantemos o mesmo padrão
const db = {
  query: async (sql, params = []) => {
    // Converte placeholders: MySQL usa ? → PostgreSQL usa $1, $2...
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const result = await pool.query(pgSql, params);
    return [result.rows, result.fields];
  },
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: async (sql, params = []) => {
        let i = 0;
        const pgSql = sql.replace(/\?/g, () => `$${++i}`);
        const result = await client.query(pgSql, params);
        return [result.rows, result.fields];
      },
      beginTransaction: () => client.query('BEGIN'),
      commit:           () => client.query('COMMIT'),
      rollback:         () => client.query('ROLLBACK'),
      release:          () => client.release(),
    };
  }
};

module.exports = db;

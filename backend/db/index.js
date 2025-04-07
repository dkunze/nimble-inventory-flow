import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'nimble',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: 5432,
});

export default pool;

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000
});

async function query(text, params) {
  return pool.query(text, params);
}

async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code VARCHAR(32) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      click_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS urls_created_at_idx ON urls (created_at DESC);
  `);
}

async function closeDatabase() {
  await pool.end();
}

module.exports = { pool, query, initializeDatabase, closeDatabase };

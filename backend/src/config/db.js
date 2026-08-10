const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Determine SSL status from URL if available, otherwise check DB_SSL env var
const isSSLRequired = databaseUrl 
  ? (databaseUrl.includes('aivencloud.com') || 
     databaseUrl.includes('railway.app') || 
     databaseUrl.includes('render.com') ||
     databaseUrl.includes('supabase.co'))
  : process.env.DB_SSL === 'true';

let pool;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432');
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'crm_erp';

  pool = new Pool({
    host,
    port,
    user,
    password,
    database,
    ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

const query = async (sql, params) => {
  return pool.query(sql, params);
};

const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  pool,
  query,
  getClient
};

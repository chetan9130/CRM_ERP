const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function getDbClient() {
  const databaseUrl = process.env.DATABASE_URL;
  const isSSLRequired = databaseUrl 
    ? (databaseUrl.includes('aivencloud.com') || 
       databaseUrl.includes('railway.app') || 
       databaseUrl.includes('render.com') ||
       databaseUrl.includes('supabase.co'))
    : process.env.DB_SSL === 'true';

  if (databaseUrl) {
    return new Client({
      connectionString: databaseUrl,
      ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined
    });
  } else {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432');
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'crm_erp';

    return new Client({
      host,
      port,
      user,
      password,
      database,
      ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined
    });
  }
}

async function runMigration() {
  console.log('Connecting to PostgreSQL database...');
  try {
    const client = await getDbClient();
    await client.connect();

    console.log('Connected successfully. Reading migration file...');
    
    const migrationPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration SQL...');
    await client.query(sql);

    console.log('Migration completed successfully!');
    await client.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

module.exports = { runMigration };

if (require.main === module) {
  runMigration();
}

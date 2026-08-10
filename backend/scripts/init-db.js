const { Client } = require('pg');
const dotenv = require('dotenv');
const { runMigration } = require('./migrate');
const { seedDatabase } = require('./seed');

// Load environment variables
dotenv.config();

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  const isSSLRequired = databaseUrl 
    ? (databaseUrl.includes('aivencloud.com') || 
       databaseUrl.includes('railway.app') || 
       databaseUrl.includes('render.com') ||
       databaseUrl.includes('supabase.co'))
    : process.env.DB_SSL === 'true';

  let defaultDbConfig;

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      // Connect to postgres default DB to check and create the target DB
      url.pathname = '/postgres';
      defaultDbConfig = {
        connectionString: url.toString(),
        ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined
      };
    } catch (e) {
      console.error('Invalid DATABASE_URL. Falling back to individual parameters.');
    }
  }

  if (!defaultDbConfig) {
    defaultDbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: 'postgres',
      ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined
    };
  }

  console.log('Connecting to PostgreSQL to check target database...');
  const client = new Client(defaultDbConfig);

  try {
    await client.connect();
    
    // Check if target database crm_erp exists
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'crm_erp'"
    );

    if (dbCheckResult.rows.length === 0) {
      console.log("Database 'crm_erp' does not exist. Creating it...");
      // CREATE DATABASE cannot be executed inside a transaction, which pg handles by default
      await client.query('CREATE DATABASE crm_erp');
      console.log("Database 'crm_erp' created successfully!");
    } else {
      console.log("Database 'crm_erp' already exists.");
    }
  } catch (error) {
    console.error('Failed to verify/create database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Sequentially execute migration
  console.log('\n--- Running Database Migrations ---');
  try {
    await runMigration();
  } catch (error) {
    console.error('Migration execution failed:', error);
    process.exit(1);
  }

  // Sequentially execute seeding
  console.log('\n--- Running Database Seeding ---');
  try {
    await seedDatabase();
    console.log('\nDatabase initialization and seeding completed successfully!');
  } catch (error) {
    console.error('Seeding execution failed:', error);
    process.exit(1);
  }
}

initDatabase();

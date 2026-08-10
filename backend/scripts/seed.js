const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

async function seedDatabase() {
  console.log('Connecting to database for seeding...');
  try {
    const client = await getDbClient();
    await client.connect();
    console.log('Connected. Cleaning existing data...');
    
    // In PostgreSQL, perform a cascading truncate
    await client.query('TRUNCATE TABLE customer_notes, challan_items, sales_challans, stock_movements, products, customers, users CASCADE');
    
    // Reset sequence
    await client.query('ALTER SEQUENCE sales_challan_number_seq RESTART WITH 1');

    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const users = [
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { name: 'Sales Agent', email: 'sales@example.com', password: 'sales123', role: 'sales' },
      { name: 'Warehouse Mgr', email: 'warehouse@example.com', password: 'warehouse123', role: 'warehouse' },
      { name: 'Accounts Officer', email: 'accounts@example.com', password: 'accounts123', role: 'accounts' }
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, salt);
      const id = crypto.randomUUID();
      await client.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [id, u.name, u.email, hash, u.role]
      );
    }
    console.log('Users seeded.');

    console.log('Seeding customers...');
    const customers = [
      {
        name: 'John Doe',
        mobile: '+1234567890',
        email: 'john.doe@retailshop.com',
        business_name: 'Doe Retail Solutions',
        gst_number: '27AAAAA1111A1Z1',
        customer_type: 'retail',
        address: '123 Retail Lane, Shopping District, Mumbai',
        status: 'active',
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        name: 'Jane Smith',
        mobile: '+1987654321',
        email: 'jane@wholesalehub.com',
        business_name: 'Smith Wholesalers Ltd',
        gst_number: '27BBBBB2222B2Z2',
        customer_type: 'wholesale',
        address: '456 Warehouse Blvd, Industrial Zone, Pune',
        status: 'active',
        follow_up_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        name: 'Robert Johnson',
        mobile: '+1122334455',
        email: 'robert@distrocorp.com',
        business_name: 'DistroCorp Enterprises',
        gst_number: '27CCCCC3333C3Z3',
        customer_type: 'distributor',
        address: '789 Logistics Park, Gateway City, Bangalore',
        status: 'lead',
        follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ];

    for (const c of customers) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO customers (id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, c.name, c.mobile, c.email, c.business_name, c.gst_number, c.customer_type, c.address, c.status, c.follow_up_date]
      );
    }
    console.log('Customers seeded.');

    console.log('Seeding products...');
    const products = [
      {
        name: 'Premium Wireless Headphones',
        sku: 'PROD-WHP-001',
        category: 'Electronics',
        unit_price: 99.99,
        current_stock: 50,
        min_stock_alert: 10,
        location: 'Aisle 3, Shelf B'
      },
      {
        name: 'Ergonomic Office Chair',
        sku: 'PROD-OCH-002',
        category: 'Furniture',
        unit_price: 149.50,
        current_stock: 15,
        min_stock_alert: 5,
        location: 'Aisle 7, Shelf A'
      },
      {
        name: 'Mechanical Keyboard (Red Switches)',
        sku: 'PROD-MKB-003',
        category: 'Electronics',
        unit_price: 79.00,
        current_stock: 8,
        min_stock_alert: 15,
        location: 'Aisle 3, Shelf D'
      },
      {
        name: 'USB-C Multi-Port Adapter',
        sku: 'PROD-USB-004',
        category: 'Accessories',
        unit_price: 35.00,
        current_stock: 120,
        min_stock_alert: 20,
        location: 'Aisle 1, Shelf C'
      },
      {
        name: 'Anti-Glare Desk Mat',
        sku: 'PROD-MAT-005',
        category: 'Accessories',
        unit_price: 18.75,
        current_stock: 4,
        min_stock_alert: 10,
        location: 'Aisle 1, Shelf E'
      }
    ];

    for (const p of products) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO products (id, name, sku, category, unit_price, current_stock, min_stock_alert, location) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, p.name, p.sku, p.category, p.unit_price, p.current_stock, p.min_stock_alert, p.location]
      );
    }
    console.log('Products seeded.');

    console.log('Database seeding completed successfully!');
    await client.end();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase();
}

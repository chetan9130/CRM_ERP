require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const customersRouter = require('./routes/customers');
const productsRouter = require('./routes/products');
const challansRouter = require('./routes/challans');
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins: production frontend + local dev fallbacks
// Strip trailing slash in case FRONTEND_URL was set with one (e.g. https://example.com/)
const rawFrontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;
const allowedOrigins = [
  rawFrontendUrl,             // e.g. https://crm-erp-sage.vercel.app
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Handle OPTIONS preflight FIRST — before any route or body-parser middleware
app.options('*', cors(corsOptions));

// Apply CORS headers to every request
app.use(cors(corsOptions));

// Parse request bodies
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CRM Backend API is running'
  });
});

// Health check — also probes DB so you can verify connectivity from Render logs
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'error: ' + e.code;
  }
  res.json({ status: 'ok', message: 'CRM backend is running', database: dbStatus });
});

// Routes — auth at /auth, resources at /customers, /products, /challans
app.use('/auth', authRouter);
app.use('/customers', customersRouter);
app.use('/products', productsRouter);
app.use('/challans', challansRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: err.details || undefined
  });
});

// Start listening — bind to 0.0.0.0 so Render can route traffic correctly
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`CRM backend running on port ${PORT}`);
  try {
    const client = await pool.connect();
    console.log('Database connected successfully.');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});

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

// Allowed origins: production frontend URL + local dev fallback
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse request bodies
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/challans', challansRouter);

// Health check — exposed at /api/health for consistency
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM backend is running' });
});

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

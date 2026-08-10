const { Router } = require('express');
const { query, getClient } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { productSchema, stockAdjustmentSchema } = require('../validators/product');
const crypto = require('crypto');

const router = Router();

// Apply auth middleware to all products routes
router.use(authenticateToken);

// 1. GET /api/products - List with pagination, search, category filter, low-stock filter
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search;
    const category = req.query.category;
    const lowStock = req.query.low_stock;

    let queryText = 'SELECT *, (current_stock < min_stock_alert) AS is_low_stock FROM products WHERE 1=1';
    let countQueryText = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const queryParams = [];

    if (search) {
      const searchWildcard = `%${search}%`;
      const idx = queryParams.length;
      queryText += ` AND (name ILIKE $${idx+1} OR sku ILIKE $${idx+2} OR category ILIKE $${idx+3})`;
      countQueryText += ` AND (name ILIKE $${idx+1} OR sku ILIKE $${idx+2} OR category ILIKE $${idx+3})`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard);
    }

    if (category) {
      queryText += ` AND category = $${queryParams.length + 1}`;
      countQueryText += ` AND category = $${queryParams.length + 1}`;
      queryParams.push(category);
    }

    if (lowStock === 'true') {
      queryText += ` AND current_stock < min_stock_alert`;
      countQueryText += ` AND current_stock < min_stock_alert`;
    }

    // Get total count
    const countResult = await query(countQueryText, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination and sorting
    queryText += ` ORDER BY name ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const dataResult = await query(queryText, queryParams);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      data: dataResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/products/:id - Get detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT *, (current_stock < min_stock_alert) AS is_low_stock FROM products WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/products - Create (Admin & Warehouse only)
router.post('/', requireRole(['admin', 'warehouse']), async (req, res) => {
  try {
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const val = parseResult.data;
    const skuUpper = val.sku.toUpperCase().trim();

    // Check for SKU conflict
    const skuCheck = await query('SELECT 1 FROM products WHERE sku = $1', [skuUpper]);
    if (skuCheck.rows.length > 0) {
      return res.status(409).json({ error: `Product SKU '${skuUpper}' already exists.` });
    }

    const category = val.category || null;
    const location = val.location || null;

    const id = crypto.randomUUID();
    const insertResult = await query(
      `INSERT INTO products (id, name, sku, category, unit_price, current_stock, min_stock_alert, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *, (current_stock < min_stock_alert) AS is_low_stock`,
      [id, val.name, skuUpper, category, val.unit_price, val.current_stock, val.min_stock_alert, location]
    );

    // Create an initial stock movement log if current_stock > 0
    if (val.current_stock > 0) {
      const smId = crypto.randomUUID();
      await query(
        `INSERT INTO stock_movements (id, product_id, quantity_changed, movement_type, reason, reference_type, created_by)
         VALUES ($1, $2, $3, 'IN', 'Initial stock creation', 'manual', $4)`,
        [smId, id, val.current_stock, req.user.id]
      );
    }

    return res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. PUT /api/products/:id - Update (Admin & Warehouse only)
router.put('/:id', requireRole(['admin', 'warehouse']), async (req, res) => {
  try {
    const { id } = req.params;
    const checkResult = await query('SELECT 1 FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const val = parseResult.data;
    const skuUpper = val.sku.toUpperCase().trim();

    // Check SKU conflicts with other products
    const skuCheck = await query('SELECT 1 FROM products WHERE sku = $1 AND id != $2', [skuUpper, id]);
    if (skuCheck.rows.length > 0) {
      return res.status(409).json({ error: `Product SKU '${skuUpper}' is already in use by another product.` });
    }

    const category = val.category || null;
    const location = val.location || null;

    // Log stock differences
    const productBefore = await query('SELECT current_stock FROM products WHERE id = $1', [id]);
    const oldStock = productBefore.rows[0].current_stock;
    const stockDifference = val.current_stock - oldStock;

    const updateResult = await query(
      `UPDATE products
       SET name = $1, sku = $2, category = $3, unit_price = $4, current_stock = $5, 
           min_stock_alert = $6, location = $7
       WHERE id = $8
       RETURNING *, (current_stock < min_stock_alert) AS is_low_stock`,
      [val.name, skuUpper, category, val.unit_price, val.current_stock, val.min_stock_alert, location, id]
    );

    if (stockDifference !== 0) {
      const type = stockDifference > 0 ? 'IN' : 'OUT';
      const absDiff = Math.abs(stockDifference);
      const smId = crypto.randomUUID();
      await query(
        `INSERT INTO stock_movements (id, product_id, quantity_changed, movement_type, reason, reference_type, created_by)
         VALUES ($1, $2, $3, $4, 'Stock updated via direct product edit', 'manual', $5)`,
        [smId, id, absDiff, type, req.user.id]
      );
    }

    return res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. DELETE /api/products/:id - Delete (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check references in stock_movements and challan_items
    const smCheck = await query('SELECT 1 FROM stock_movements WHERE product_id = $1 LIMIT 1', [id]);
    const ciCheck = await query('SELECT 1 FROM challan_items WHERE product_id = $1 LIMIT 1', [id]);

    if (smCheck.rows.length > 0 || ciCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete product: it has associated stock movements or sales challan line items.'
      });
    }

    const checkProduct = await query('SELECT 1 FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await query('DELETE FROM products WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. GET /api/products/:id/movements - Get stock movement log
router.get('/:id/movements', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if product exists
    const checkProduct = await query('SELECT 1 FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = await query(
      `SELECT sm.id, sm.quantity_changed, sm.movement_type, sm.reason, sm.reference_type, sm.reference_id, 
              sm.created_at, u.name as created_by_name, u.role as created_by_role
       FROM stock_movements sm
       LEFT JOIN users u ON sm.created_by = u.id
       WHERE sm.product_id = $1
       ORDER BY sm.created_at DESC`,
      [id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. POST /api/products/:id/stock - Adjust Stock Manually with Row-Locks and DB Transactions
router.post('/:id/stock', requireRole(['admin', 'warehouse']), async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    // Validate inputs
    const parseResult = stockAdjustmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { quantity_changed, movement_type, reason } = parseResult.data;
    const createdBy = req.user.id;

    // Start Transaction
    await client.query('BEGIN');

    // Select product and LOCK row
    const productResult = await client.query(
      'SELECT current_stock, name FROM products WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentStock = productResult.rows[0].current_stock;
    const name = productResult.rows[0].name;
    let newStock = currentStock;

    if (movement_type === 'IN') {
      newStock += quantity_changed;
    } else {
      newStock -= quantity_changed;
      if (newStock < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Insufficient stock for product '${name}'. Current stock: ${currentStock}, requested adjustment: -${quantity_changed}`
        });
      }
    }

    // Update Product Stock
    await client.query(
      'UPDATE products SET current_stock = $1 WHERE id = $2',
      [newStock, id]
    );

    // Insert Stock Movement
    const smId = crypto.randomUUID();
    await client.query(
      `INSERT INTO stock_movements (id, product_id, quantity_changed, movement_type, reason, reference_type, created_by)
       VALUES ($1, $2, $3, $4, $5, 'manual', $6)`,
      [smId, id, quantity_changed, movement_type, reason, createdBy]
    );

    // Commit Transaction
    await client.query('COMMIT');

    // Retrieve and return updated product details
    const updatedProduct = await query(
      'SELECT *, (current_stock < min_stock_alert) AS is_low_stock FROM products WHERE id = $1',
      [id]
    );

    return res.json(updatedProduct.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adjusting stock:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;

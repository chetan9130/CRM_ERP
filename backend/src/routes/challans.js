const { Router } = require('express');
const { query, getClient } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createChallanSchema } = require('../validators/challan');
const crypto = require('crypto');

const router = Router();

// Apply auth middleware to all challans routes
router.use(authenticateToken);

// 1. GET /api/challans - List with pagination, status filter, customer filter
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const status = req.query.status;
    const customerId = req.query.customer_id;

    let queryText = `
      SELECT sc.*, c.name as customer_name, c.business_name as customer_business_name, u.name as created_by_name
      FROM sales_challans sc
      LEFT JOIN customers c ON sc.customer_id = c.id
      LEFT JOIN users u ON sc.created_by = u.id
      WHERE 1=1
    `;
    let countQueryText = 'SELECT COUNT(*) as count FROM sales_challans WHERE 1=1';
    const queryParams = [];

    if (status) {
      queryText += ` AND sc.status = $${queryParams.length + 1}`;
      countQueryText += ` AND status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (customerId) {
      queryText += ` AND sc.customer_id = $${queryParams.length + 1}`;
      countQueryText += ` AND customer_id = $${queryParams.length + 1}`;
      queryParams.push(customerId);
    }

    // Get total count
    const countResult = await query(countQueryText, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination and sorting
    queryText += ` ORDER BY sc.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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
    console.error('Error fetching challans:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/challans/:id - Get details with line items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const challanResult = await query(
      `SELECT sc.*, c.name as customer_name, c.business_name as customer_business_name, u.name as created_by_name
       FROM sales_challans sc
       LEFT JOIN customers c ON sc.customer_id = c.id
       LEFT JOIN users u ON sc.created_by = u.id
       WHERE sc.id = $1`,
      [id]
    );

    if (challanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    const itemsResult = await query(
      `SELECT ci.*, p.location
       FROM challan_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.challan_id = $1`,
      [id]
    );

    return res.json({
      challan: challanResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching challan details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/challans - Create Draft (Admin & Sales only)
router.post('/', requireRole(['admin', 'sales']), async (req, res) => {
  const client = await getClient();

  try {
    // Validate inputs
    const parseResult = createChallanSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { customer_id, items } = parseResult.data;
    const createdBy = req.user.id;

    // Start Transaction
    await client.query('BEGIN');

    // 1. Check if customer exists
    const customerCheck = await client.query('SELECT 1 FROM customers WHERE id = $1', [customer_id]);
    if (customerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found' });
    }

    // 2. Generate sequential unique challan number using Postgres sequence
    const seqResult = await client.query("SELECT nextval('sales_challan_number_seq') AS nextval");
    const seqVal = seqResult.rows[0].nextval;
    const year = new Date().getFullYear();
    const challanNumber = `CH-${year}-${String(seqVal).padStart(5, '0')}`;

    // 3. Insert challan header with code-generated UUID
    const id = crypto.randomUUID();
    await client.query(
      `INSERT INTO sales_challans (id, challan_number, customer_id, status, created_by)
       VALUES ($1, $2, $3, 'draft', $4)`,
      [id, challanNumber, customer_id, createdBy]
    );

    // 4. Insert items fetching product snapshots
    let totalQuantity = 0;
    for (const item of items) {
      const productResult = await client.query(
        'SELECT name, sku, unit_price FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ID '${item.product_id}' not found.` });
      }

      const prod = productResult.rows[0];
      const itemId = crypto.randomUUID();
      await client.query(
        `INSERT INTO challan_items (id, challan_id, product_id, product_name_snapshot, product_sku_snapshot, unit_price_snapshot, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [itemId, id, item.product_id, prod.name, prod.sku, prod.unit_price, item.quantity]
      );
      totalQuantity += item.quantity;
    }

    // 5. Update total quantity in header
    await client.query(
      'UPDATE sales_challans SET total_quantity = $1 WHERE id = $2',
      [totalQuantity, id]
    );

    // Commit Transaction
    await client.query('COMMIT');

    // Fetch and return complete details
    const result = await query(
      `SELECT sc.*, c.name as customer_name, c.business_name as customer_business_name
       FROM sales_challans sc
       LEFT JOIN customers c ON sc.customer_id = c.id
       WHERE sc.id = $1`,
      [id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.rollback();
    console.error('Error creating challan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// 4. PUT /api/challans/:id - Edit Draft (Admin & Sales only)
router.put('/:id', requireRole(['admin', 'sales']), async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    // Validate inputs
    const parseResult = createChallanSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { customer_id, items } = parseResult.data;

    // Start Transaction
    await client.query('BEGIN');

    // 1. Fetch and lock challan
    const challanResult = await client.query(
      'SELECT status, challan_number FROM sales_challans WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (challanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Challan not found' });
    }

    const challan = challanResult.rows[0];
    if (challan.status !== 'draft') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot edit challan ${challan.challan_number}: it is already in ${challan.status} state.`
      });
    }

    // 2. Check if customer exists
    const customerCheck = await client.query('SELECT 1 FROM customers WHERE id = $1', [customer_id]);
    if (customerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found' });
    }

    // 3. Clear old line items
    await client.query('DELETE FROM challan_items WHERE challan_id = $1', [id]);

    // 4. Insert new items with snapshots
    let totalQuantity = 0;
    for (const item of items) {
      const productResult = await client.query(
        'SELECT name, sku, unit_price FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ID '${item.product_id}' not found.` });
      }

      const prod = productResult.rows[0];
      const itemId = crypto.randomUUID();
      await client.query(
        `INSERT INTO challan_items (id, challan_id, product_id, product_name_snapshot, product_sku_snapshot, unit_price_snapshot, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [itemId, id, item.product_id, prod.name, prod.sku, prod.unit_price, item.quantity]
      );
      totalQuantity += item.quantity;
    }

    // 5. Update header info
    await client.query(
      `UPDATE sales_challans 
       SET customer_id = $1, total_quantity = $2 
       WHERE id = $3`,
      [customer_id, totalQuantity, id]
    );

    // Commit Transaction
    await client.query('COMMIT');

    // Fetch and return complete details
    const result = await query(
      `SELECT sc.*, c.name as customer_name, c.business_name as customer_business_name
       FROM sales_challans sc
       LEFT JOIN customers c ON sc.customer_id = c.id
       WHERE sc.id = $1`,
      [id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    await client.rollback();
    console.error('Error updating challan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// 5. POST /api/challans/:id/confirm - Confirm Challan (Single DB Transaction + SELECT FOR UPDATE)
router.post('/:id/confirm', requireRole(['admin', 'sales']), async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const confirmedBy = req.user.id;

    // Start Transaction
    await client.query('BEGIN');

    // 1. Check and lock challan row
    const challanResult = await client.query(
      'SELECT status, challan_number FROM sales_challans WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (challanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Challan not found' });
    }

    const challan = challanResult.rows[0];
    if (challan.status !== 'draft') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot confirm challan: status is already '${challan.status}'`
      });
    }

    // 2. Fetch all challan items
    const itemsResult = await client.query(
      'SELECT product_id, quantity, product_name_snapshot FROM challan_items WHERE challan_id = $1',
      [id]
    );
    const items = itemsResult.rows;

    if (items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Challan must contain at least one line item to confirm.' });
    }

    // 3. Sort items by product_id to prevent deadlock when locking rows
    const sortedItems = [...items].sort((a, b) => a.product_id.localeCompare(b.product_id));

    // 4. Lock products and check stock availability
    for (const item of sortedItems) {
      const productResult = await client.query(
        'SELECT current_stock, name FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product snapshot matches an invalid product ID: '${item.product_id}'` });
      }

      const product = productResult.rows[0];

      if (product.current_stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Insufficient stock for product '${product.name}'. Available: ${product.current_stock}, Requested: ${item.quantity}`,
          details: {
            product_id: item.product_id,
            product_name: product.name,
            current_stock: product.current_stock,
            requested_quantity: item.quantity
          }
        });
      }
    }

    // 5. Success check passed: update stocks and insert movements
    for (const item of items) {
      // Decrement stock
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      // Insert OUT stock movement
      const smId = crypto.randomUUID();
      await client.query(
        `INSERT INTO stock_movements (id, product_id, quantity_changed, movement_type, reason, reference_type, reference_id, created_by)
         VALUES ($1, $2, $3, 'OUT', $4, 'challan', $5, $6)`,
        [smId, item.product_id, item.quantity, `Challan confirmed: ${challan.challan_number}`, id, confirmedBy]
      );
    }

    // 6. Update challan status
    await client.query(
      `UPDATE sales_challans 
       SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id]
    );

    // Commit Transaction
    await client.query('COMMIT');

    // Fetch and return updated details
    const result = await query(
      `SELECT sc.*, c.name as customer_name, c.business_name as customer_business_name
       FROM sales_challans sc
       LEFT JOIN customers c ON sc.customer_id = c.id
       WHERE sc.id = $1`,
      [id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    await client.rollback();
    console.error('Error confirming challan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// 6. POST /api/challans/:id/cancel - Cancel Challan (Reverses stock in IN movement if confirmed)
router.post('/:id/cancel', requireRole(['admin', 'sales']), async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const cancelledBy = req.user.id;

    // Start Transaction
    await client.query('BEGIN');

    // 1. Fetch and lock challan row
    const challanResult = await client.query(
      'SELECT status, challan_number FROM sales_challans WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (challanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Challan not found' });
    }

    const challan = challanResult.rows[0];
    if (challan.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Challan is already cancelled.' });
    }

    // Case A: Draft Challan -> Just cancel it
    if (challan.status === 'draft') {
      await client.query(
        "UPDATE sales_challans SET status = 'cancelled' WHERE id = $1",
        [id]
      );
      await client.query('COMMIT');

      const result = await query('SELECT * FROM sales_challans WHERE id = $1', [id]);
      return res.json(result.rows[0]);
    }

    // Case B: Confirmed Challan -> Reverse stock inventory OUTs with IN movements
    if (challan.status === 'confirmed') {
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM challan_items WHERE challan_id = $1',
        [id]
      );
      const items = itemsResult.rows;

      // Sort items by product_id to prevent deadlocks
      const sortedItems = [...items].sort((a, b) => a.product_id.localeCompare(b.product_id));

      for (const item of sortedItems) {
        // Lock and increment stock
        await client.query(
          'SELECT 1 FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        );

        await client.query(
          'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );

        // Log IN movement
        const smId = crypto.randomUUID();
        await client.query(
          `INSERT INTO stock_movements (id, product_id, quantity_changed, movement_type, reason, reference_type, reference_id, created_by)
           VALUES ($1, $2, $3, 'IN', $4, 'challan', $5, $6)`,
          [smId, item.product_id, item.quantity, 'Challan cancelled', id, cancelledBy]
        );
      }

      // Update status to cancelled
      await client.query(
        "UPDATE sales_challans SET status = 'cancelled' WHERE id = $1",
        [id]
      );

      await client.query('COMMIT');

      const result = await query(
        `SELECT sc.*, c.name as customer_name, c.business_name as customer_business_name
         FROM sales_challans sc
         LEFT JOIN customers c ON sc.customer_id = c.id
         WHERE sc.id = $1`,
         [id]
      );

      return res.json(result.rows[0]);
    }

    // Fallback
    await client.query('ROLLBACK');
    return res.status(400).json({ error: `Cannot cancel challan in state '${challan.status}'` });
  } catch (error) {
    await client.rollback();
    console.error('Error cancelling challan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;

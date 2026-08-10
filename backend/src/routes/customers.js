const { Router } = require('express');
const { query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { customerSchema, noteSchema } = require('../validators/customer');
const crypto = require('crypto');

const router = Router();

// Apply authentication middleware to all customer routes
router.use(authenticateToken);

// 1. GET /api/customers - List with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search;
    const status = req.query.status;
    const customerType = req.query.customer_type;

    let queryText = 'SELECT * FROM customers WHERE 1=1';
    let countQueryText = 'SELECT COUNT(*) as count FROM customers WHERE 1=1';
    const queryParams = [];

    if (search) {
      const searchWildcard = `%${search}%`;
      const idx = queryParams.length;
      queryText += ` AND (name ILIKE $${idx+1} OR business_name ILIKE $${idx+2} OR email ILIKE $${idx+3} OR mobile ILIKE $${idx+4})`;
      countQueryText += ` AND (name ILIKE $${idx+1} OR business_name ILIKE $${idx+2} OR email ILIKE $${idx+3} OR mobile ILIKE $${idx+4})`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    if (status) {
      queryText += ` AND status = $${queryParams.length + 1}`;
      countQueryText += ` AND status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (customerType) {
      queryText += ` AND customer_type = $${queryParams.length + 1}`;
      countQueryText += ` AND customer_type = $${queryParams.length + 1}`;
      queryParams.push(customerType);
    }

    // Get total count
    const countResult = await query(countQueryText, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination and sorting
    queryText += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/customers/:id - Get detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/customers - Create (Admin & Sales only)
router.post('/', requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const parseResult = customerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const val = parseResult.data;
    const email = val.email || null;
    const businessName = val.business_name || null;
    const gstNumber = val.gst_number || null;
    const address = val.address || null;
    const followUpDate = val.follow_up_date || null;

    const id = crypto.randomUUID();
    const insertResult = await query(
      `INSERT INTO customers (id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, val.name, val.mobile, email, businessName, gstNumber, val.customer_type, address, val.status, followUpDate]
    );

    return res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. PUT /api/customers/:id - Update (Admin & Sales only)
router.put('/:id', requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const { id } = req.params;
    const checkResult = await query('SELECT 1 FROM customers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const parseResult = customerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const val = parseResult.data;
    const email = val.email || null;
    const businessName = val.business_name || null;
    const gstNumber = val.gst_number || null;
    const address = val.address || null;
    const followUpDate = val.follow_up_date || null;

    const updateResult = await query(
      `UPDATE customers
       SET name = $1, mobile = $2, email = $3, business_name = $4, gst_number = $5, 
           customer_type = $6, address = $7, status = $8, follow_up_date = $9
       WHERE id = $10
       RETURNING *`,
      [val.name, val.mobile, email, businessName, gstNumber, val.customer_type, address, val.status, followUpDate, id]
    );

    return res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. DELETE /api/customers/:id - Delete (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const checkResult = await query('SELECT 1 FROM customers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await query('DELETE FROM customers WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. GET /api/customers/:id/notes - Get notes history
router.get('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if customer exists
    const customerCheck = await query('SELECT 1 FROM customers WHERE id = $1', [id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const notesResult = await query(
      `SELECT cn.id, cn.note, cn.created_at, u.name as created_by_name, u.role as created_by_role
       FROM customer_notes cn
       LEFT JOIN users u ON cn.created_by = u.id
       WHERE cn.customer_id = $1
       ORDER BY cn.created_at DESC`,
      [id]
    );

    return res.json(notesResult.rows);
  } catch (error) {
    console.error('Error fetching customer notes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. POST /api/customers/:id/notes - Add a note (Admin & Sales only)
router.post('/:id/notes', requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const { id } = req.params;
    // Check if customer exists
    const customerCheck = await query('SELECT 1 FROM customers WHERE id = $1', [id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const parseResult = noteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { note } = parseResult.data;
    const createdBy = req.user.id;

    const noteId = crypto.randomUUID();
    await query(
      `INSERT INTO customer_notes (id, customer_id, note, created_by)
       VALUES ($1, $2, $3, $4)`,
      [noteId, id, note, createdBy]
    );

    // Get note with author's name immediately for response
    const noteWithUser = await query(
      `SELECT cn.id, cn.note, cn.created_at, u.name as created_by_name, u.role as created_by_role
       FROM customer_notes cn
       LEFT JOIN users u ON cn.created_by = u.id
       WHERE cn.id = $1`,
      [noteId]
    );

    return res.status(201).json(noteWithUser.rows[0]);
  } catch (error) {
    console.error('Error creating customer note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

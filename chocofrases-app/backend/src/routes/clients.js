const router = require('express').Router();
const db     = require('../models/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  const { search, limit = 50, offset = 0 } = req.query;
  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE name ILIKE $1 OR business_name ILIKE $1 OR whatsapp_phone ILIKE $1';
    params.push(`%${search}%`);
  }
  params.push(parseInt(limit), parseInt(offset));
  const i = params.length;
  const result = await db.query(
    `SELECT * FROM clients ${where} ORDER BY total_orders DESC LIMIT $${i-1} OFFSET $${i}`,
    params
  );
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const client = (await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id])).rows[0];
  if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

  const orders = (await db.query(
    'SELECT * FROM orders WHERE client_id = $1 ORDER BY created_at DESC LIMIT 20',
    [req.params.id]
  )).rows;

  res.json({ ...client, orders });
});

router.put('/:id', async (req, res) => {
  const { name, business_name, address, zone, notes } = req.body;
  const result = await db.query(
    `UPDATE clients SET name=$1, business_name=$2, address=$3, zone=$4, notes=$5
     WHERE id=$6 RETURNING *`,
    [name, business_name, address, zone, notes, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(result.rows[0]);
});

module.exports = router;

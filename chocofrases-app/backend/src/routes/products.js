const router = require('express').Router();
const db     = require('../models/db');
const tg     = require('../services/telegram');
const config = require('../config');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  const { active } = req.query;
  let q = 'SELECT * FROM products';
  const params = [];
  if (active !== undefined) { q += ' WHERE active = $1'; params.push(active === 'true'); }
  q += ' ORDER BY category, name';
  res.json((await db.query(q, params)).rows);
});

router.post('/', requireRole('dueno'), async (req, res) => {
  const { sku, name, description, price, stock, unit, category, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nombre y precio requeridos' });
  const result = await db.query(
    `INSERT INTO products (sku, name, description, price, stock, unit, category, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [sku, name, description, price, stock || 0, unit || 'unidad', category, image_url]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', requireRole('dueno'), async (req, res) => {
  const { name, description, price, stock, unit, category, image_url, active } = req.body;
  const result = await db.query(
    `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, unit=$5,
     category=$6, image_url=$7, active=$8 WHERE id=$9 RETURNING *`,
    [name, description, price, stock, unit, category, image_url, active, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado' });

  // Check low stock
  const p = result.rows[0];
  if (p.stock <= config.business.lowStockThreshold && p.active) {
    await tg.notifyLowStock(p);
  }
  res.json(p);
});

router.patch('/:id/stock', requireRole('dueno', 'vendedor'), async (req, res) => {
  const { stock } = req.body;
  const result = await db.query(
    'UPDATE products SET stock = $1 WHERE id = $2 RETURNING *', [stock, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
  const p = result.rows[0];
  if (p.stock <= config.business.lowStockThreshold) await tg.notifyLowStock(p);
  res.json(p);
});

router.delete('/:id', requireRole('dueno'), async (req, res) => {
  await db.query('UPDATE products SET active = FALSE WHERE id = $1', [req.params.id]);
  res.json({ message: 'Producto desactivado' });
});

module.exports = router;

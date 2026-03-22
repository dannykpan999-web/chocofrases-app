const router = require('express').Router();
const bcrypt = require('bcrypt');
const db     = require('../models/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('dueno'));

router.get('/', async (req, res) => {
  const result = await db.query(
    'SELECT id, name, email, role, active, created_at FROM users ORDER BY name'
  );
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Datos incompletos' });
  const hash = await bcrypt.hash(password, 12);
  const result = await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
    [name, email, hash, role || 'vendedor']
  );
  res.status(201).json(result.rows[0]);
});

router.patch('/:id/active', async (req, res) => {
  const result = await db.query(
    'UPDATE users SET active = $1 WHERE id = $2 RETURNING id,name,active',
    [req.body.active, req.params.id]
  );
  res.json(result.rows[0]);
});

module.exports = router;

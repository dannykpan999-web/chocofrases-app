const router   = require('express').Router();
const db       = require('../models/db');
const airtable = require('../services/airtable');
const { authenticate, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// ─── GET /orders ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { status, limit = 50, offset = 0, search } = req.query;
  let where = [];
  let params = [];
  let i = 1;

  if (status) { where.push(`o.status = $${i++}`); params.push(status); }
  if (search) {
    where.push(`(c.name ILIKE $${i} OR c.business_name ILIKE $${i} OR c.whatsapp_phone ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const query = `
    SELECT o.*, c.name AS client_name, c.business_name, c.whatsapp_phone,
           json_agg(json_build_object('product_name', oi.product_name, 'quantity', oi.quantity, 'subtotal', oi.subtotal)) AS items
    FROM orders o
    JOIN clients c ON c.id = o.client_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    ${whereClause}
    GROUP BY o.id, c.name, c.business_name, c.whatsapp_phone
    ORDER BY o.created_at DESC
    LIMIT $${i} OFFSET $${i+1}
  `;
  params.push(parseInt(limit), parseInt(offset));
  const result = await db.query(query, params);
  res.json(result.rows);
});

// ─── GET /orders/stats ────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const { period = 'today' } = req.query;
  let dateFilter = "created_at >= NOW() - INTERVAL '1 day'";
  if (period === 'week')  dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
  if (period === 'month') dateFilter = "created_at >= NOW() - INTERVAL '30 days'";

  const [totals, byStatus, topProducts, dailySales] = await Promise.all([
    db.query(`SELECT COUNT(*) AS total, SUM(total) AS revenue FROM orders WHERE ${dateFilter}`),
    db.query(`SELECT status, COUNT(*) AS count FROM orders WHERE ${dateFilter} GROUP BY status`),
    db.query(`
      SELECT oi.product_name, SUM(oi.quantity) AS total_qty, SUM(oi.subtotal) AS total_revenue
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.${dateFilter}
      GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 5
    `),
    db.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS orders, SUM(total) AS revenue
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at) ORDER BY date
    `),
  ]);

  res.json({
    totals:      totals.rows[0],
    byStatus:    byStatus.rows,
    topProducts: topProducts.rows,
    dailySales:  dailySales.rows,
  });
});

// ─── GET /orders/:id ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const result = await db.query(
    `SELECT o.*, c.name AS client_name, c.business_name, c.whatsapp_phone, c.address,
            json_agg(row_to_json(oi)) AS items
     FROM orders o
     JOIN clients c ON c.id = o.client_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1 GROUP BY o.id, c.name, c.business_name, c.whatsapp_phone, c.address`,
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
  res.json(result.rows[0]);
});

// ─── PATCH /orders/:id/status ─────────────────────────────────
router.patch('/:id/status', requireRole('dueno', 'vendedor'), async (req, res) => {
  const { status } = req.body;
  const valid = ['nuevo','aprobado','en_preparacion','listo','enviado','entregado','cancelado'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' });

  const result = await db.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });

  const order = result.rows[0];
  await airtable.updateOrderStatus(order.airtable_id, status);

  // Emit via socket
  req.app.get('io')?.emit('order_updated', { id: order.id, status });

  res.json(order);
});

// ─── POST /orders/broadcast ───────────────────────────────────
router.post('/broadcast', requireRole('dueno'), async (req, res) => {
  const { title, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

  const broadcastRes = await db.query(
    'INSERT INTO broadcasts (title, message, status, sent_by) VALUES ($1, $2, $3, $4) RETURNING *',
    [title || 'Promoción', message, 'enviando', req.user.id]
  );
  const broadcast = broadcastRes.rows[0];

  // Send async
  const wa = require('../services/whatsapp');
  const clients = await db.query(
    "SELECT whatsapp_phone FROM clients WHERE active = TRUE AND total_orders > 0"
  );

  let sent = 0, failed = 0;
  for (const c of clients.rows) {
    try {
      await wa.sendText(c.whatsapp_phone, message);
      sent++;
      await new Promise(r => setTimeout(r, 500)); // rate limit
    } catch {
      failed++;
    }
  }

  await db.query(
    "UPDATE broadcasts SET status = 'enviado', total_sent = $1, total_failed = $2, sent_at = NOW() WHERE id = $3",
    [sent, failed, broadcast.id]
  );

  res.json({ message: `Broadcast enviado a ${sent} clientes`, sent, failed });
});

module.exports = router;

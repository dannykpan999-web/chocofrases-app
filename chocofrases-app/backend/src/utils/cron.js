const cron   = require('node-cron');
const db     = require('../models/db');
const tg     = require('../services/telegram');
const logger = require('./logger');

const startCronJobs = () => {
  // Daily report at 20:00
  cron.schedule('0 20 * * *', async () => {
    try {
      const [totals, byStatus, topProducts] = await Promise.all([
        db.query(`SELECT COUNT(*) AS total_orders, COALESCE(SUM(total),0) AS total_sales
                  FROM orders WHERE created_at >= CURRENT_DATE`),
        db.query(`SELECT status, COUNT(*) AS count FROM orders
                  WHERE created_at >= CURRENT_DATE GROUP BY status`),
        db.query(`SELECT oi.product_name AS name, SUM(oi.quantity) AS qty
                  FROM order_items oi JOIN orders o ON o.id = oi.order_id
                  WHERE o.created_at >= CURRENT_DATE
                  GROUP BY oi.product_name ORDER BY qty DESC LIMIT 5`),
      ]);

      const statusMap = {};
      byStatus.rows.forEach(r => { statusMap[r.status] = parseInt(r.count); });

      await tg.sendDailyReport({
        total_orders: parseInt(totals.rows[0].total_orders),
        total_sales:  totals.rows[0].total_sales,
        delivered:    statusMap['entregado'] || 0,
        in_progress:  (statusMap['en_preparacion'] || 0) + (statusMap['aprobado'] || 0),
        cancelled:    statusMap['cancelado'] || 0,
        top_products: topProducts.rows,
      });
    } catch (err) {
      logger.error('Daily report cron error:', err);
    }
  }, { timezone: 'America/Argentina/Cordoba' });

  // Check low stock every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      const lowStock = await db.query(
        'SELECT * FROM products WHERE active = TRUE AND stock <= $1',
        [require('../config').business.lowStockThreshold]
      );
      for (const p of lowStock.rows) {
        await tg.notifyLowStock(p);
      }
    } catch (err) {
      logger.error('Low stock cron error:', err);
    }
  });

  logger.info('Cron jobs started');
};

module.exports = { startCronJobs };

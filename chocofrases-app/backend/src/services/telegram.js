const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const BASE = `https://api.telegram.org/bot${config.telegram.botToken}`;

// ─── Send message with optional inline keyboard ───────────────
const sendMessage = async (text, keyboard = null, chatId = config.telegram.chatId) => {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  if (keyboard) {
    body.reply_markup = { inline_keyboard: keyboard };
  }
  try {
    const res = await axios.post(`${BASE}/sendMessage`, body);
    return res.data.result;
  } catch (err) {
    logger.error('Telegram sendMessage error:', err.response?.data || err.message);
  }
};

// ─── Answer callback query (acknowledge button press) ─────────
const answerCallback = async (callbackQueryId, text = '') => {
  try {
    await axios.post(`${BASE}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      text,
    });
  } catch (err) {
    logger.warn('Telegram answerCallback error:', err.message);
  }
};

// ─── Edit message text (after approval/rejection) ─────────────
const editMessage = async (chatId, messageId, text) => {
  try {
    await axios.post(`${BASE}/editMessageText`, {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    });
  } catch (err) {
    logger.warn('Telegram editMessage error:', err.message);
  }
};

// ─── New order notification ───────────────────────────────────
const notifyNewOrder = async (order, client, items) => {
  const itemLines = items.map(i =>
    `  • ${i.product_name} x${i.quantity} = $${i.subtotal.toLocaleString('es-AR')}`
  ).join('\n');

  const text = `🍫 <b>NUEVO PEDIDO #${order.order_number}</b>\n\n` +
    `👤 <b>Cliente:</b> ${client.name || client.whatsapp_phone}\n` +
    `📱 <b>Tel:</b> ${client.whatsapp_phone}\n` +
    `📦 <b>Canal:</b> ${order.input_type?.toUpperCase()}\n\n` +
    `<b>Productos:</b>\n${itemLines}\n\n` +
    `💰 <b>Total: $${Number(order.total).toLocaleString('es-AR')}</b>`;

  const keyboard = [[
    { text: '✅ Aprobar', callback_data: `approve:${order.id}` },
    { text: '❌ Rechazar', callback_data: `reject:${order.id}` },
  ]];

  return sendMessage(text, keyboard);
};

// ─── Stock alert ──────────────────────────────────────────────
const notifyLowStock = async (product) => {
  const text = `⚠️ <b>STOCK BAJO</b>\n\n` +
    `Producto: <b>${product.name}</b>\n` +
    `Stock actual: <b>${product.stock} ${product.unit}</b>\n` +
    `Umbral mínimo: ${config.business.lowStockThreshold}\n\n` +
    `Recordá reponer stock en el sistema.`;
  return sendMessage(text);
};

// ─── Daily sales report ───────────────────────────────────────
const sendDailyReport = async (stats) => {
  const text = `📊 <b>RESUMEN DEL DÍA</b>\n\n` +
    `📦 Pedidos: <b>${stats.total_orders}</b>\n` +
    `💰 Ventas: <b>$${Number(stats.total_sales).toLocaleString('es-AR')}</b>\n` +
    `✅ Entregados: ${stats.delivered}\n` +
    `🔄 En preparación: ${stats.in_progress}\n` +
    `❌ Cancelados: ${stats.cancelled}\n\n` +
    `<b>Top productos:</b>\n${stats.top_products.map(p => `  • ${p.name}: ${p.qty}`).join('\n')}`;
  return sendMessage(text);
};

module.exports = { sendMessage, answerCallback, editMessage, notifyNewOrder, notifyLowStock, sendDailyReport };

const db        = require('../models/db');
const redis      = require('../models/redis');
const wa         = require('./whatsapp');
const ai         = require('./openai');
const tg         = require('./telegram');
const pdfSvc     = require('./pdf');
const driveSvc   = require('./drive');
const airtable   = require('./airtable');
const config     = require('../config');
const logger     = require('../utils/logger');

// ─── Get or create client ────────────────────────────────────
const upsertClient = async (phone) => {
  const existing = await db.query(
    'SELECT * FROM clients WHERE whatsapp_phone = $1', [phone]
  );
  if (existing.rows.length > 0) return { client: existing.rows[0], isNew: false };

  const created = await db.query(
    'INSERT INTO clients (whatsapp_phone) VALUES ($1) RETURNING *', [phone]
  );
  return { client: created.rows[0], isNew: true };
};

// ─── Get active products ─────────────────────────────────────
const getActiveProducts = async () => {
  const res = await db.query('SELECT * FROM products WHERE active = TRUE ORDER BY category, name');
  return res.rows;
};

// ─── Format product catalog for WhatsApp message ─────────────
const formatCatalog = (products) => {
  const byCategory = {};
  products.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });
  let msg = '📋 *Nuestro catálogo:*\n\n';
  for (const [cat, prods] of Object.entries(byCategory)) {
    msg += `*${cat}*\n`;
    prods.forEach(p => {
      msg += `  • ${p.name} — $${Number(p.price).toLocaleString('es-AR')}\n`;
    });
    msg += '\n';
  }
  msg += 'Escribime qué querés pedir y te confirmo el total 🍫';
  return msg;
};

// ─── Check business hours ────────────────────────────────────
const isBusinessHours = () => {
  const h = new Date().getHours();
  return h >= config.business.attendanceStartHour && h < config.business.attendanceEndHour;
};

// ─── Save order and items to DB ───────────────────────────────
const saveOrder = async (clientId, parsed, inputType, rawMessage) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders (client_id, input_type, raw_message, ai_transcript, total, status)
       VALUES ($1, $2, $3, $4, $5, 'nuevo') RETURNING *`,
      [clientId, inputType, rawMessage, parsed.summary, parsed.total]
    );
    const order = orderRes.rows[0];

    for (const item of parsed.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id || null, item.product_name, item.quantity, item.unit_price, item.subtotal || item.quantity * item.unit_price]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─── Generate and upload remito ──────────────────────────────
const generateAndUploadRemito = async (order, client, items) => {
  const remitoNum = await db.query("SELECT nextval('remito_seq') AS num");
  const num = remitoNum.rows[0].num;

  await db.query('UPDATE orders SET remito_number = $1 WHERE id = $2', [num, order.id]);
  order.remito_number = num;

  const pdfBuffer = await pdfSvc.generateRemito(order, client, items);
  const filename  = `remito_${String(num).padStart(8, '0')}_${client.whatsapp_phone}.pdf`;
  const uploaded  = await driveSvc.uploadRemito(pdfBuffer, filename);

  if (uploaded) {
    await db.query(
      'UPDATE orders SET remito_url = $1, drive_file_id = $2 WHERE id = $3',
      [uploaded.url, uploaded.fileId, order.id]
    );
    order.remito_url = uploaded.url;
  }
  return order;
};

// ─── MAIN MESSAGE HANDLER ────────────────────────────────────
const handleMessage = async (phone, message, io) => {
  const { client, isNew } = await upsertClient(phone);
  let state = await redis.getConvState(phone) || { step: 'idle' };

  logger.info(`[${phone}] step=${state.step} type=${message.type}`);

  // Mark as read
  if (message.id) await wa.markRead(message.id);

  // ── Flow 10: outside business hours ──────────────────────
  if (!isBusinessHours() && state.step === 'idle') {
    await wa.sendText(phone,
      `¡Hola! 🍫 Por el momento estamos fuera de horario.\n` +
      `Atendemos de ${config.business.attendanceStartHour}:00 a ${config.business.attendanceEndHour}:00 hs.\n` +
      `Tu mensaje quedó registrado y te contactamos cuando abramos. ¡Gracias!`
    );
    // Log message for morning review
    await db.query(
      'INSERT INTO conversation_logs (phone, direction, message_type, content) VALUES ($1, $2, $3, $4)',
      [phone, 'inbound', message.type, message.text?.body || '[media]']
    );
    return;
  }

  // ── Flow 2: new client onboarding ─────────────────────────
  if (isNew) {
    await wa.sendText(phone,
      `¡Hola! 👋 Bienvenido/a a *${config.business.name}* 🍫\n` +
      `¿Cuál es tu nombre o el nombre de tu negocio? Así te registro en nuestro sistema.`
    );
    await redis.setConvState(phone, { step: 'awaiting_name', clientId: client.id });
    return;
  }

  // ── Collect new client name ───────────────────────────────
  if (state.step === 'awaiting_name' && message.type === 'text') {
    const name = message.text.body.trim();
    await db.query('UPDATE clients SET name = $1 WHERE id = $2', [name, client.id]);
    const atId = await airtable.syncClient({ ...client, name });
    await db.query('UPDATE clients SET airtable_id = $1 WHERE id = $2', [atId, client.id]);
    await wa.sendText(phone,
      `¡Perfecto, ${name}! 😊 Ya quedás registrado/a.\n\n` +
      formatCatalog(await getActiveProducts())
    );
    await redis.setConvState(phone, { step: 'browsing', clientId: client.id });
    return;
  }

  // ── Flow 7: order status query ─────────────────────────────
  const lowerText = message.type === 'text' ? message.text.body.toLowerCase() : '';
  if (lowerText.includes('estado') || lowerText.includes('mi pedido') || lowerText.includes('cuando llega')) {
    const lastOrder = await db.query(
      `SELECT o.*, array_agg(i.product_name || ' x' || i.quantity) AS items
       FROM orders o JOIN order_items i ON i.order_id = o.id
       WHERE o.client_id = $1 ORDER BY o.created_at DESC LIMIT 1
       GROUP BY o.id`,
      [client.id]
    );
    if (lastOrder.rows.length === 0) {
      await wa.sendText(phone, 'No tenés pedidos registrados todavía. ¿Querés hacer uno? 🍫');
    } else {
      const o = lastOrder.rows[0];
      const statusMap = {
        nuevo: 'recibido ✅', aprobado: 'aprobado ✅', en_preparacion: 'en preparación 🔄',
        listo: 'listo para enviar 📦', enviado: 'enviado 🚚', entregado: 'entregado ✅', cancelado: 'cancelado ❌'
      };
      await wa.sendText(phone,
        `📦 *Pedido #${o.order_number}*\n` +
        `Estado: *${statusMap[o.status] || o.status}*\n` +
        `Productos: ${o.items?.join(', ')}\n` +
        `Total: $${Number(o.total).toLocaleString('es-AR')}`
      );
    }
    return;
  }

  // ── Flow 5: price/availability query ──────────────────────
  if (lowerText.includes('precio') || lowerText.includes('cuanto sale') || lowerText.includes('disponible') || lowerText.includes('catalogo')) {
    await wa.sendText(phone, formatCatalog(await getActiveProducts()));
    return;
  }

  // ── Flow 6: cancel/modify order ───────────────────────────
  if ((lowerText.includes('cancelar') || lowerText.includes('cambiar')) && state.step === 'confirming') {
    await redis.clearConvState(phone);
    await wa.sendText(phone, 'Pedido cancelado. ¿Querés hacer uno nuevo o necesitás algo más? 😊');
    return;
  }

  // ── Confirmation step ─────────────────────────────────────
  if (state.step === 'confirming') {
    if (lowerText.includes('si') || lowerText.includes('sí') || lowerText.includes('confirmo') || lowerText.includes('dale')) {
      // Save order
      const order = await saveOrder(client.id, state.parsed, state.inputType, state.rawMessage);
      const items = (await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id])).rows;

      // Notify Telegram for approval (Flow 8)
      const tgMsg = await tg.notifyNewOrder(order, client, items);
      if (tgMsg?.message_id) {
        await db.query('UPDATE orders SET telegram_msg_id = $1 WHERE id = $2', [tgMsg.message_id, order.id]);
      }

      // Sync Airtable
      const atId = await airtable.syncOrder(order, client, items);
      if (atId) await db.query('UPDATE orders SET airtable_id = $1 WHERE id = $2', [atId, order.id]);

      // Emit to dashboard via Socket.io
      if (io) io.emit('new_order', { ...order, client, items });

      await wa.sendText(phone,
        `✅ *¡Pedido #${order.order_number} confirmado!*\n\n` +
        `${items.map(i => `• ${i.product_name} x${i.quantity}`).join('\n')}\n\n` +
        `💰 *Total: $${Number(order.total).toLocaleString('es-AR')}*\n\n` +
        `En breve te confirmamos el tiempo de entrega. ¡Gracias! 🍫`
      );

      // Check low stock
      for (const item of items) {
        if (item.product_id) {
          const prod = await db.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
          if (prod.rows[0] && prod.rows[0].stock <= config.business.lowStockThreshold) {
            await tg.notifyLowStock(prod.rows[0]);
          }
        }
      }

      await redis.clearConvState(phone);
      return;
    }
    // Not confirmed
    await redis.clearConvState(phone);
    await wa.sendText(phone, 'Entendido, pedido cancelado. ¿Necesitás algo más? 😊');
    return;
  }

  // ── Process incoming message (text / audio / image) ───────
  let extractedText = '';
  let inputType = 'texto';

  if (message.type === 'text') {
    extractedText = message.text.body;
    inputType = 'texto';
  } else if (message.type === 'audio') {
    await wa.sendText(phone, '🎧 Escuché tu audio, lo estoy procesando...');
    const { buffer, mimeType } = await wa.downloadMedia(message.audio.id);
    extractedText = await ai.transcribeAudio(buffer, mimeType);
    inputType = 'audio';
  } else if (message.type === 'image') {
    await wa.sendText(phone, '📷 Recibí tu foto, la estoy leyendo...');
    const { buffer, mimeType } = await wa.downloadMedia(message.image.id);
    extractedText = await ai.extractFromImage(buffer, mimeType);
    inputType = 'foto';
  } else {
    await wa.sendText(phone, 'Por ahora solo puedo procesar texto, audios e imágenes 😊');
    return;
  }

  const products = await getActiveProducts();
  const parsed   = await ai.parseOrder(extractedText, products);

  if (!parsed.items || parsed.items.length === 0) {
    // Try FAQ
    const answer = await ai.answerFaq(extractedText);
    await wa.sendText(phone, answer);
    return;
  }

  // Show confirmation
  const itemLines = parsed.items.map(i =>
    `  • ${i.product_name} x${i.quantity} = $${(i.quantity * i.unit_price).toLocaleString('es-AR')}`
  ).join('\n');

  let unknownMsg = '';
  if (parsed.unknown_items?.length) {
    unknownMsg = `\n\n⚠️ No pude identificar: _${parsed.unknown_items.join(', ')}_`;
  }

  await wa.sendText(phone,
    `📝 *Entendí este pedido:*\n\n${itemLines}\n\n` +
    `💰 *Total estimado: $${Number(parsed.total).toLocaleString('es-AR')}*${unknownMsg}\n\n` +
    `¿Confirmás? Respondé *SÍ* para confirmar o *NO* para cancelar.`
  );

  await redis.setConvState(phone, {
    step: 'confirming',
    parsed,
    inputType,
    rawMessage: extractedText,
    clientId: client.id,
  });
};

// ─── Handle Telegram callback (approve / reject) ──────────────
const handleTelegramCallback = async (callbackQuery, io) => {
  const { id: callbackId, data, message } = callbackQuery;
  const [action, orderId] = data.split(':');

  const orderRes = await db.query(
    `SELECT o.*, c.whatsapp_phone, c.name AS client_name, c.business_name
     FROM orders o JOIN clients c ON c.id = o.client_id
     WHERE o.id = $1`, [orderId]
  );
  if (!orderRes.rows.length) {
    await tg.answerCallback(callbackId, 'Pedido no encontrado');
    return;
  }
  const order  = orderRes.rows[0];
  const items  = (await db.query('SELECT * FROM order_items WHERE order_id = $1', [orderId])).rows;
  const phone  = order.whatsapp_phone;

  if (action === 'approve') {
    await db.query("UPDATE orders SET status = 'aprobado', approved_at = NOW() WHERE id = $1", [orderId]);

    // Generate remito
    const updatedOrder = await generateAndUploadRemito(order, { whatsapp_phone: phone, name: order.client_name, business_name: order.business_name }, items);

    // Notify client
    await wa.sendText(phone,
      `✅ *Pedido #${order.order_number} aprobado!*\n` +
      `Tu remito ya está listo. En breve recibís la confirmación de envío.`
    );
    if (updatedOrder.remito_url) {
      await wa.sendDocument(phone, updatedOrder.remito_url, `Remito_${order.order_number}.pdf`, 'Tu remito 🍫');
    }

    await tg.answerCallback(callbackId, '✅ Pedido aprobado');
    await tg.editMessage(message.chat.id, message.message_id,
      message.text + '\n\n✅ <b>APROBADO</b>'
    );

    await airtable.updateOrderStatus(order.airtable_id, 'aprobado');
    if (io) io.emit('order_updated', { id: orderId, status: 'aprobado' });

  } else if (action === 'reject') {
    await db.query("UPDATE orders SET status = 'cancelado' WHERE id = $1", [orderId]);
    await wa.sendText(phone,
      `❌ Lo sentimos, el pedido #${order.order_number} no pudo procesarse en este momento.\n` +
      `Comunicate con nosotros para más información. 📞`
    );
    await tg.answerCallback(callbackId, '❌ Pedido rechazado');
    await tg.editMessage(message.chat.id, message.message_id,
      message.text + '\n\n❌ <b>RECHAZADO</b>'
    );
    await airtable.updateOrderStatus(order.airtable_id, 'cancelado');
    if (io) io.emit('order_updated', { id: orderId, status: 'cancelado' });
  }
};

module.exports = { handleMessage, handleTelegramCallback };

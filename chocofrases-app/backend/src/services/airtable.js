const Airtable = require('airtable');
const config   = require('../config');
const logger   = require('../utils/logger');

const base = new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

const syncOrder = async (order, client, items) => {
  try {
    const fields = {
      'Número':        order.order_number,
      'Estado':        order.status,
      'Cliente':       client.business_name || client.name || client.whatsapp_phone,
      'Teléfono':      client.whatsapp_phone,
      'Total':         Number(order.total),
      'Productos':     items.map(i => `${i.product_name} x${i.quantity}`).join(', '),
      'Canal':         order.input_type,
      'Remito N°':     order.remito_number || '',
      'Fecha':         new Date(order.created_at).toISOString().split('T')[0],
    };

    if (order.airtable_id) {
      await base(config.airtable.ordersTable).update(order.airtable_id, fields);
      return order.airtable_id;
    } else {
      const rec = await base(config.airtable.ordersTable).create(fields);
      return rec.id;
    }
  } catch (err) {
    logger.error('Airtable syncOrder error:', err.message);
    return null;
  }
};

const syncClient = async (client) => {
  try {
    const fields = {
      'Nombre':        client.name || '',
      'Negocio':       client.business_name || '',
      'Teléfono':      client.whatsapp_phone,
      'Dirección':     client.address || '',
      'Zona':          client.zone || '',
      'Total pedidos': client.total_orders,
      'Total gastado': Number(client.total_spent),
    };

    if (client.airtable_id) {
      await base(config.airtable.clientsTable).update(client.airtable_id, fields);
      return client.airtable_id;
    } else {
      const rec = await base(config.airtable.clientsTable).create(fields);
      return rec.id;
    }
  } catch (err) {
    logger.error('Airtable syncClient error:', err.message);
    return null;
  }
};

const updateOrderStatus = async (airtableId, status) => {
  if (!airtableId) return;
  try {
    await base(config.airtable.ordersTable).update(airtableId, { 'Estado': status });
  } catch (err) {
    logger.warn('Airtable updateOrderStatus error:', err.message);
  }
};

module.exports = { syncOrder, syncClient, updateOrderStatus };

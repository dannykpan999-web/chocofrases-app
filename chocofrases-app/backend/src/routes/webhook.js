const router    = require('express').Router();
const config    = require('../config');
const logger    = require('../utils/logger');
const processor = require('../services/orderProcessor');
const { checkSignature } = require('../middleware/whatsappVerify');

let _io = null;
const setIo = (io) => { _io = io; };

// ─── WhatsApp webhook verification (GET) ─────────────────────
router.get('/whatsapp', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    logger.info('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── WhatsApp webhook events (POST) ──────────────────────────
router.post('/whatsapp', checkSignature, async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value  = change?.value;

    if (!value?.messages?.length) return;

    const message = value.messages[0];
    const phone   = message.from;

    await processor.handleMessage(phone, message, _io);
  } catch (err) {
    logger.error('Webhook processing error:', err);
  }
});

// ─── Telegram webhook (POST) ──────────────────────────────────
router.post('/telegram', async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body;
    if (body.callback_query) {
      await processor.handleTelegramCallback(body.callback_query, _io);
    }
  } catch (err) {
    logger.error('Telegram webhook error:', err);
  }
});

module.exports = { router, setIo };

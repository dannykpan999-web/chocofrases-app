const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const BASE = `${config.whatsapp.apiUrl}/${config.whatsapp.phoneNumberId}/messages`;

const headers = () => ({
  Authorization: `Bearer ${config.whatsapp.token}`,
  'Content-Type': 'application/json',
});

// ─── Send text message ────────────────────────────────────────
const sendText = async (to, text) => {
  try {
    const res = await axios.post(BASE, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text, preview_url: false },
    }, { headers: headers() });
    return res.data;
  } catch (err) {
    logger.error(`WhatsApp sendText error to ${to}:`, err.response?.data || err.message);
    throw err;
  }
};

// ─── Send document (PDF) ─────────────────────────────────────
const sendDocument = async (to, url, filename, caption = '') => {
  try {
    const res = await axios.post(BASE, {
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: { link: url, filename, caption },
    }, { headers: headers() });
    return res.data;
  } catch (err) {
    logger.error(`WhatsApp sendDocument error to ${to}:`, err.response?.data || err.message);
    throw err;
  }
};

// ─── Send template (for broadcast / re-engagement) ───────────
const sendTemplate = async (to, templateName, languageCode = 'es', components = []) => {
  try {
    const res = await axios.post(BASE, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: languageCode }, components },
    }, { headers: headers() });
    return res.data;
  } catch (err) {
    logger.error(`WhatsApp sendTemplate error to ${to}:`, err.response?.data || err.message);
    throw err;
  }
};

// ─── Mark message as read ────────────────────────────────────
const markRead = async (messageId) => {
  try {
    await axios.post(BASE.replace('/messages', '/messages'), {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }, { headers: headers() });
  } catch (err) {
    logger.warn('markRead error:', err.response?.data || err.message);
  }
};

// ─── Download media (audio, image) ───────────────────────────
const downloadMedia = async (mediaId) => {
  // Step 1: get media URL
  const urlRes = await axios.get(
    `${config.whatsapp.apiUrl}/${mediaId}`,
    { headers: headers() }
  );
  const mediaUrl = urlRes.data.url;

  // Step 2: download binary
  const mediaRes = await axios.get(mediaUrl, {
    headers: headers(),
    responseType: 'arraybuffer',
  });
  return {
    buffer: Buffer.from(mediaRes.data),
    mimeType: urlRes.data.mime_type,
  };
};

module.exports = { sendText, sendDocument, sendTemplate, markRead, downloadMedia };

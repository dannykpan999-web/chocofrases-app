const crypto = require('crypto');
const config  = require('../config');

// Verify X-Hub-Signature-256 from WhatsApp webhook
const verifySignature = (req, res, buf) => {
  req.rawBody = buf;
};

const checkSignature = (req, res, next) => {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return res.sendStatus(403);

  const expected = 'sha256=' + crypto
    .createHmac('sha256', config.whatsapp.token)
    .update(req.rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.sendStatus(403);
  }
  next();
};

module.exports = { verifySignature, checkSignature };

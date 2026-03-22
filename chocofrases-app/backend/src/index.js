require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const { verifySignature } = require('./middleware/whatsappVerify');
const config     = require('./config');
const logger     = require('./utils/logger');
const { startCronJobs } = require('./utils/cron');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: config.frontendUrl, methods: ['GET', 'POST'] }
});

app.set('io', io);

// ─── Security middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// WhatsApp webhook needs raw body for signature verification
app.use('/webhooks/whatsapp', express.raw({ type: 'application/json', verify: verifySignature }));
app.use('/webhooks/whatsapp', (req, res, next) => {
  try { req.body = JSON.parse(req.rawBody); } catch {}
  next();
});

app.use(express.json());

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true }));

// ─── Routes ───────────────────────────────────────────────────
const webhookModule = require('./routes/webhook');
webhookModule.setIo(io);
app.use('/webhooks', webhookModule.router);

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/clients',  require('./routes/clients'));
app.use('/api/users',    require('./routes/users'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Socket.io ───────────────────────────────────────────────
io.on('connection', (socket) => {
  logger.info(`Dashboard connected: ${socket.id}`);
  socket.on('disconnect', () => logger.info(`Dashboard disconnected: ${socket.id}`));
});

// ─── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Start ───────────────────────────────────────────────────
server.listen(config.port, () => {
  logger.info(`Chocofrases API running on port ${config.port} [${config.nodeEnv}]`);
  startCronJobs();
});

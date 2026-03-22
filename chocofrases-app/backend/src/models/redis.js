const { createClient } = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

const client = createClient({ url: config.redis.url });

client.on('error', (err) => logger.error('Redis error:', err));
client.on('connect', () => logger.info('Redis connected'));

const connect = async () => {
  if (!client.isOpen) await client.connect();
};

// Conversation state TTL: 30 minutes
const CONV_TTL = 1800;

const getConvState = async (phone) => {
  await connect();
  const data = await client.get(`conv:${phone}`);
  return data ? JSON.parse(data) : null;
};

const setConvState = async (phone, state) => {
  await connect();
  await client.setEx(`conv:${phone}`, CONV_TTL, JSON.stringify(state));
};

const clearConvState = async (phone) => {
  await connect();
  await client.del(`conv:${phone}`);
};

// Session cache
const setSession = async (key, value, ttlSeconds = 3600) => {
  await connect();
  await client.setEx(`session:${key}`, ttlSeconds, JSON.stringify(value));
};

const getSession = async (key) => {
  await connect();
  const data = await client.get(`session:${key}`);
  return data ? JSON.parse(data) : null;
};

const delSession = async (key) => {
  await connect();
  await client.del(`session:${key}`);
};

module.exports = { connect, getConvState, setConvState, clearConvState, setSession, getSession, delSession };

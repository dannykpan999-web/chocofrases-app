require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  whatsapp: {
    token:           process.env.WHATSAPP_TOKEN,
    verifyToken:     process.env.WHATSAPP_VERIFY_TOKEN,
    phoneNumberId:   process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiUrl:          'https://graph.facebook.com/v19.0',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId:   process.env.TELEGRAM_CHAT_ID,
  },

  airtable: {
    apiKey:         process.env.AIRTABLE_API_KEY,
    baseId:         process.env.AIRTABLE_BASE_ID,
    ordersTable:    process.env.AIRTABLE_ORDERS_TABLE    || 'Pedidos',
    clientsTable:   process.env.AIRTABLE_CLIENTS_TABLE   || 'Clientes',
    productsTable:  process.env.AIRTABLE_PRODUCTS_TABLE  || 'Productos',
  },

  google: {
    serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    driveFolderId:      process.env.GOOGLE_DRIVE_FOLDER_ID,
  },

  jwt: {
    secret:    process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  business: {
    name:            process.env.BUSINESS_NAME        || 'Chocofrases',
    phone:           process.env.BUSINESS_PHONE,
    email:           process.env.BUSINESS_EMAIL,
    address:         process.env.BUSINESS_ADDRESS,
    lowStockThreshold:       parseInt(process.env.LOW_STOCK_THRESHOLD || '5'),
    approvalTimeoutMinutes:  parseInt(process.env.ORDER_APPROVAL_TIMEOUT_MINUTES || '10'),
    attendanceStartHour:     parseInt(process.env.ATTENDANCE_START_HOUR || '8'),
    attendanceEndHour:       parseInt(process.env.ATTENDANCE_END_HOUR   || '20'),
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

const jwt    = require('jsonwebtoken');
const config = require('../config');

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), config.jwt.secret);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Sin permisos' });
  }
  next();
};

module.exports = { authenticate, requireRole };

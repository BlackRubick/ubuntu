const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');

const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'Usuario no encontrado' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  console.log('Rol recibido en authorize:', req.user?.role, 'Roles permitidos:', roles);
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};

module.exports = { authenticate, authorize };
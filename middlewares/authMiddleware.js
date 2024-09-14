const jwt = require('jsonwebtoken');
const hashedSecret = require('../crypto/config');

function verifyToken(req, res, next) {
  const token = req.session.token;
  
  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, hashedSecret);
    req.user = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = verifyToken;

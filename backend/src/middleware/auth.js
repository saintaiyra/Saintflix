const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obter token do header Authorization
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido, autorização negada' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
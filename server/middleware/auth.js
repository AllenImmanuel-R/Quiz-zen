const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req, res, next) {
  // Get token from header
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = auth.split(' ')[1];
  
  try {
    // Verify token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.userId = payload.id || payload._id;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
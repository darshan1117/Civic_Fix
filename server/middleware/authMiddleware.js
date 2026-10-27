import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized: No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'civicfix_jwt_secret_key_2026_secure';
    const decoded = jwt.verify(token, secret);

    // Attach user to req
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // In case in-memory / fallback was used
      req.user = decoded;
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized: Token verification failed.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access requires role of [${roles.join(', ')}].`,
      });
    }
    next();
  };
}

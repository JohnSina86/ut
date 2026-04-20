import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../data-source.js';
import { User } from '../../modules/auth/auth.entity.js';

export interface AuthRequest extends Request {
  user?: any;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Admin role guard. Must be used *after* requireAuth.
 * Falls back to a DB lookup in case older JWTs (pre-role) are still in circulation.
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorised' });

  // Fast path: role is embedded in the JWT payload.
  if (req.user.role === 'admin') return next();

  // Fallback path: re-read from DB so legacy tokens still work.
  try {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: req.user.id } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    // Enrich the request user with the freshly read role.
    req.user.role = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify admin role' });
  }
}

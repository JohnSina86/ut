import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await service.register(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Email already in use' });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await service.authenticate(email, password);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
  }

  async profile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await service.getProfile(userId);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const updated = await service.updateProfile(userId, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { current, newPassword } = req.body;
      await service.changePassword(userId, current, newPassword);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Password change failed' });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await service.deleteAccount(userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}

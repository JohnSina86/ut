import { AppDataSource } from '../../data-source.js';
import { User } from './auth.entity.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private repo = AppDataSource.getRepository(User);

  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.repo.create({ ...data, password: hashed });
    const saved = await this.repo.save(user);
    const token = jwt.sign(
      { id: saved.id, email: saved.email, role: saved.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
    );
    return { user: saved, token };
  }

  async authenticate(email: string, password: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user || !user.password) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
    );
    return { user, token };
  }

  async getProfile(userId: number) {
    return this.repo.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: number, data: { fullName?: string; name?: string; phone?: string }) {
    // Whitelist fields. `role` is deliberately NOT settable here — a regular
    // customer must never be able to promote themselves to admin via this endpoint.
    const update: any = {};
    if (data.fullName) update.name = data.fullName;
    if (data.name)     update.name = data.name;
    if (data.phone !== undefined) update.phone = data.phone;
    await this.repo.update(userId, update);
    return this.getProfile(userId);
  }

  async changePassword(userId: number, current: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');
    const ok = await bcrypt.compare(current, user.password);
    if (!ok) throw new Error('Current password incorrect');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repo.update(userId, { password: hashed });
    return true;
  }

  async deleteAccount(userId: number) {
    await this.repo.delete(userId);
    return true;
  }
}



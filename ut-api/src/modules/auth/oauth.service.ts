import { AppDataSource } from '../../data-source.js';
import { User } from './auth.entity.js';
import { UserProvider } from '../user-providers/user-provider.entity.js';
import jwt from 'jsonwebtoken';

export class OAuthService {
  private userRepo = AppDataSource.getRepository(User);
  private providerRepo = AppDataSource.getRepository(UserProvider);

  async findOrCreateFromOAuth(profile: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<{ user: User; token: string }> {
    // 1. Check if this provider+id combo already exists
    const existing = await this.providerRepo.findOne({
      where: { provider: profile.provider, provider_id: profile.providerId },
      relations: ['user'],
    });

    if (existing) {
      const token = this.signToken(existing.user);
      return { user: existing.user, token };
    }

    // 2. Check if a user with this email already exists (link accounts)
    let user = await this.userRepo.findOne({ where: { email: profile.email } });

    if (!user) {
      // 3. Create new user — no password since it's OAuth
      user = this.userRepo.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        email_verified_at: new Date(),
      });
      user = await this.userRepo.save(user);
    }

    // 4. Link this provider to the user
    const provider = this.providerRepo.create({
      user_id: user.id,
      provider: profile.provider,
      provider_id: profile.providerId,
    });
    await this.providerRepo.save(provider);

    const token = this.signToken(user);
    return { user, token };
  }

  private signToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }
}

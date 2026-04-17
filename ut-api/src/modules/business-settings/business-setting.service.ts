import { AppDataSource } from '../../data-source.js';
import { BusinessSetting } from './business-setting.entity.js';

export class BusinessSettingService {
  private repo = AppDataSource.getRepository(BusinessSetting);

  async get(key: string) {
    return this.repo.findOne({ where: { key } });
  }

  async set(key: string, value: string) {
    const existing = await this.get(key);
    if (existing) {
      existing.value = value;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ key, value }));
  }
}

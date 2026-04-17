import axios from 'axios';
import { AppDataSource } from '../../data-source.js';
import { VehicleSpec } from './vehicle-spec.entity.js';

const STALE_DAYS = 90;

export class VehicleSpecService {
  private repo = AppDataSource.getRepository(VehicleSpec);

  async findOrCreate(make: string, model: string, year?: number, engine?: string) {
    return this.repo.findOne({ where: { make, model, year, engine_size: engine } });
  }

  async create(data: Partial<VehicleSpec>) {
    return this.repo.save(this.repo.create(data));
  }

  private isStale(date?: Date): boolean {
    if (!date) return true;
    return (Date.now() - date.getTime()) / 86400000 > STALE_DAYS;
  }

  async fetchAndCacheSpecs(vehicleId: number, make: string, model: string, year?: number, engine?: string): Promise<VehicleSpec | null> {
    // Check existing
    const existing = await this.repo.findOne({ where: { make, model, year, engine_size: engine } });
    if (existing && !this.isStale(existing.last_fetched_at)) return existing;

    // Try API-Ninjas vehicle API (free tier: 10k/month)
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) return existing ?? null;

    try {
      const params: any = { make, model };
      if (year) params.year = year;

      const { data } = await axios.get('https://api.api-ninjas.com/v1/cars', {
        params,
        headers: { 'X-Api-Key': apiKey },
        timeout: 6000,
      });

      if (!data || data.length === 0) return existing ?? null;

      const car = data[0];
      const specData: Partial<VehicleSpec> = {
        vehicle_id: vehicleId,
        make,
        model,
        year,
        engine_size:  engine || (car.displacement ? `${car.displacement}L` : undefined),
        fuel_type:    car.fuel_type,
        // API-Ninjas doesn't provide tyre sizes — store other useful data
        other_specs: {
          cylinders:      car.cylinders,
          transmission:   car.transmission,
          drive:          car.drive,
          city_mpg:       car.city_mpg,
          highway_mpg:    car.highway_mpg,
          combination_mpg: car.combination_mpg,
          class:          car.class,
        },
        last_fetched_at: new Date(),
      };

      if (existing) {
        await this.repo.update(existing.id, specData);
        return this.repo.findOne({ where: { id: existing.id } });
      }
      return this.repo.save(this.repo.create(specData));

    } catch {
      return existing ?? null;
    }
  }
}

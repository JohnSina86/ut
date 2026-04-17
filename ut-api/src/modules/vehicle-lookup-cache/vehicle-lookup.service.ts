import * as cheerio from 'cheerio';
import { AppDataSource } from '../../data-source.js';
import { VehicleLookupCache } from '../vehicle-lookup-cache/vehicle-lookup-cache.entity.js';

const CACHE_TTL_DAYS = 30;

export interface LookupResult {
  registration: string;
  make: string;
  model: string;
  year?: number;
  fuel_type?: string;
  engine_size?: string;
  colour?: string;
}

export class VehicleLookupService {
  private repo = AppDataSource.getRepository(VehicleLookupCache);

  private isStale(date: Date): boolean {
    return (Date.now() - date.getTime()) / 86400000 > CACHE_TTL_DAYS;
  }

  private parseIrishReg(reg: string): { year?: number; county?: string } {
    const m = reg.match(/^(\d{2,3})([A-Z]+)(\d+)$/i);
    if (!m) return {};
    const n = parseInt(m[1], 10);
    const year = m[1].length === 2 ? 2000 + n : 2000 + Math.floor(n / 10);
    return { year, county: m[2].toUpperCase() };
  }

  async lookup(rawReg: string): Promise<LookupResult> {
    const reg = rawReg.replace(/[-\s]/g, '').toUpperCase();

    // Check cache first
    const cached = await this.repo.findOne({ where: { registration: reg } });
    if (cached && !this.isStale(cached.looked_up_at)) {
      return {
        registration: cached.registration,
        make:         cached.make,
        model:        cached.model,
        year:         cached.year,
        fuel_type:    cached.fuel_type,
        engine_size:  cached.engine_size,
        colour:       cached.colour,
      };
    }

    const regParsed = this.parseIrishReg(reg);
    let result: LookupResult = {
      registration: reg,
      make:  '',
      model: '',
      year:  regParsed.year,
    };

    try {
      const response = await fetch(
        `https://www.ros.ie/vrt/vehicle?regNum=${encodeURIComponent(reg)}&redirect=vehicleDetails`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IE,en;q=0.9',
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      const html = await response.text();
      const $ = cheerio.load(html);

      // Strategy 1: definition list (dl/dt/dd)
      const dlMap: Record<string, string> = {};
      $('dl').each((_, dl) => {
        $(dl).find('dt').each((_, dt) => {
          const key = $(dt).text().trim().toLowerCase().replace(/[:\s]+/g, ' ');
          const val = $(dt).next('dd').text().trim();
          if (key && val) dlMap[key] = val;
        });
      });

      // Strategy 2: table rows (th/td)
      const tableMap: Record<string, string> = {};
      $('tr').each((_, tr) => {
        const cells = $(tr).find('th, td');
        if (cells.length >= 2) {
          const key = cells.eq(0).text().trim().toLowerCase().replace(/[:\s]+/g, ' ');
          const val = cells.eq(1).text().trim();
          if (key && val) tableMap[key] = val;
        }
      });

      // Strategy 3: label/value pairs
      const labelMap: Record<string, string> = {};
      $('label').each((_, el) => {
        const key = $(el).text().trim().toLowerCase().replace(/[:\s]+/g, ' ');
        const forId = $(el).attr('for');
        if (forId) {
          const val = $(`#${forId}`).val() as string || $(`#${forId}`).text().trim();
          if (val) labelMap[key] = val;
        }
      });

      const allMaps = { ...labelMap, ...tableMap, ...dlMap };

      const find = (...keys: string[]): string | undefined => {
        for (const key of keys) {
          for (const [k, v] of Object.entries(allMaps)) {
            if (k.includes(key.toLowerCase()) && v) return v;
          }
        }
        return undefined;
      };

      const make  = find('make', 'manufacturer', 'brand');
      const model = find('model', 'variant');
      const year  = find('year of registration', 'year');
      const fuel  = find('fuel', 'propellant');
      const engine = find('engine', 'cc', 'cylinder');
      const colour = find('colour', 'color');

      result = {
        registration: reg,
        make:         make  || '',
        model:        model || '',
        year:         parseInt(year || '0') || regParsed.year,
        fuel_type:    fuel,
        engine_size:  engine,
        colour:       colour,
      };

      console.log(`[VehicleLookup] ${reg} → make=${result.make} model=${result.model} year=${result.year}`);

    } catch (err: any) {
      console.error('[VehicleLookup] ros.ie scrape failed:', err.message);
    }

    // Cache the result (even partial)
    try {
      if (cached) {
        await this.repo.update(cached.id, { ...result, looked_up_at: new Date() });
      } else {
        await this.repo.save(this.repo.create({ ...result, looked_up_at: new Date() }));
      }
    } catch (cacheErr: any) {
      console.error('[VehicleLookup] Cache save failed:', cacheErr.message);
    }

    return result;
  }
}

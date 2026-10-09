import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    try {
      const rows = await this.dataSource.query(`SELECT PostGIS_Version() AS version`);
      const postgisVersion = rows?.[0]?.version ?? null;
      if (!postgisVersion) {
        throw new ServiceUnavailableException('PostGIS not available');
      }
      return {
        status: 'ok',
        postgis: postgisVersion,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      throw new ServiceUnavailableException(
        err instanceof Error ? err.message : 'Database unavailable',
      );
    }
  }
}

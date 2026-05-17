import { join } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  const portRaw = process.env.DB_PORT ?? '3306';
  const port = Number.parseInt(portRaw, 10);

  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number.isFinite(port) ? port : 3306,
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'academic_planner',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: false,
    logging: false,
  };
}

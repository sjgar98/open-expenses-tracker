import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export enum SupportedDriver {
  MARIADB = 'mariadb',
  MYSQL = 'mysql',
}

export function getDataSourceOptions(configService: ConfigService, migrationsRun: boolean = true): DataSourceOptions {
  const dataSourceOptions: DataSourceOptions = {
    type: configService.get<string>('DB_DRIVER') as SupportedDriver,
    host: configService.get<string>('DB_HOST') || 'localhost',
    port: parseInt(configService.get<string>('DB_PORT') || '3306', 10),
    username: configService.get<string>('DB_USERNAME') || 'openexpensestracker',
    password: configService.get<string>('DB_PASSWORD') || 'openexpensestracker',
    database: configService.get<string>('DB_NAME') || 'openexpensestracker',
    logging: configService.get<boolean>('DB_LOGGING') || false,
    migrationsRun: migrationsRun && configService.get<boolean>('DB_MIGRATIONS_RUN') !== false,
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE') || false,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
    migrationsTableName: 'migrations',
  };
  return dataSourceOptions;
}

config();
const configService = new ConfigService();
const dataSource = new DataSource(getDataSourceOptions(configService, false));

export default dataSource;


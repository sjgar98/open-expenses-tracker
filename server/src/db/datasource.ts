import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export enum SupportedDriver {
  MARIADB = 'mariadb',
  SQLITE = 'better-sqlite3',
}

export function getDataSourceDriver(dbDriver: string | undefined): SupportedDriver | null {
  switch (dbDriver) {
    case 'mariadb':
      return SupportedDriver.MARIADB;
    case 'sqlite':
      return SupportedDriver.SQLITE;
    case undefined:
      return null;
    default:
      throw new Error(`Unsupported database driver: ${dbDriver}`);
  }
}

export function getDataSourceOptions(configService: ConfigService, migrationsRun: boolean = true): DataSourceOptions {
  const dataSourceOptions: DataSourceOptions = {
    type: getDataSourceDriver(configService.get<string>('DB_DRIVER')) || SupportedDriver.SQLITE,
    host: configService.get<string>('DB_HOST') || 'localhost',
    port: parseInt(configService.get<string>('DB_PORT') || '3306', 10),
    username: configService.get<string>('DB_USERNAME') || 'root',
    password: configService.get<string>('DB_PASSWORD') || 'password',
    database: configService.get<string>('DB_NAME') || ':memory:',
    logging: configService.get<boolean>('DB_LOGGING') || false,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
    migrationsTableName: 'migrations',
  };
  return {
    ...dataSourceOptions,
    migrationsRun:
      migrationsRun &&
      configService.get<boolean>('DB_MIGRATIONS_RUN') !== false &&
      !(dataSourceOptions.type === SupportedDriver.SQLITE && dataSourceOptions.database === ':memory:'),
    synchronize:
      configService.get<boolean>('DB_SYNCHRONIZE') ||
      (dataSourceOptions.type === SupportedDriver.SQLITE && dataSourceOptions.database === ':memory:') ||
      false,
  };
}

config();
const configService = new ConfigService();
const dataSource = new DataSource(getDataSourceOptions(configService, false));

export default dataSource;

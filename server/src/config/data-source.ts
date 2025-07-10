import { DataSource, DataSourceOptions } from 'typeorm';

export const AppDataSource = new DataSource({
  type: (process.env.DB_DRIVER as 'mariadb' | 'sqlite') || 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'expenses_tracker',
  synchronize: true,
  logging: true,
});

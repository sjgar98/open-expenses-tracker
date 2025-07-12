import { Module } from '@nestjs/common';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { getDataSourceDriver, SupportedDriver } from './utils/typeorm.utils';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_DRIVER: Joi.string().valid('mariadb', 'sqlite').default(SupportedDriver.SQLITE),
        DB_HOST: Joi.when('DB_DRIVER', {
          is: SupportedDriver.SQLITE,
          then: Joi.string().optional(),
          otherwise: Joi.string().default('localhost'),
        }),
        DB_PORT: Joi.when('DB_DRIVER', {
          is: SupportedDriver.SQLITE,
          then: Joi.number().optional(),
          otherwise: Joi.number().default(3306),
        }),
        DB_USERNAME: Joi.when('DB_DRIVER', {
          is: SupportedDriver.SQLITE,
          then: Joi.string().optional(),
          otherwise: Joi.string().default('root'),
        }),
        DB_PASSWORD: Joi.when('DB_DRIVER', {
          is: SupportedDriver.SQLITE,
          then: Joi.string().optional(),
          otherwise: Joi.string().default('password'),
        }),
        DB_NAME: Joi.string().default(':memory:'),
        DB_SYNCHRONIZE: Joi.boolean().default(false),
        DB_LOGGING: Joi.boolean().default(false),
        JWT_SECRET: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: getDataSourceDriver(process.env.DB_DRIVER) || SupportedDriver.SQLITE,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || ':memory:',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      autoLoadEntities: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
      global: true,
    }),
    AuthModule,
    CurrenciesModule,
    ExchangeRatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

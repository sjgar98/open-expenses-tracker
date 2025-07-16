import { Module } from '@nestjs/common';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { getDataSourceOptions, SupportedDriver } from './db/datasource';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { IncomeModule } from './modules/income/income.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_DRIVER: Joi.string().valid('mariadb', 'sqlite').default('sqlite'),
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
        DB_MIGRATIONS_RUN: Joi.boolean().default(true),
        JWT_SECRET: Joi.string().required(),
        OPENEXCHANGERATES_API_KEY: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDataSourceOptions(configService),
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
      global: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    CurrenciesModule,
    ExchangeRatesModule,
    AccountsModule,
    ExpensesModule,
    IncomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

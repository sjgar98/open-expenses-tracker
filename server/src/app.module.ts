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
import { SavingsModule } from './modules/savings/savings.module';
import { IncomeModule } from './modules/income/income.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TaxesModule } from './modules/taxes/taxes.module';
import { HolidayCalendarsModule } from './modules/holiday-calendars/holiday-calendars.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { basename, join } from 'path';
import { ExpenseCategoriesModule } from './modules/expense-categories/expense-categories.module';
import { SavingsBucketsModule } from './modules/savings-buckets/savings-buckets.module';
import { IncomeSourcesModule } from './modules/income-sources/income-sources.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { HealthModule } from './modules/health/health.module';
import { StringValue } from 'ms';
import type { Response } from 'express';

const NO_CACHE_STATIC_FILES = new Set(['index.html', 'sw.js', 'manifest.webmanifest']);

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_DRIVER: Joi.string().valid(SupportedDriver.MARIADB, SupportedDriver.MYSQL).default(SupportedDriver.MARIADB),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().default('openexpensestracker'),
        DB_PASSWORD: Joi.string().default('openexpensestracker'),
        DB_NAME: Joi.string().default('openexpensestracker'),
        DB_LOGGING: Joi.boolean().default(false),
        DB_SYNCHRONIZE: Joi.boolean().default(false),
        DB_MIGRATIONS_RUN: Joi.boolean().default(true),
        JWT_SECRET: Joi.string().required(),
        JWT_DURATION: Joi.string().default('12h'),
        OPENEXCHANGERATES_API_KEY: Joi.string().required(),
        ICS_FETCH_ALLOW_PRIVATE_NETWORKS: Joi.boolean().default(false),
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
      signOptions: { expiresIn: (process.env.JWT_DURATION as StringValue | undefined) || '12h' },
      global: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    CurrenciesModule,
    ExchangeRatesModule,
    AccountsModule,
    ExpensesModule,
    SavingsModule,
    IncomeModule,
    PaymentMethodsModule,
    TaxesModule,
    HolidayCalendarsModule,
    ExpenseCategoriesModule,
    SavingsBucketsModule,
    IncomeSourcesModule,
    UserSettingsModule,
    StatisticsModule,
    SchedulingModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['api/*splat', 'swagger'],
      serveStaticOptions: {
        fallthrough: true,
        setHeaders: (res: Response, filePath: string) => {
          if (NO_CACHE_STATIC_FILES.has(basename(filePath))) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

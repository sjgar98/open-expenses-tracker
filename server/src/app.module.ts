import { Module } from '@nestjs/common';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataSourceDriver, SupportedDriver } from './utils/typeorm.utils';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: getDataSourceDriver(process.env.DB_DRIVER) || SupportedDriver.SQLITE,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || ':memory:',
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    CurrenciesModule,
    ExchangeRatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';

@Entity()
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency, { nullable: false })
  fromCurrency: Currency;

  @ManyToOne(() => Currency, { nullable: false })
  toCurrency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  rate: number;

  @Column({ type: 'text' })
  sourceApiUrl: string;

  @Column({ type: 'date' })
  lastUpdated: Date;
}

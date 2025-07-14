import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';

@Entity()
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @Column({ type: 'decimal', precision: 19, scale: 6, default: 1.0 })
  rate: number;

  @Column({ type: 'date' })
  lastUpdated: Date;
}

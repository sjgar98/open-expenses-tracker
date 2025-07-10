import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { Currency } from './currency.entity';
import { ManyToOne } from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class RecurringIncome {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Currency, { eager: true })
  currency: Currency;

  @ManyToOne(() => Account, { eager: true })
  account: Account;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'text', nullable: false })
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'int', default: 0 })
  skipAmount: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}

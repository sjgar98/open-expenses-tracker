import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Currency } from './currency.entity';
import { Account } from './account.entity';
import { RecurringIncome } from './recurring-income.entity';

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Currency, { eager: true, nullable: false })
  currency: Currency;

  @ManyToOne(() => Account, { eager: true, nullable: false })
  account: Account;

  @ManyToOne(() => RecurringIncome, { eager: true })
  recurringIncome: RecurringIncome;

  @Column({ type: 'date' })
  date: Date;
}

import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { Currency } from './currency.entity';
import { ManyToOne } from 'typeorm';
import { Account } from './account.entity';
import { User } from './user.entity';

@Entity()
export class RecurringIncome {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  amount: number;

  @ManyToOne(() => Currency, { eager: true })
  currency: Currency;

  @ManyToOne(() => Account, { eager: true })
  account: Account;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'text' })
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'int', default: 0 })
  skipAmount: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}

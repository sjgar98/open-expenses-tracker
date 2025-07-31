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

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @ManyToOne(() => Account, { nullable: false })
  account: Account;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'text' })
  recurrenceRule: string;

  @Column({ type: 'date', nullable: true })
  nextOccurrence: Date | null;

  @Column({ type: 'date', nullable: true })
  lastOccurrence: Date | null;
}


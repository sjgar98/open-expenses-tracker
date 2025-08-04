import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { Currency } from './currency.entity';
import { ManyToOne } from 'typeorm';
import { Account } from './account.entity';
import { User } from './user.entity';
import { ColumnNumericTransformer } from 'src/transformers/numeric.transformer';
import { IncomeSource } from './income-source.entity';

@Entity()
export class RecurringIncome {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2, transformer: new ColumnNumericTransformer() })
  amount: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @ManyToOne(() => Account, { nullable: false })
  account: Account;

  @ManyToOne(() => IncomeSource, { nullable: true })
  source: IncomeSource;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'text' })
  recurrenceRule: string;

  @Column({ type: 'datetime', nullable: true })
  nextOccurrence: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastOccurrence: Date | null;
}


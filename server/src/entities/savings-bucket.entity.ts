import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Currency } from './currency.entity';
import { ColumnNumericTransformer } from 'src/transformers/numeric.transformer';
import { Saving } from './saving.entity';
import { Expense } from './expense.entity';

@Entity()
export class SavingsBucket {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  icon: string;

  @Column({ type: 'text' })
  iconColor: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'decimal', precision: 19, scale: 2, transformer: new ColumnNumericTransformer(), nullable: true })
  initialAmount: number | null;

  @Column({ type: 'decimal', precision: 19, scale: 2, transformer: new ColumnNumericTransformer(), nullable: true })
  targetAmount: number | null;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @Column({ type: 'datetime', nullable: true })
  deadline: Date | null;
}

export interface SavingsBucketWithAmounts extends SavingsBucket {
  amountSaved: number;
  amountSpent: number;
}

export interface SavingsBucketWithMappings extends SavingsBucket {
  savings: Saving[];
  expenses: Expense[];
}


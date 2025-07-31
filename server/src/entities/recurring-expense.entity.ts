import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { PaymentMethod } from './payment-method.entity';
import { Tax } from './tax.entity';
import { User } from './user.entity';

@Entity()
export class RecurringExpense {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  amount: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @ManyToOne(() => PaymentMethod, { nullable: false })
  paymentMethod: PaymentMethod;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ManyToMany(() => Tax, { cascade: true })
  @JoinTable()
  taxes: Tax[];

  @Column({ type: 'text' })
  recurrenceRule: string;

  @Column({ type: 'date', nullable: true })
  nextOccurrence: Date | null;

  @Column({ type: 'date', nullable: true })
  lastOccurrence: Date | null;
}


import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { PaymentMethod } from './payment-method.entity';
import { RecurringExpense } from './recurring-expense.entity';
import { Tax } from './tax.entity';
import { User } from './user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  amount: number;

  @ManyToOne(() => Currency, { eager: true, nullable: false })
  currency: Currency;

  @ManyToOne(() => PaymentMethod, { eager: true, nullable: false })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => RecurringExpense, { eager: true })
  recurringExpense: RecurringExpense;

  @ManyToMany(() => Tax, { cascade: true })
  @JoinTable()
  taxes: Tax[];

  @Column({ type: 'date' })
  date: Date;
}

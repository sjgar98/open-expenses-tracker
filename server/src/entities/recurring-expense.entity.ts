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

  @ManyToOne(() => Currency, { eager: true })
  currency: Currency;

  @ManyToOne(() => PaymentMethod, { eager: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'text' })
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'int', default: 0 })
  skipAmount: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ManyToMany(() => Tax, { cascade: true })
  @JoinTable()
  taxes: Tax[];
}

import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { PaymentMethod } from './payment-method.entity';
import { Tax } from './tax.entity';
import { User } from './user.entity';
import { ColumnNumericTransformer } from 'src/transformers/numeric.transformer';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2, transformer: new ColumnNumericTransformer() })
  amount: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @ManyToOne(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @ManyToMany(() => Tax, { cascade: true })
  @JoinTable()
  taxes: Tax[];

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'decimal', precision: 19, scale: 6, default: 1.0, transformer: new ColumnNumericTransformer() })
  fromExchangeRate: number;

  @Column({ type: 'decimal', precision: 19, scale: 6, default: 1.0, transformer: new ColumnNumericTransformer() })
  toExchangeRate: number;

  @ManyToOne(() => Currency, { nullable: false })
  toCurrency: Currency;
}


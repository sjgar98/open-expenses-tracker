import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @ManyToOne(() => Currency, { eager: true })
  currency: Currency;
}

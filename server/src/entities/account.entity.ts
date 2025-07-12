import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { User } from './user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @ManyToOne(() => Currency, { eager: true })
  currency: Currency;
}

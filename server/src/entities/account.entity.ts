import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { User } from './user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false, cascade: true })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  balance: number;

  @Column({ type: 'text' })
  icon: string;

  @Column({ type: 'text' })
  iconColor: string;

  @ManyToOne(() => Currency, { nullable: false, cascade: true })
  currency: Currency;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;
}


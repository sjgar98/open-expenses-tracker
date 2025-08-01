import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';

@Entity()
export class PaymentMethod {
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

  @ManyToOne(() => Account, { nullable: false })
  account: Account;

  @Column({ type: 'boolean', default: false })
  credit: boolean;

  @Column({ type: 'text', nullable: true })
  creditClosingDateRule: string | null;

  @Column({ type: 'text', nullable: true })
  creditDueDateRule: string | null;

  @Column({ type: 'datetime', nullable: true })
  nextClosingOccurrence: Date | null;

  @Column({ type: 'datetime', nullable: true })
  nextDueOccurrence: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastClosingOccurrence: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastDueOccurrence: Date | null;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created_at: Date;
}


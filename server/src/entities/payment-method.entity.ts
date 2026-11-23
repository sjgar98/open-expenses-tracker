import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';
import { HolidayCalendar } from './holiday-calendar.entity';
import type { ClosingRule, DueRule } from 'src/utils/credit-cycle.engine';

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int', default: 0 })
  sortWeight: number;

  @Column({ type: 'text' })
  icon: string;

  @Column({ type: 'text' })
  iconColor: string;

  @ManyToOne(() => Account, { nullable: false })
  account: Account;

  @Column({ type: 'boolean', default: false })
  credit: boolean;

  @Column({ type: 'json', nullable: true })
  creditClosingDateRule: ClosingRule | null;

  @Column({ type: 'json', nullable: true })
  creditDueDateRule: DueRule | null;

  @ManyToOne(() => HolidayCalendar, { nullable: true })
  holidayCalendar: HolidayCalendar | null;

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


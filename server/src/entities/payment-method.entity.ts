import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

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

  @Column({ type: 'boolean', default: false })
  credit: boolean;

  @Column({ type: 'text', nullable: true })
  creditClosingDateRule: string | null;

  @Column({ type: 'text', nullable: true })
  creditDueDateRule: string | null;

  @Column({ type: 'date', nullable: true })
  nextClosingOccurrence: Date | null;

  @Column({ type: 'date', nullable: true })
  nextDueOccurrence: Date | null;
}


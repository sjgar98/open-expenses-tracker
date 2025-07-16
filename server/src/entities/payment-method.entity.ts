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

  @Column({ type: 'boolean', default: false })
  credit: boolean;

  @Column({ type: 'text', nullable: true })
  creditClosingDateRule: string | null;

  @Column({ type: 'text', nullable: true })
  creditDueDateRule: string | null;
}

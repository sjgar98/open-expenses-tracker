import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'boolean', default: false })
  credit: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditLimit: number | null;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}

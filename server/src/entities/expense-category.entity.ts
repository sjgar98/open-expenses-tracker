import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ExpenseCategory {
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
  isDeleted: boolean;
}


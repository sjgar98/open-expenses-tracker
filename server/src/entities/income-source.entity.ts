import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class IncomeSource {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;
}


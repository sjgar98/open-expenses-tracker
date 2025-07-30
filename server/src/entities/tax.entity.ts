import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Tax {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column('text')
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  rate: number;

  @Column('boolean', { default: false })
  isDeleted: boolean;
}


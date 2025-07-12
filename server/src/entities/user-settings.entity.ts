import { Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.settings, { nullable: false })
  user: User;
}

import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @OneToOne(() => User, (user) => user.settings, { nullable: false })
  user: User;

  @Column({ type: 'text', default: 'USD' })
  displayCurrency: string;
}


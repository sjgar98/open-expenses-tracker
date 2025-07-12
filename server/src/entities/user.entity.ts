import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserSettings } from './user-settings.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'text' })
  uuid: string;

  @Column({ type: 'text' })
  username: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @OneToOne(() => UserSettings, (settings) => settings.user, { nullable: false, cascade: true })
  @JoinColumn()
  settings: UserSettings;
}

import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserSettings } from './user-settings.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'text' })
  username: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'text' })
  passwordHash: string;

  @OneToOne(() => UserSettings, (settings) => settings.user, { nullable: false, cascade: true })
  @JoinColumn()
  settings: UserSettings;
}

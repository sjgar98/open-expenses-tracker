import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ length: 3, unique: true })
  code: string;

  @Column({ type: 'boolean', default: true })
  visible: boolean;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ length: 3 })
  code: string;

  @Column({ type: 'text' })
  symbol: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}

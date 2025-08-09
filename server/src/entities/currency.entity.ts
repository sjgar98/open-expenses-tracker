import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 3, unique: true })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  customExchangeRateApiUrl: string | null;

  @Column({ type: 'text', nullable: true })
  customExchangeRateApiPath: string | null;

  @Column({ type: 'boolean', default: true })
  visible: boolean;
}


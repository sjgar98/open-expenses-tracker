import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HistoricExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'json' })
  rates: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;
}


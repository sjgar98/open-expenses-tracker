import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'boolean', default: false })
  credit: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditLimit: number | null;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}

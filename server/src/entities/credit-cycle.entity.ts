import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class CreditCycle {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => PaymentMethod, { nullable: false, onDelete: 'CASCADE' })
  paymentMethod: PaymentMethod;

  @Column('date')
  closingDate: string;

  @Column('date', { nullable: true })
  dueDate: string | null;

  @CreateDateColumn()
  created_at: Date;
}

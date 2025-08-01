import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { ColumnNumericTransformer } from 'src/transformers/numeric.transformer';

@Entity()
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @Column({ type: 'decimal', precision: 19, scale: 6, default: 1.0, transformer: new ColumnNumericTransformer() })
  rate: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}


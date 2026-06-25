import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ColumnNumericTransformer } from 'src/transformers/numeric.transformer';
import { Currency } from './currency.entity';
import { SavingsBucket } from './savings-bucket.entity';

@Entity()
export class Saving {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2, transformer: new ColumnNumericTransformer() })
  amount: number;

  @ManyToOne(() => Currency, { nullable: false })
  currency: Currency;

  @ManyToOne(() => SavingsBucket, { nullable: true })
  bucket: SavingsBucket;

  @Column({ type: 'datetime' })
  date: Date;
}


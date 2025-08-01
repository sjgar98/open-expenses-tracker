import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ColumnNumericTransformer } from 'src/transformers/numeric.transformer';

@Entity()
export class Tax {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column('text')
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, transformer: new ColumnNumericTransformer() })
  rate: number;

  @Column('boolean', { default: false })
  isDeleted: boolean;
}


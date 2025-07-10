import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tax {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  rate: number;
}

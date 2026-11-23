import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { HolidayDate } from './holiday-date.entity';

@Entity()
export class HolidayCalendar {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column('text')
  name: string;

  @OneToMany(() => HolidayDate, (holidayDate) => holidayDate.calendar)
  dates: HolidayDate[];

  @Column('boolean', { default: false })
  isDeleted: boolean;
}

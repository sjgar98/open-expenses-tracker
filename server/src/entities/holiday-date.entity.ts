import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { HolidayCalendar } from './holiday-calendar.entity';

@Entity()
@Unique(['calendar', 'date'])
export class HolidayDate {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => HolidayCalendar, (calendar) => calendar.dates, { nullable: false, onDelete: 'CASCADE' })
  calendar: HolidayCalendar;

  @Column('date')
  date: string;

  @Column('text')
  label: string;
}

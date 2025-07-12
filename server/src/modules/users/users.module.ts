import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserSettings } from 'src/entities/user-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSettings])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsDto } from 'src/dto/user-settings.dto';
import { LoggedUser } from 'src/entities/user.entity';

@Controller('user-settings')
@UseGuards(ProtectedAuthGuard)
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  async getUserSettings(@Request() req) {
    const user: LoggedUser = req.user;
    return this.userSettingsService.getUserSettings(user);
  }

  @Put()
  async updateUserSettings(@Request() req, @Body() settingsDto: UserSettingsDto) {
    const user: LoggedUser = req.user;
    return this.userSettingsService.updateUserSettings(user, settingsDto);
  }
}


import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsDto } from 'src/dto/user-settings.dto';

@Controller('user-settings')
@UseGuards(ProtectedAuthGuard)
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  async getUserSettings(@Request() req) {
    const userUuid: string = req.user.uuid;
    return this.userSettingsService.getUserSettings(userUuid);
  }

  @Put()
  async updateUserSettings(@Request() req, @Body() settingsDto: UserSettingsDto) {
    const userUuid: string = req.user.uuid;
    return this.userSettingsService.updateUserSettings(userUuid, settingsDto);
  }
}


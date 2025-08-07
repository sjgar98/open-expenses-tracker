import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSettingsDto } from 'src/dto/user-settings.dto';
import { UserSettings } from 'src/entities/user-settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>
  ) {}

  async getUserSettings(userUuid: string): Promise<UserSettings> {
    return (await this.userSettingsRepository.findOne({
      where: { user: { uuid: userUuid } },
    }))!;
  }

  async updateUserSettings(userUuid: string, settingsDto: UserSettingsDto): Promise<UserSettings> {
    const userSettings = await this.getUserSettings(userUuid);
    Object.assign(userSettings, settingsDto);
    return this.userSettingsRepository.save(userSettings);
  }
}


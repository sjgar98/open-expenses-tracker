import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSettingsDto } from 'src/dto/user-settings.dto';
import { UserSettings } from 'src/entities/user-settings.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>
  ) {}

  async getUserSettings(user: LoggedUser): Promise<UserSettings> {
    return (await this.userSettingsRepository.findOne({
      where: { user: { uuid: user.uuid } },
    }))!;
  }

  async updateUserSettings(user: LoggedUser, settingsDto: UserSettingsDto): Promise<UserSettings> {
    const userSettings = await this.getUserSettings(user);
    Object.assign(userSettings, settingsDto);
    return this.userSettingsRepository.save(userSettings);
  }
}


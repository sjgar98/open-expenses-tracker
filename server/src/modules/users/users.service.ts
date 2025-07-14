import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { UserSettings } from 'src/entities/user-settings.entity';
import { User } from 'src/entities/user.entity';
import { UserEmailTakenException, UserNameTakenException } from 'src/exceptions/auth.exceptions';
import { NewUserBody } from 'src/types/users';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserByUUID(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { uuid } });
  }

  async saveNewUser(newUserBody: NewUserBody): Promise<User> {
    const existingUserName = await this.findUserByUsername(newUserBody.username);
    if (existingUserName) throw new UserNameTakenException();
    if (newUserBody.email) {
      const existingUserEmail = await this.findUserByEmail(newUserBody.email);
      if (existingUserEmail) throw new UserEmailTakenException();
    }
    const isFirstUser = (await this.userRepository.count()) === 0;
    const newUser = this.userRepository.create({
      username: newUserBody.username,
      passwordHash: await hash(newUserBody.password, 16),
      email: newUserBody.email,
      isAdmin: isFirstUser || newUserBody.isAdmin,
      settings: new UserSettings(),
    });
    return this.userRepository.save(newUser);
  }
}

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { SignUpDto } from 'src/dto/auth.dto';
import {
  InvalidCredentialsException,
  UserEmailTakenException,
  UserNameTakenException,
} from 'src/exceptions/auth.exceptions';
import { v4 as uuidv4 } from 'uuid';
import { UserSettings } from 'src/entities/user-settings.entity';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private apiKeysService: ApiKeysService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersService.findUserByUsername(username);
    if (user) {
      const matches = await compare(pass, user.passwordHash);
      if (!matches) {
        throw new InvalidCredentialsException();
      }
      const { passwordHash, ...result } = user;
      return result;
    } else {
      throw new InvalidCredentialsException();
    }
  }

  async login(user: User) {
    const payload = { sub: user.uuid, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(signUpDto: SignUpDto) {
    const existingUserName = await this.usersService.findUserByUsername(signUpDto.username);
    if (existingUserName) throw new UserNameTakenException();
    if (signUpDto.email) {
      const existingUserEmail = await this.usersService.findUserByEmail(signUpDto.email);
      if (existingUserEmail) throw new UserEmailTakenException();
    }
    let newUUID = uuidv4();
    while (await this.usersService.findUserByUUID(newUUID)) {
      newUUID = uuidv4();
    }
    const newUser: Omit<User, 'id'> = {
      uuid: newUUID,
      username: signUpDto.username,
      email: signUpDto.email,
      passwordHash: await hash(signUpDto.password, 16),
      settings: new UserSettings(),
    };
    const savedNewUser = await this.usersService.saveNewUser(newUser);
    const payload = { sub: savedNewUser.uuid, username: savedNewUser.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateApiKey(apiKey: string): Promise<Omit<User, 'passwordHash'>> {
    const apiKeyEntity = await this.apiKeysService.validateApiKey(apiKey);
    if (!apiKeyEntity) {
      throw new InvalidCredentialsException();
    }
    const user = apiKeyEntity.user;
    const { passwordHash, ...result } = user;
    return result;
  }

  async validateJwtUuid(uuid: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findUserByUUID(uuid);
    if (!user) throw new InvalidCredentialsException();
    const { passwordHash, ...result } = user;
    return result;
  }
}

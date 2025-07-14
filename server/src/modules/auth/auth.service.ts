import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { SignUpDto } from 'src/dto/auth.dto';
import { InvalidCredentialsException } from 'src/exceptions/auth.exceptions';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private apiKeysService: ApiKeysService,
    private jwtService: JwtService
  ) {}

  async login(user: User) {
    const payload = { sub: user.uuid, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(signUpDto: SignUpDto) {
    const savedNewUser = await this.usersService.saveNewUser({
      username: signUpDto.username,
      password: signUpDto.password,
      email: signUpDto.email,
      isAdmin: false,
    });
    const payload = { sub: savedNewUser.uuid, username: savedNewUser.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

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

  async validateJwtUuid(uuid: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersService.findUserByUUID(uuid);
    if (!user) throw new InvalidCredentialsException();
    const { passwordHash, ...result } = user;
    return result;
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
}

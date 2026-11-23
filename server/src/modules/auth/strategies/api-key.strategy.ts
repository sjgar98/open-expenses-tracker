import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { AuthService } from '../auth.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ header: 'X-API-KEY', prefix: '' }, false);
  }

  async validate(apiKey: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.authService.validateApiKey(apiKey);
    return user;
  }
}

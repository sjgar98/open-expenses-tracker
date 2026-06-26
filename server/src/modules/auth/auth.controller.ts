import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from 'src/dto/auth.dto';
import { ProtectedAuthGuard } from './guards/protected.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoggedUser } from 'src/entities/user.entity';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('login')
  async login(@Request() req, @Body() body: SignInDto) {
    const user: LoggedUser = req.user;
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: SignUpDto) {
    return this.authService.register(body);
  }

  @Post('request-api-key')
  @UseGuards(ProtectedAuthGuard, AdminGuard)
  async requestApiKey(@Request() req) {
    const user: LoggedUser = req.user;
    return this.authService.requestApiKey(user);
  }
}


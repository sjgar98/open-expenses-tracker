import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from 'src/dto/auth.dto';
import { ProtectedAuthGuard } from './guards/protected.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() body: SignInDto) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() body: SignUpDto) {
    return this.authService.register(body);
  }

  @Post('request-api-key')
  @UseGuards(ProtectedAuthGuard, AdminGuard)
  async requestApiKey(@Request() req) {
    return this.authService.requestApiKey(req.user);
  }
}

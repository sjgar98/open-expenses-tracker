import { Controller, Get, Header } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
@SkipThrottle()
export class HealthController {
  @Get()
  @Header('Cache-Control', 'no-store')
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

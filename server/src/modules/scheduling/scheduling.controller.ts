import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { LoggedUser } from 'src/entities/user.entity';
import { ScheduledSyncResult, SchedulingService } from './scheduling.service';

@Controller('scheduling')
@UseGuards(ProtectedAuthGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('sync')
  async syncScheduledEvents(@Request() req): Promise<ScheduledSyncResult> {
    const user: LoggedUser = req.user;
    return this.schedulingService.syncUser(user);
  }
}

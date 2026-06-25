import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { SavingsService } from './savings.service';
import { SavingDto, SavingFilterDto } from 'src/dto/savings.dto';
import { Saving } from 'src/entities/saving.entity';
import { PaginatedResults } from 'src/types/pagination';
import { LoggedUser } from 'src/entities/user.entity';

@Controller('savings')
@UseGuards(ProtectedAuthGuard)
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get()
  async getSavings(@Request() req, @Query() query: SavingFilterDto): Promise<PaginatedResults<Saving>> {
    const user: LoggedUser = req.user;
    return this.savingsService.getUserSavings(user, query);
  }

  @Get('buckets')
  async getSavingsBuckets(@Request() req): Promise<any> {
    const user: LoggedUser = req.user;
    return this.savingsService.getUserSavingsBuckets(user);
  }

  @Get(':savingUuid')
  async getSavingByUuid(@Request() req, @Param('savingUuid') savingUuid: string): Promise<Saving> {
    const user: LoggedUser = req.user;
    return this.savingsService.getUserSavingByUuid(user, savingUuid);
  }

  @Post()
  async createSaving(@Request() req, @Body() savingDto: SavingDto): Promise<Saving> {
    const user: LoggedUser = req.user;
    return this.savingsService.createUserSaving(user, savingDto);
  }

  @Put(':savingUuid')
  async updateSaving(
    @Request() req,
    @Param('savingUuid') savingUuid: string,
    @Body() savingDto: SavingDto
  ): Promise<Saving> {
    const user: LoggedUser = req.user;
    return this.savingsService.updateUserSaving(user, savingUuid, savingDto);
  }

  @Delete(':savingUuid')
  async deleteSaving(@Request() req, @Param('savingUuid') savingUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.savingsService.deleteUserSaving(user, savingUuid);
  }
}


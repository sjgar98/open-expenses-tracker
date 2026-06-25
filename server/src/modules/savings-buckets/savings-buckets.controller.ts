import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { SavingsBucketsService } from './savings-buckets.service';
import { LoggedUser } from 'src/entities/user.entity';
import { SavingsBucket, SavingsBucketWithCurrent } from 'src/entities/savings-bucket.entity';
import { SavingsBucketDto } from 'src/dto/savings-buckets.dto';

@Controller('savings-buckets')
@UseGuards(ProtectedAuthGuard)
export class SavingsBucketsController {
  constructor(private readonly savingsBucketsService: SavingsBucketsService) {}

  @Get()
  async getUserSavingsBuckets(@Request() req): Promise<SavingsBucketWithCurrent[]> {
    const user: LoggedUser = req.user;
    return this.savingsBucketsService.getSavingsBuckets(user);
  }

  @Get(':bucketUuid')
  async getUserSavingsBucketByUuid(@Request() req, @Param('bucketUuid') bucketUuid: string): Promise<SavingsBucket> {
    const user: LoggedUser = req.user;
    return this.savingsBucketsService.getSavingsBucketByUuid(user, bucketUuid);
  }

  @Post()
  async createUserSavingsBucket(@Request() req, @Body() savingsBucketDto: SavingsBucketDto): Promise<SavingsBucket> {
    const user: LoggedUser = req.user;
    return this.savingsBucketsService.createSavingsBucket(user, savingsBucketDto);
  }

  @Put(':bucketUuid')
  async updateUserSavingsBucket(
    @Request() req,
    @Param('bucketUuid') bucketUuid: string,
    @Body() savingsBucketDto: SavingsBucketDto
  ): Promise<SavingsBucket> {
    const user: LoggedUser = req.user;
    return this.savingsBucketsService.updateSavingsBucket(user, bucketUuid, savingsBucketDto);
  }

  @Delete(':bucketUuid')
  async deleteUserSavingsBucket(@Request() req, @Param('bucketUuid') bucketUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.savingsBucketsService.deleteSavingsBucket(user, bucketUuid);
  }

  @Patch(':bucketUuid/restore')
  async restoreUserSavingsBucket(@Request() req, @Param('bucketUuid') bucketUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.savingsBucketsService.restoreSavingsBucket(user, bucketUuid);
  }
}


import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { IncomeSourcesService } from './income-sources.service';
import { IncomeSource } from 'src/entities/income-source.entity';
import { IncomeSourceDto } from 'src/dto/income-sources.dto';

@Controller('income-sources')
@UseGuards(ProtectedAuthGuard)
export class IncomeSourcesController {
  constructor(private readonly incomeSourcesService: IncomeSourcesService) {}

  @Get()
  async getUserIncomeSources(@Request() req): Promise<IncomeSource[]> {
    const userUuid: string = req.user.uuid;
    return this.incomeSourcesService.getIncomeSources(userUuid);
  }

  @Get(':sourceUuid')
  async getUserIncomeSourceByUuid(@Request() req, @Param('sourceUuid') sourceUuid: string): Promise<IncomeSource> {
    const userUuid: string = req.user.uuid;
    return this.incomeSourcesService.getIncomeSourceByUuid(userUuid, sourceUuid);
  }

  @Post()
  async createUserIncomeSource(@Request() req, @Body() incomeSourceDto: IncomeSourceDto): Promise<IncomeSource> {
    const userUuid: string = req.user.uuid;
    return this.incomeSourcesService.createIncomeSource(userUuid, incomeSourceDto);
  }

  @Put(':sourceUuid')
  async updateUserIncomeSource(
    @Request() req,
    @Param('sourceUuid') sourceUuid: string,
    @Body() incomeSourceDto: IncomeSourceDto
  ): Promise<IncomeSource> {
    const userUuid: string = req.user.uuid;
    return this.incomeSourcesService.updateIncomeSource(userUuid, sourceUuid, incomeSourceDto);
  }

  @Delete(':sourceUuid')
  async deleteUserIncomeSource(@Request() req, @Param('sourceUuid') sourceUuid: string): Promise<void> {
    const userUuid: string = req.user.uuid;
    return this.incomeSourcesService.deleteIncomeSource(userUuid, sourceUuid);
  }
}


import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { StatisticsService } from './statistics.service';
import { StatsExpensesByPaymentMethodDto, StatsSummaryParamsDto } from 'src/dto/statistics.dto';

@Controller('stats')
@UseGuards(ProtectedAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('upcoming-due-dates')
  async getUserUpcomingDueDates(@Request() req): Promise<any> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserUpcomingDueDates(userUuid);
  }

  @Get('expenses/by-payment-method')
  async getUserExpensesByPaymentMethod(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<any> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserExpensesByPaymentMethod(userUuid, queryParams);
  }

  @Get('income/by-account')
  async getUserIncomeByAccount(@Request() req, @Query() queryParams: StatsExpensesByPaymentMethodDto): Promise<any> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserIncomeByAccount(userUuid, queryParams);
  }

  @Get('summary')
  async getUserSummary(@Request() req, @Query() queryParams: StatsSummaryParamsDto): Promise<any> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserSummary(userUuid, queryParams);
  }
}


import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { StatisticsService } from './statistics.service';
import { StatsExpensesByPaymentMethodDto, StatsSummaryParamsDto, StatsUpcomingExpensesDto, } from 'src/dto/statistics.dto';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { MonthlySummary, PieChartData, StatisticsResponse, UpcomingDueDate } from 'src/types/statistics';

@Controller('stats')
@UseGuards(ProtectedAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('upcoming-due-dates')
  async getUserUpcomingDueDates(@Request() req): Promise<UpcomingDueDate[]> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserUpcomingDueDates(userUuid);
  }

  @Get('upcoming-expenses')
  async getUserUpcomingExpenses(
    @Request() req,
    @Query() queryParams: StatsUpcomingExpensesDto
  ): Promise<RecurringExpense[]> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserUpcomingExpenses(userUuid, queryParams);
  }

  @Get('expenses/by-payment-method')
  async getUserExpensesByPaymentMethod(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData>> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserExpensesByPaymentMethod(userUuid, queryParams);
  }

  @Get('expenses/by-category')
  async getUserExpensesByCategory(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData>> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserExpensesByCategory(userUuid, queryParams);
  }

  @Get('income/by-account')
  async getUserIncomeByAccount(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData>> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserIncomeByAccount(userUuid, queryParams);
  }

  @Get('income/by-source')
  async getUserIncomeBySource(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData>> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserIncomeBySource(userUuid, queryParams);
  }

  @Get('summary')
  async getUserSummary(
    @Request() req,
    @Query() queryParams: StatsSummaryParamsDto
  ): Promise<StatisticsResponse<MonthlySummary>> {
    const userUuid: string = req.user.uuid;
    return this.statisticsService.getUserSummary(userUuid, queryParams);
  }
}


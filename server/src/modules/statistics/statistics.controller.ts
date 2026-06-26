import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { StatisticsService } from './statistics.service';
import { StatsExpensesByPaymentMethodDto, StatsExpensesHeatmapDto, StatsSummaryParamsDto, StatsUpcomingExpensesDto, } from 'src/dto/statistics.dto';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { ExpensesHeatmap, MonthlySummary, PieChartData, StatisticsResponse, UpcomingDueDate, } from 'src/types/statistics';
import { LoggedUser } from 'src/entities/user.entity';
import { SavingsBucketWithCurrent } from 'src/entities/savings-bucket.entity';

@Controller('stats')
@UseGuards(ProtectedAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('upcoming-due-dates')
  async getUserUpcomingDueDates(@Request() req): Promise<UpcomingDueDate[]> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserUpcomingDueDates(user);
  }

  @Get('upcoming-expenses')
  async getUserUpcomingExpenses(
    @Request() req,
    @Query() queryParams: StatsUpcomingExpensesDto
  ): Promise<RecurringExpense[]> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserUpcomingExpenses(user, queryParams);
  }

  @Get('expenses/by-payment-method')
  async getUserExpensesByPaymentMethod(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserExpensesByPaymentMethod(user, queryParams);
  }

  @Get('expenses/by-category')
  async getUserExpensesByCategory(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserExpensesByCategory(user, queryParams);
  }

  @Get('income/by-account')
  async getUserIncomeByAccount(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserIncomeByAccount(user, queryParams);
  }

  @Get('income/by-source')
  async getUserIncomeBySource(
    @Request() req,
    @Query() queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserIncomeBySource(user, queryParams);
  }

  @Get('summary')
  async getUserSummary(
    @Request() req,
    @Query() queryParams: StatsSummaryParamsDto
  ): Promise<StatisticsResponse<MonthlySummary[]>> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserSummary(user, queryParams);
  }

  @Get('expenses/heatmap')
  async getExpensesHeatmap(
    @Request() req,
    @Query() queryParams: StatsExpensesHeatmapDto
  ): Promise<StatisticsResponse<ExpensesHeatmap>> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserExpensesHeatmap(user, queryParams);
  }

  @Get('savings/by-bucket')
  async getUserSavingsByBucket(@Request() req): Promise<SavingsBucketWithCurrent[]> {
    const user: LoggedUser = req.user;
    return this.statisticsService.getUserSavingsByBucket(user);
  }
}


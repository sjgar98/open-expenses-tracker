import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { IncomeService } from './income.service';
import { Income } from 'src/entities/income.entity';
import { User } from 'src/entities/user.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { IncomeDto, RecurringIncomeDto } from 'src/dto/income.dto';

@Controller('income')
@UseGuards(ProtectedAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get('onetime')
  async getUserIncome(@Request() req): Promise<Income[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.getUserIncome(user);
  }

  @Get('onetime/:incomeUuid')
  async getUserIncomeByUuid(@Request() req, @Param('incomeUuid') incomeUuid: string): Promise<Income> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.getUserIncomeByUuid(user, incomeUuid);
  }

  @Post('onetime')
  async createUserIncome(@Request() req, @Body() incomeDto: IncomeDto): Promise<Income> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.createUserIncome(user, incomeDto);
  }

  @Put('onetime/:incomeUuid')
  async updateUserIncome(
    @Request() req,
    @Param('incomeUuid') incomeUuid: string,
    @Body() incomeDto: IncomeDto
  ): Promise<Income> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.updateUserIncome(user, incomeUuid, incomeDto);
  }

  @Delete('onetime/:incomeUuid')
  async deleteUserIncome(@Request() req, @Param('incomeUuid') incomeUuid: string): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.deleteUserIncome(user, incomeUuid);
  }

  @Get('recurring')
  async getUserRecurringIncome(@Request() req): Promise<RecurringIncome[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.getUserRecurringIncome(user);
  }

  @Get('recurring/:recurringIncomeUuid')
  async getUserRecurringIncomeByUuid(
    @Request() req,
    @Param('recurringIncomeUuid') recurringIncomeUuid: string
  ): Promise<RecurringIncome> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.getUserRecurringIncomeByUuid(user, recurringIncomeUuid);
  }

  @Post('recurring')
  async createUserRecurringIncome(
    @Request() req,
    @Body() recurringIncomeDto: RecurringIncomeDto
  ): Promise<RecurringIncome> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.createUserRecurringIncome(user, recurringIncomeDto);
  }

  @Put('recurring/:recurringIncomeUuid')
  async updateUserRecurringIncome(
    @Request() req,
    @Param('recurringIncomeUuid') recurringIncomeUuid: string,
    @Body() recurringIncomeDto: RecurringIncomeDto
  ): Promise<RecurringIncome> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.updateUserRecurringIncome(user, recurringIncomeUuid, recurringIncomeDto);
  }

  @Delete('recurring/:recurringIncomeUuid')
  async deleteUserRecurringIncome(
    @Request() req,
    @Param('recurringIncomeUuid') recurringIncomeUuid: string
  ): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.deleteUserRecurringIncome(user, recurringIncomeUuid);
  }
}


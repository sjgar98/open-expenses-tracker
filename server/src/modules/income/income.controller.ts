import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { IncomeService } from './income.service';
import { Income } from 'src/entities/income.entity';
import { User } from 'src/entities/user.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { PatchIncomeDto, PatchRecurringIncomeDto, PostIncomeDto, PostRecurringIncomeDto } from 'src/dto/income.dto';

@Controller('income')
@UseGuards(ProtectedAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  async getUserIncome(@Request() req): Promise<Income[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.getUserIncome(user);
  }

  @Get('recurring')
  async getUserRecurringIncome(@Request() req): Promise<RecurringIncome[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.getUserRecurringIncome(user);
  }

  @Post()
  async createUserIncome(@Request() req, @Body() postIncomeDto: PostIncomeDto): Promise<Income> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.createUserIncome(user, postIncomeDto);
  }

  @Post('recurring')
  async createUserRecurringIncome(
    @Request() req,
    @Body() postRecurringIncomeDto: PostRecurringIncomeDto
  ): Promise<RecurringIncome> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.createUserRecurringIncome(user, postRecurringIncomeDto);
  }

  @Patch(':incomeUuid')
  async updateUserIncome(
    @Request() req,
    @Param('incomeUuid') incomeUuid: string,
    @Body() patchIncomeDto: PatchIncomeDto
  ): Promise<Income> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.updateUserIncome(user, incomeUuid, patchIncomeDto);
  }

  @Patch('recurring/:recurringIncomeUuid')
  async updateUserRecurringIncome(
    @Request() req,
    @Param('recurringIncomeUuid') recurringIncomeUuid: string,
    @Body() patchRecurringIncomeDto: PatchRecurringIncomeDto
  ): Promise<RecurringIncome> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.updateUserRecurringIncome(user, recurringIncomeUuid, patchRecurringIncomeDto);
  }

  @Delete(':incomeUuid')
  async deleteUserIncome(@Request() req, @Param('incomeUuid') incomeUuid: string): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.incomeService.deleteUserIncome(user, incomeUuid);
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

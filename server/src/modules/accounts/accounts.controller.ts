import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { AccountsService } from './accounts.service';
import { User } from 'src/entities/user.entity';
import { AccountDto } from 'src/dto/accounts.dto';
import { Account } from 'src/entities/account.entity';

@Controller('accounts')
@UseGuards(ProtectedAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getUserAccounts(@Request() req): Promise<Account[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.getUserAccounts(user);
  }

  @Get(':accountUuid')
  async getUserAccountByUuid(@Request() req, @Param('accountUuid') accountUuid: string): Promise<Account> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.getUserAccountByUuid(user, accountUuid);
  }

  @Post()
  async createUserAccount(@Request() req, @Body() accountDto: AccountDto): Promise<Account> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.createUserAccount(user, accountDto);
  }

  @Put(':accountUuid')
  async updateUserAccount(
    @Request() req,
    @Param('accountUuid') accountUuid: string,
    @Body() accountDto: AccountDto
  ): Promise<Account> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.updateUserAccount(user, accountUuid, accountDto);
  }

  @Delete(':accountUuid')
  async deleteUserAccount(@Request() req, @Param('accountUuid') accountUuid: string): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.deleteUserAccount(user, accountUuid);
  }
}


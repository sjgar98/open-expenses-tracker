import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { AccountsService } from './accounts.service';
import { User } from 'src/entities/user.entity';
import { PatchAccountDto, PostAccountDto } from 'src/dto/accounts.dto';
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

  @Post()
  async createUserAccount(@Request() req, @Body() postAccountDto: PostAccountDto): Promise<Account> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.createUserAccount(user, postAccountDto);
  }

  @Patch(':accountUuid')
  async updateUserAccount(
    @Request() req,
    @Param('accountUuid') accountUuid: string,
    @Body() patchAccountDto: PatchAccountDto
  ): Promise<Account> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.updateUserAccount(user, accountUuid, patchAccountDto);
  }

  @Delete(':accountUuid')
  async deleteUserAccount(@Request() req, @Param('accountUuid') accountUuid: string): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.accountsService.deleteUserAccount(user, accountUuid);
  }
}

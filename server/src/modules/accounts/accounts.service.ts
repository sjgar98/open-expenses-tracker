import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { AccountDto } from 'src/dto/accounts.dto';
import { Account } from 'src/entities/account.entity';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { User } from 'src/entities/user.entity';
import { AccountNotFoundException } from 'src/exceptions/accounts.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>
  ) {}

  async getUserAccounts(user: Omit<User, 'passwordHash'>): Promise<Account[]> {
    return this.accountRepository.find({ where: { user: { uuid: user.uuid } }, relations: ['currency'] });
  }

  async getUserAccountByUuid(user: Omit<User, 'passwordHash'>, accountUuid: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { uuid: accountUuid, user: { uuid: user.uuid } },
      relations: ['currency'],
    });
    if (!account) throw new AccountNotFoundException();
    return account;
  }

  async createUserAccount(user: Omit<User, 'passwordHash'>, accountDto: AccountDto): Promise<Account> {
    const newAccount = this.accountRepository.create({
      name: accountDto.name,
      balance: accountDto.balance,
      icon: accountDto.icon,
      iconColor: accountDto.iconColor,
      user: { uuid: user.uuid },
      currency: { id: accountDto.currency },
      isDeleted: false,
    });
    const createdAccount = await this.accountRepository.save(newAccount);
    if (accountDto.balance < 0) {
      const newExpense = this.expenseRepository.create({
        user: { uuid: user.uuid },
        description: `Initial balance for account ${accountDto.name}`,
        amount: -accountDto.balance,
        currency: { id: accountDto.currency },
        taxes: [],
        date: DateTime.now().toISO(),
      });
      await this.expenseRepository.save(newExpense);
    } else if (accountDto.balance > 0) {
      const newIncome = this.incomeRepository.create({
        user: { uuid: user.uuid },
        description: `Initial balance for account ${accountDto.name}`,
        amount: accountDto.balance,
        currency: { id: accountDto.currency },
        account: { uuid: createdAccount.uuid },
        date: DateTime.now().toISO(),
      });
      await this.incomeRepository.save(newIncome);
    }
    return createdAccount;
  }

  async updateUserAccount(user: Omit<User, 'passwordHash'>, accountUuid: string, accountDto: AccountDto) {
    const account = await this.accountRepository.findOneBy({ uuid: accountUuid, user: { uuid: user.uuid } });
    if (!account) throw new AccountNotFoundException();
    const balanceDifference = accountDto.balance - account.balance;
    await this.accountRepository.update(accountUuid, {
      name: accountDto.name,
      balance: accountDto.balance,
      icon: accountDto.icon,
      iconColor: accountDto.iconColor,
      currency: { id: accountDto.currency },
    });
    if (balanceDifference < 0) {
      const newExpense = this.expenseRepository.create({
        user: { uuid: user.uuid },
        description: `Updated balance for account ${accountDto.name}`,
        amount: -balanceDifference,
        currency: { id: accountDto.currency },
        taxes: [],
        date: DateTime.now().toISO(),
      });
      await this.expenseRepository.save(newExpense);
    } else if (balanceDifference > 0) {
      const newIncome = this.incomeRepository.create({
        user: { uuid: user.uuid },
        description: `Updated balance for account ${accountDto.name}`,
        amount: balanceDifference,
        currency: { id: accountDto.currency },
        account: { uuid: accountUuid },
        date: DateTime.now().toISO(),
      });
      await this.incomeRepository.save(newIncome);
    }
    return (await this.accountRepository.findOneBy({ uuid: accountUuid }))!;
  }

  async deleteUserAccount(user: Omit<User, 'passwordHash'>, accountUuid: string): Promise<void> {
    const account = await this.accountRepository.findOneBy({ uuid: accountUuid, user: { uuid: user.uuid } });
    if (!account) throw new AccountNotFoundException();
    await this.accountRepository.update(accountUuid, { isDeleted: true });
  }
}


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountDto } from 'src/dto/accounts.dto';
import { Account } from 'src/entities/account.entity';
import { User } from 'src/entities/user.entity';
import { AccountNotFoundException } from 'src/exceptions/accounts.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
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
      user: { uuid: user.uuid },
      currency: { id: accountDto.currency },
    });
    return this.accountRepository.save(newAccount);
  }

  async updateUserAccount(user: Omit<User, 'passwordHash'>, accountUuid: string, accountDto: AccountDto) {
    const account = await this.accountRepository.findOneBy({ uuid: accountUuid, user: { uuid: user.uuid } });
    if (!account) throw new AccountNotFoundException();
    await this.accountRepository.update(accountUuid, {
      name: accountDto.name,
      balance: accountDto.balance,
      currency: { id: accountDto.currency },
    });
    return (await this.accountRepository.findOneBy({ uuid: accountUuid }))!;
  }

  async deleteUserAccount(user: Omit<User, 'passwordHash'>, accountUuid: string): Promise<void> {
    const account = await this.accountRepository.findOneBy({ uuid: accountUuid, user: { uuid: user.uuid } });
    if (!account) throw new AccountNotFoundException();
    await this.accountRepository.remove(account);
  }
}


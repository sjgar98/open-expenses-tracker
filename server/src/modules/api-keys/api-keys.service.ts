import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from 'src/entities/api-key.entity';
import { User } from 'src/entities/user.entity';
import { InvalidCredentialsException } from 'src/exceptions/auth.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>
  ) {}

  async createApiKey(uuid: string): Promise<ApiKey> {
    const user = await this.usersRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new InvalidCredentialsException();
    }
    const apiKey = this.apiKeyRepository.create({ user: { uuid } });
    return this.apiKeyRepository.save(apiKey);
  }

  async validateApiKey(uuid: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({ where: { uuid } });
  }
}

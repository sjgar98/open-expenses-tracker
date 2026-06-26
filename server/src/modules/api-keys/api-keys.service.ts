import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from 'src/entities/api-key.entity';
import { LoggedUser, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>
  ) {}

  async createApiKey(user: LoggedUser): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create({ user: { uuid: user.uuid } });
    return this.apiKeyRepository.save(apiKey);
  }

  async validateApiKey(uuid: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({ where: { uuid }, relations: ['user'] });
  }
}


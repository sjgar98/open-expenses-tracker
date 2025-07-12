import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ApiKey } from 'src/entities/api-key.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>
  ) {}

  async createApiKey(userId: number, admin: boolean): Promise<ApiKey> {
    let key = uuidv4();
    while (await this.apiKeyRepository.findOne({ where: { key } })) {
      key = uuidv4();
    }
    const apiKey = this.apiKeyRepository.create({ key, admin, user: { id: userId } });
    return this.apiKeyRepository.save(apiKey);
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({ where: { key } });
  }
}

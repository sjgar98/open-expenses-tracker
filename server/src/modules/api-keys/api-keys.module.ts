import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from 'src/entities/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { IncomeSourcesController } from './income-sources.controller';

describe('IncomeSourcesController', () => {
  let controller: IncomeSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeSourcesController],
    }).compile();

    controller = module.get<IncomeSourcesController>(IncomeSourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

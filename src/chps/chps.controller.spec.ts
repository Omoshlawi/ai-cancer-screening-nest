import { Test, TestingModule } from '@nestjs/testing';
import { ChpsController } from './chps.controller';

describe('ChpsController', () => {
  let controller: ChpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChpsController],
    }).compile();

    controller = module.get<ChpsController>(ChpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

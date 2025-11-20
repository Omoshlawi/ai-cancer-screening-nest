import { Test, TestingModule } from '@nestjs/testing';
import { ChpsService } from './chps.service';

describe('ChpsService', () => {
  let service: ChpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChpsService],
    }).compile();

    service = module.get<ChpsService>(ChpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

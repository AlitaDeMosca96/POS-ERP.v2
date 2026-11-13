import { Test, TestingModule } from '@nestjs/testing';
import { ModificadoresService } from './modificadores.service';

describe('ModificadoresService', () => {
  let service: ModificadoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModificadoresService],
    }).compile();

    service = module.get<ModificadoresService>(ModificadoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

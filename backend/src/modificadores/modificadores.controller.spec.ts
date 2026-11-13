import { Test, TestingModule } from '@nestjs/testing';
import { ModificadoresController } from './modificadores.controller';
import { ModificadoresService } from './modificadores.service';

describe('ModificadoresController', () => {
  let controller: ModificadoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModificadoresController],
      providers: [ModificadoresService],
    }).compile();

    controller = module.get<ModificadoresController>(ModificadoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

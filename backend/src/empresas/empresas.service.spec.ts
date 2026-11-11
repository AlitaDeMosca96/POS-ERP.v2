import { Test, TestingModule } from '@nestjs/testing';
import { EmpresasService } from './empresas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';

describe('EmpresasService', () => {
  let service: EmpresasService;

  // Simulamos el repositorio de la base de datos para que el test no falle
  const mockEmpresaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasService,
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresaRepository,
        },
      ],
    }).compile();

    service = module.get<EmpresasService>(EmpresasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
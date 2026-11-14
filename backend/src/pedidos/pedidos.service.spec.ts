import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('PedidosService', () => {
  let service: PedidosService;

  // Mock del QueryRunner para Transacciones
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: getRepositoryToken(Pedido), useValue: {} },
        { provide: getRepositoryToken(Producto), useValue: {} },
        { provide: getRepositoryToken(Mesa), useValue: {} },
        { provide: getRepositoryToken(Caja), useValue: {} },
        { provide: getRepositoryToken(Receta), useValue: {} },
        { provide: getRepositoryToken(Insumo), useValue: {} },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  it('debería lanzar BadRequestException si el producto no existe en la empresa', async () => {
    // Simulamos que la BD no encuentra el producto
    mockQueryRunner.manager.findOne.mockResolvedValue(null);

    const pedidoDto = {
      detalles: [{ productoId: 'prod-inexistente', cantidad: 1 }],
    };

    await expect(service.create(pedidoDto as any, 'user-1', 'emp-1'))
      .rejects.toThrow(BadRequestException);
      
    // Verificamos que la transacción se haya cancelado (Rollback)
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
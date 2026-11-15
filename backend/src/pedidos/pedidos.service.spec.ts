import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { Modificadore } from '../modificadores/entities/modificadore.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PedidosService - Aislamiento Multi-Tenant y Reversión', () => {
  let service: PedidosService;
  let pedidoRepository: any;
  let dataSource: any;
  let manager: any;

  beforeEach(async () => {
    pedidoRepository = {
      findOne: jest.fn(),
      softDelete: jest.fn(),
      update: jest.fn(),
    };

    manager = {
      findOne: jest.fn(),
      find: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      create: jest.fn(),
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: getRepositoryToken(Pedido), useValue: pedidoRepository },
        { provide: getRepositoryToken(Producto), useValue: {} },
        { provide: getRepositoryToken(Mesa), useValue: {} },
        { provide: getRepositoryToken(Caja), useValue: {} },
        { provide: getRepositoryToken(Receta), useValue: {} },
        { provide: getRepositoryToken(Insumo), useValue: {} },
        { provide: getRepositoryToken(Modificadore), useValue: {} },
        { provide: AuditoriaService, useValue: { registrar: jest.fn() } },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  it('debería lanzar NotFoundException si el pedido no pertenece a la empresa en findOne', async () => {
    pedidoRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('pedido-123', 'empresa-A'))
      .rejects.toThrow(NotFoundException);
  });

  it('NO debería permitir borrar un pedido de otra empresa', async () => {
    manager.findOne.mockResolvedValue(null);

    await expect(service.remove('pedido-123', 'empresa-B'))
      .rejects.toThrow(NotFoundException);

    expect(manager.softDelete).not.toHaveBeenCalled();
  });

  it('debería revertir stock usando el snapshot histórico, no la receta actual', async () => {
    const pedidoHistorico = {
      id: 'pedido-1',
      estado: 'PAGADO',
      total: 100,
      mesaId: null,
      detalles: [
        {
          cantidad: 2,
          producto: { id: 'prod-1' },
          recetaSnapshot: [
            { insumoId: 'insumo-viejo', nombre: 'Queso', cantidad: 50 }
          ]
        }
      ]
    };

    manager.findOne.mockResolvedValue(pedidoHistorico);
    manager.softDelete.mockResolvedValue({});

    await service.remove('pedido-1', 'empresa-A', 'user-1');

    expect(manager.increment).toHaveBeenCalledWith(
      Insumo,
      { id: 'insumo-viejo' },
      'stock',
      100
    );
    expect(manager.find).not.toHaveBeenCalled();
  });

  it('debería devolver stock al producto cuando el snapshot es array vacío', async () => {
    const pedidoSinReceta = {
      id: 'pedido-2',
      estado: 'PAGADO',
      total: 50,
      mesaId: null,
      detalles: [
        {
          cantidad: 3,
          producto: { id: 'prod-2' },
          recetaSnapshot: []
        }
      ]
    };

    manager.findOne.mockResolvedValue(pedidoSinReceta);
    manager.softDelete.mockResolvedValue({});

    await service.remove('pedido-2', 'empresa-A', 'user-1');

    expect(manager.increment).toHaveBeenCalledWith(
      Producto,
      { id: 'prod-2' },
      'stock',
      3
    );
  });
});
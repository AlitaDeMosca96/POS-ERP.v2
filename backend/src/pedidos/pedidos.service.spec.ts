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

describe('PedidosService - Aislamiento Multi-Tenant', () => {
  let service: PedidosService;
  let pedidoRepository: any;

  beforeEach(async () => {
    pedidoRepository = {
      findOne: jest.fn(),
      softDelete: jest.fn(),
      update: jest.fn(),
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
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  it('debería lanzar NotFoundException si el pedido no pertenece a la empresa', async () => {
    pedidoRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('pedido-123', 'empresa-A'))
      .rejects.toThrow(NotFoundException);
  });

  it('NO debería permitir borrar un pedido de otra empresa', async () => {
    pedidoRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('pedido-123', 'empresa-B'))
      .rejects.toThrow(NotFoundException);
    
    expect(pedidoRepository.softDelete).not.toHaveBeenCalled();
  });
});
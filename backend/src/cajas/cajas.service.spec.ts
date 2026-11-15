import { Test, TestingModule } from '@nestjs/testing';
import { CajasService } from './cajas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Caja } from './entities/caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('CajasService - Conciliación', () => {
  let service: CajasService;
  let cajaRepository: any;
  let movimientoRepository: any;
  let pedidoRepository: any;
  let sucursalRepository: any;

  beforeEach(async () => {
    cajaRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((x) => x),
    };
    movimientoRepository = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((x) => x),
    };
    pedidoRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '1000' }),
      }),
    };
    sucursalRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CajasService,
        { provide: getRepositoryToken(Caja), useValue: cajaRepository },
        { provide: getRepositoryToken(MovimientoCaja), useValue: movimientoRepository },
        { provide: getRepositoryToken(Pedido), useValue: pedidoRepository },
        { provide: getRepositoryToken(Sucursal), useValue: sucursalRepository },
        { provide: AuditoriaService, useValue: { registrar: jest.fn() } },
      ],
    }).compile();

    service = module.get<CajasService>(CajasService);
  });

  it('debería calcular el saldo esperado exactamente (Monto Inicial + Ventas + Ingresos - Egresos)', async () => {
    cajaRepository.findOne.mockResolvedValue({
      id: 'caja-1',
      montoInicial: 500,
      estado: 'ABIERTA',
    });

    movimientoRepository.find.mockResolvedValue([
      { tipo: 'INGRESO', monto: 200 },
      { tipo: 'EGRESO', monto: 50 },
    ]);

    const resumen = await service.obtenerResumen('caja-1', 'empresa-1');

    expect(resumen.saldoEsperado).toBe(1650);
    expect(resumen.montoInicial).toBe(500);
    expect(resumen.ventasEfectivo).toBe(1000);
    expect(resumen.ingresos).toBe(200);
    expect(resumen.egresos).toBe(50);
  });

  it('debería rechazar abrir caja en sucursal de otra empresa', async () => {
    sucursalRepository.findOne.mockResolvedValue(null);

    await expect(service.abrir('empresa-A', 'sucursal-B', 'usuario-1', 100))
      .rejects.toThrow('La sucursal no existe o no pertenece a tu empresa');
  });
});
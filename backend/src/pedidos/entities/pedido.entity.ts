import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Caja } from '../../cajas/entities/caja.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', default: 'PAGADO' })
  estado: string;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estadoCocina: string;

  @Column({ type: 'varchar', default: 'EFECTIVO' })
  metodoPago: string;

  @Column({ type: 'varchar', nullable: true })
  direccionEntrega: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoEnvio: number;

  @Column({ type: 'varchar', default: 'NO_APLICA' })
  estadoDelivery: string;

  @Column({ type: 'varchar', default: 'FACTURA_B' })
  tipoFactura: string;

  @Column({ type: 'varchar', nullable: true })
  cuitFactura: string | null;

  @Column({ type: 'varchar', nullable: true })
  razonSocialFactura: string | null;

  @Column({ type: 'varchar', nullable: true })
  numeroComprobante: string | null;

  @Column({ type: 'varchar', nullable: true })
  caeSimulado: string | null;

  // CAMPOS PARA AUDITORÍA DE ANULACIÓN
  @Column({ type: 'varchar', nullable: true })
  motivoAnulacion: string | null;

  @Column({ type: 'uuid', nullable: true })
  usuarioAnulacionId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fechaAnulacion: Date | null;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column('uuid', { nullable: true })
  sucursalId: string;

  @ManyToOne(() => Mesa, { nullable: true })
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @Column('uuid', { nullable: true })
  mesaId: string;

  @ManyToOne(() => Caja, { nullable: true })
  @JoinColumn({ name: 'caja_id' })
  caja: Caja;

  @Column('uuid', { nullable: true })
  cajaId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column('uuid', { nullable: true })
  clienteId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PedidoDetalle, detalle => detalle.pedido, { cascade: true })
  detalles: PedidoDetalle[];
}
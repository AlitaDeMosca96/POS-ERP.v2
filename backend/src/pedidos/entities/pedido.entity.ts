import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Index, DeleteDateColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Caja } from '../../cajas/entities/caja.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('pedidos')
@Index(['empresaId', 'createdAt'])
@Index(['sucursalId'])
@Index(['estado'])
@Index(['cajaId'])
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  subtotal: number; // Neto total

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  ivaTotal: number; // IVA total

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total: number; // Total final con IVA

  @Column({ type: 'varchar', default: 'PAGADO' })
  estado: string;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estadoCocina: string;

  @Column({ type: 'varchar', default: 'EFECTIVO' })
  metodoPago: string;

  @Column({ type: 'varchar', nullable: true })
  direccionEntrega: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  costoEnvio: number;

  @Column({ type: 'varchar', default: 'NO_APLICA' })
  estadoDelivery: string;

  @Column({ type: 'varchar', nullable: true })
  motivoAnulacion: string | null;

  @Column({ type: 'uuid', nullable: true })
  usuarioAnulacionId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  fechaAnulacion: Date | null;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Sucursal;

  @Column('uuid', { nullable: true })
  sucursalId: string;

  @ManyToOne(() => Mesa, { nullable: true })
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @Column('uuid', { nullable: true })
  mesaId: string;

  @ManyToOne(() => Caja, { nullable: true })
  @JoinColumn({ name: 'cajaId' })
  caja: Caja;

  @Column('uuid', { nullable: true })
  cajaId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column('uuid', { nullable: true })
  clienteId: string;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => PedidoDetalle, detalle => detalle.pedido, { cascade: true })
  detalles: PedidoDetalle[];
}
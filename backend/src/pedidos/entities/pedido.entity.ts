import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Caja } from '../../cajas/entities/caja.entity';
import { Cliente } from '../../clientes/entities/cliente.entity'; // <-- NUEVO

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

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

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

  // RELACIÓN CON CLIENTE
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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', default: 'ABIERTO' })
  estado: string; // ABIERTO o PAGADO

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  // RELACIÓN CON MESA (Opcional, por si venden en mostrador)
  @ManyToOne(() => Mesa, { nullable: true })
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @Column('uuid', { nullable: true })
  mesaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PedidoDetalle, detalle => detalle.pedido, { cascade: true })
  detalles: PedidoDetalle[];
}
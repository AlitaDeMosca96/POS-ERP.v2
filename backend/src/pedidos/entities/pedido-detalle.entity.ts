import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('pedido_detalles')
export class PedidoDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notas: string;

  @Column({ type: 'jsonb', nullable: true })
  recetaSnapshot: Array<{ insumoId: string; nombre: string; cantidad: number }> | null;

  @ManyToOne(() => Pedido, pedido => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
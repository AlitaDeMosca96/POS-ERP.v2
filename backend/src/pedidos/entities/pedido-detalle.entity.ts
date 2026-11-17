import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('pedido_detalles')
export class PedidoDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  precioUnitario: number; // Precio final con IVA incluido

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  subtotal: number; // Neto (sin IVA)

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 21 })
  alicuotaIva: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  ivaTotal: number; // Monto del IVA de esta línea

  @Column({ type: 'varchar', length: 255, nullable: true })
  notas: string;

  @Column({ type: 'jsonb', nullable: true })
  recetaSnapshot: Array<{ insumoId: string; nombre: string; cantidad: number }> | null;

  @ManyToOne(() => Pedido, pedido => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @Column('uuid')
  pedidoId: string;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column('uuid')
  productoId: string;
}
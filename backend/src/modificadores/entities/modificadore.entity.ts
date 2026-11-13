import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('modificadores')
export class Modificadore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string; // Ej: "Sin cebolla", "Bien cocido", "Con queso extra"

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioExtra: number; // Si es gratis, es 0. Si cuesta $500, se suma al total.

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column('uuid')
  productoId: string;
}
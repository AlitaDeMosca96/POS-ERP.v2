import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Insumo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'insumo_id' })
  insumo: Insumo;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @CreateDateColumn()
  createdAt: Date;
}
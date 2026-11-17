import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column('uuid')
  productoId: string;

  @ManyToOne(() => Insumo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @Column('uuid')
  insumoId: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  cantidad: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
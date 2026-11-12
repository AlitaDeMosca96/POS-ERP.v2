import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // RELACIÓN CON EL PRODUCTO QUE SE VENDE
  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column('uuid')
  productoId: string;

  // RELACIÓN CON EL INSUMO QUE SE CONSUME
  @ManyToOne(() => Insumo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'insumo_id' })
  insumo: Insumo;

  @Column('uuid')
  insumoId: string;

  // CANTIDAD DEL INSUMO NECESARIA PARA 1 UNIDAD DEL PRODUCTO
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @CreateDateColumn()
  createdAt: Date;
}
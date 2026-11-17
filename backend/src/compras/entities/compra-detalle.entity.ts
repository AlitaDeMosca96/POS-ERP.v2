import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Compra } from './compra.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';

@Entity('compra_detalles')
export class CompraDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  cantidad: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  costoUnitario: number;

  @ManyToOne(() => Compra, compra => compra.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compraId' })
  compra: Compra;

  @Column('uuid')
  compraId: string;

  @ManyToOne(() => Insumo)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @Column('uuid')
  insumoId: string;
}
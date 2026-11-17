import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Proveedore } from '../../proveedores/entities/proveedore.entity';
import { CompraDetalle } from './compra-detalle.entity';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Proveedore)
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedore;

  @Column('uuid')
  proveedorId: string;

  @Column({ type: 'boolean', default: false })
  pagada: boolean;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;

  @OneToMany(() => CompraDetalle, detalle => detalle.compra, { cascade: true })
  detalles: CompraDetalle[];
}
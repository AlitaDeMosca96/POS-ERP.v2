import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Proveedore } from '../../proveedores/entities/proveedore.entity';
import { CompraDetalle } from './compra-detalle.entity';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Proveedore)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedore;

  @Column('uuid')
  proveedorId: string;

  @CreateDateColumn()
  fecha: Date;

  @OneToMany(() => CompraDetalle, detalle => detalle.compra, { cascade: true })
  detalles: CompraDetalle[];
}
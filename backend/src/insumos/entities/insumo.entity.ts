import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, default: 'UNIDAD' })
  unidadMedida: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  stock: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  costo: number;

  @Column({ type: 'boolean', default: true })
  controlaStock: boolean; // <-- NUEVO

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
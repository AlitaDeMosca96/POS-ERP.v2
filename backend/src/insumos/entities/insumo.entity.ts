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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costo: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costo: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column('uuid', { nullable: true })
  categoriaId: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
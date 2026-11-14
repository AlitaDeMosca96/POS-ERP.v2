import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, default: 'CAJERO' })
  rol: string; 

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column('uuid', { nullable: true })
  sucursalId: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  twoFactorSecret: string;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
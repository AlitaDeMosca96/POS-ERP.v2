import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity'; // <-- NUEVO

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, default: 'CAJERO' })
  rol: string; // ADMIN, CAJERO, COCINERO

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  // RELACIÓN CON SUCURSAL
  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column('uuid', { nullable: true })
  sucursalId: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
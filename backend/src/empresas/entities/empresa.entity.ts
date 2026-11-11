import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  cuit: string;

  @Column({ type: 'varchar', length: 10, default: 'ARS' })
  monedaBase: string;

  @Column({ type: 'jsonb', nullable: true })
  configuracionRegional: any;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
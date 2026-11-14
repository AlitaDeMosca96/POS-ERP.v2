import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity'; // <-- NUEVO

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'int', default: 4 })
  capacidad: number;

  @Column({ type: 'varchar', default: 'LIBRE' })
  estado: string;

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

  @CreateDateColumn()
  createdAt: Date;
}
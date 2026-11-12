import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  nombre: string; // Ej: "Mesa 1", "Barra 2"

  @Column({ type: 'int', default: 4 })
  capacidad: number;

  @Column({ type: 'varchar', default: 'LIBRE' })
  estado: string; // LIBRE, OCUPADA

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @CreateDateColumn()
  createdAt: Date;
}
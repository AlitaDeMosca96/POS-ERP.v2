import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('campanias')
export class Campania {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  asunto: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'int', default: 0 })
  cantidadEnviados: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}
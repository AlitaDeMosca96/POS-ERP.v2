import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoInicial: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoFinal: number;

  @Column({ type: 'varchar', default: 'ABIERTA' })
  estado: string; // ABIERTA, CERRADA

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column('uuid')
  usuarioId: string;

  @CreateDateColumn()
  fechaApertura: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaCierre: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
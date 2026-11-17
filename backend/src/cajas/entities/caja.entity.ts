import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, DeleteDateColumn } from 'typeorm';

@Entity('cajas')
@Index(['empresaId', 'sucursalId'])
@Index(['estado'])
export class Caja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  empresaId: string;

  @Column({ nullable: true })
  sucursalId: string;

  @Column({ nullable: true })
  usuarioAperturaId: string;

  @Column({ nullable: true })
  usuarioCierreId: string;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  montoInicial: number;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  saldoEsperado: number;

  @Column('numeric', { precision: 14, scale: 2, default: 0, nullable: true })
  saldoFinal: number;

  @Column({ default: 'ABIERTA' })
  estado: string;

  @Column({ type: 'timestamptz', nullable: true })
  fechaCierre: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
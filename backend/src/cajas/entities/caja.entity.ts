import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cajas')
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

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montoInicial: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  saldoEsperado: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, nullable: true })
  saldoFinal: number;

  @Column({ default: 'ABIERTA' })
  estado: string;

  @Column({ nullable: true })
  fechaCierre: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
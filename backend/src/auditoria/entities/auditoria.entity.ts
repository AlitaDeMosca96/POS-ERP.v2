import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auditorias_sistema')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  empresaId: string | null;

  @Column({ type: 'uuid', nullable: true })
  usuarioId: string | null;

  @Column({ type: 'varchar', length: 50 })
  entidad: string;

  @Column({ type: 'uuid', nullable: true })
  entidadId: string | null;

  @Column({ type: 'varchar', length: 50 })
  accion: string;

  @Column({ type: 'jsonb', nullable: true })
  datosAnteriores: any;

  @Column({ type: 'jsonb', nullable: true })
  datosNuevos: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}
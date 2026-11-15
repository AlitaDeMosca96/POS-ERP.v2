import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auditorias_sistema')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  @Column({ type: 'uuid', nullable: true })
  usuarioId: string;

  @Column({ type: 'varchar', length: 50 })
  entidad: string; // 'PEDIDO', 'CAJA', 'PRODUCTO', etc.

  @Column({ type: 'uuid', nullable: true })
  entidadId: string;

  @Column({ type: 'varchar', length: 50 })
  accion: string; // 'CREAR', 'ANULAR', 'CERRAR', 'MOVIMIENTO'

  @Column({ type: 'jsonb', nullable: true })
  datosAnteriores: any;

  @Column({ type: 'jsonb', nullable: true })
  datosNuevos: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo: string;

  @CreateDateColumn()
  fecha: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auditorias')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  accion: string; // Ej: "Creó la empresa X", "Suspendió a Y"

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'info', 'success', 'danger'

  @CreateDateColumn()
  fecha: Date;
}
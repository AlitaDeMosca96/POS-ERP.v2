import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auditorias')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  accion: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'info', 'success', 'danger', 'warning'

  // Nuevo: Quién hizo la acción
  @Column({ type: 'varchar', length: 255, nullable: true })
  adminEmail: string;

  @CreateDateColumn()
  fecha: Date;
}
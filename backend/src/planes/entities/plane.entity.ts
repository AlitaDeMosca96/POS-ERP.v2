import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('planes')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string; // Ej: Básico, Pro, Enterprise

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioMensual: number;

  @Column({ type: 'int', default: 1 })
  limiteSucursales: number; // -1 significa ilimitado

  @Column({ type: 'int', default: 5 })
  limiteUsuarios: number; // -1 significa ilimitado

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
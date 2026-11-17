import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Caja } from './caja.entity';

@Entity('movimientos_caja')
export class MovimientoCaja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  monto: number;

  @Column({ type: 'varchar', length: 255 })
  motivo: string;

  @ManyToOne(() => Caja, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cajaId' })
  caja: Caja;

  @Column('uuid')
  cajaId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}
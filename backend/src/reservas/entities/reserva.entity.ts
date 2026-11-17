import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  fechaHora: Date;

  @Column({ type: 'int' })
  cantidadPersonas: number;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Mesa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @Column('uuid')
  mesaId: string;

  @ManyToOne(() => Cliente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column('uuid')
  clienteId: string;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
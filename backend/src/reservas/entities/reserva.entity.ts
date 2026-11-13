import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  fechaHora: Date;

  @Column({ type: 'int' })
  cantidadPersonas: number;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Mesa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @ManyToOne(() => Cliente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @CreateDateColumn()
  createdAt: Date;
}
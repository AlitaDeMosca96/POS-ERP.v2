import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('movimientos_stock')
export class MovimientoStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column('uuid', { nullable: true })
  insumoId: string;

  @ManyToOne(() => Insumo, { nullable: true })
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @Column('uuid', { nullable: true })
  productoId: string;

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // ENTRADA, SALIDA, AJUSTE

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  cantidad: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  stockResultante: number;

  @Column({ type: 'varchar', length: 255 })
  motivo: string;

  @Column('uuid', { nullable: true })
  usuarioId: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}
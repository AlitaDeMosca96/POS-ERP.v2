import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { MetricsService } from './metrics.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly metricsService: MetricsService,
    private readonly jwtService: JwtService,
  ) {}

  async getDashboardMetrics() {
    return this.metricsService.getDashboardData();
  }

  async getEmpresas() {
    const empresas = await this.empresaRepository.find({ 
      order: { createdAt: 'DESC' },
      relations: { plan: true }
    });
    
    return Promise.all(empresas.map(async (emp) => {
      const usuariosCount = await this.usuarioRepository.count({ where: { empresaId: emp.id } });
      const pedidos = await this.pedidoRepository.find({ where: { empresaId: emp.id, estado: 'PAGADO' } });
      const totalVentas = pedidos.reduce((acc, ped) => acc + Number(ped.total), 0);

      return {
        id: emp.id,
        nombre: emp.nombre,
        cuit: emp.cuit,
        activa: emp.activa,
        usuarios: usuariosCount,
        totalVentas,
        fechaAlta: emp.createdAt,
        plan: emp.plan ? emp.plan.nombre : 'Sin Plan'
      };
    }));
  }

  async crearEmpresa(data: any, adminEmail: string) {
    const empresa = this.empresaRepository.create({
      nombre: data.nombre,
      cuit: data.cuit,
      monedaBase: 'ARS',
      activa: true,
      planId: data.planId || undefined,
      plan: data.planId ? { id: data.planId } : undefined
    });
    await this.empresaRepository.save(empresa);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.adminPassword, salt);

    const admin = this.usuarioRepository.create({
      email: data.adminEmail,
      password: hashedPassword, 
      nombre: data.adminNombre,
      rol: 'ADMIN',
      empresaId: empresa.id
    });
    await this.usuarioRepository.save(admin);

    await this.metricsService.registrarLog(`Se creó la empresa: ${empresa.nombre}`, 'success', adminEmail);

    return empresa;
  }

  async toggleEstado(id: string, adminEmail: string) {
    const empresa = await this.empresaRepository.findOneBy({ id });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    empresa.activa = !empresa.activa;
    await this.empresaRepository.save(empresa);

    const accion = empresa.activa ? 'activó' : 'suspendió';
    const tipo = empresa.activa ? 'info' : 'danger';
    await this.metricsService.registrarLog(`Super Admin ${accion} a la empresa: ${empresa.nombre}`, tipo, adminEmail);

    return empresa;
  }

  async impersonarAdmin(empresaId: string, adminEmail: string) {
    const admin = await this.usuarioRepository.findOne({ 
      where: { empresaId, rol: 'ADMIN' },
      relations: { empresa: true }
    });

    if (!admin) throw new NotFoundException('No se encontró un administrador para esta empresa');

    await this.metricsService.registrarLog(`Super Admin ingresó como soporte a: ${admin.empresa.nombre}`, 'warning', adminEmail);

    const payload = { 
      sub: admin.id, email: admin.email, rol: admin.rol, empresaId: admin.empresaId, sucursalId: admin.sucursalId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol, empresaId: admin.empresaId, sucursalId: admin.sucursalId }
    };
  }
}
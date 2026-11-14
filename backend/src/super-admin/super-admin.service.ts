import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Auditoria } from './entities/auditoria.entity'; // <-- NUEVO
import { JwtService } from '@nestjs/jwt';
import * as os from 'os';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Auditoria) // <-- NUEVO
    private readonly auditoriaRepository: Repository<Auditoria>,
    private readonly jwtService: JwtService,
  ) {}

  private async registrarLog(accion: string, tipo: string) {
    const log = this.auditoriaRepository.create({ accion, tipo });
    await this.auditoriaRepository.save(log);
  }

  async getDashboardMetrics() {
    const empresas = await this.empresaRepository.find({ relations: { plan: true } });
    
    let mrr = 0;
    let empresasActivas = 0;
    let empresasSuspendidas = 0;

    empresas.forEach(emp => {
      if (emp.activa) {
        empresasActivas++;
        if (emp.plan) mrr += Number(emp.plan.precioMensual);
      } else {
        empresasSuspendidas++;
      }
    });

    const totalUsuarios = await this.usuarioRepository.count();
    
    const totalMemoriaGB = os.totalmem() / (1024 ** 3);
    const memoriaLibreGB = os.freemem() / (1024 ** 3);
    const usoMemoriaPorcentaje = ((totalMemoriaGB - memoriaLibreGB) / totalMemoriaGB) * 100;
    
    // Traemos las últimas 5 acciones reales
    const auditorias = await this.auditoriaRepository.find({
      order: { fecha: 'DESC' },
      take: 5
    });

    return {
      mrr,
      empresasActivas,
      empresasSuspendidas,
      totalUsuarios,
      servidor: {
        usoMemoria: usoMemoriaPorcentaje.toFixed(1),
        memoriaTotal: totalMemoriaGB.toFixed(1),
        cargaCpu: os.loadavg()[0].toFixed(2),
        plataforma: os.platform(),
        uptimeHoras: (os.uptime() / 3600).toFixed(1)
      },
      auditorias // <-- DEVOLVEMOS EL HISTORIAL REAL
    };
  }

  async getEmpresas() {
    const empresas = await this.empresaRepository.find({ 
      order: { createdAt: 'DESC' },
      relations: { plan: true }
    });
    
    const resultado = await Promise.all(empresas.map(async (emp) => {
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

    return resultado;
  }

  async crearEmpresa(data: any) {
    const empresa = this.empresaRepository.create({
      nombre: data.nombre,
      cuit: data.cuit,
      monedaBase: 'ARS',
      activa: true,
      planId: data.planId || undefined,
      plan: data.planId ? { id: data.planId } : undefined
    });
    await this.empresaRepository.save(empresa);

    const admin = this.usuarioRepository.create({
      email: data.adminEmail,
      password: data.adminPassword, 
      nombre: data.adminNombre,
      rol: 'ADMIN',
      empresaId: empresa.id
    });
    await this.usuarioRepository.save(admin);

    // REGISTRAMOS LA ACCIÓN
    await this.registrarLog(`Se creó la empresa: ${empresa.nombre}`, 'success');

    return empresa;
  }

  async toggleEstado(id: string) {
    const empresa = await this.empresaRepository.findOneBy({ id });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    empresa.activa = !empresa.activa;
    await this.empresaRepository.save(empresa);

    // REGISTRAMOS LA ACCIÓN
    const accion = empresa.activa ? 'activó' : 'suspendió';
    const tipo = empresa.activa ? 'info' : 'danger';
    await this.registrarLog(`Super Admin ${accion} a la empresa: ${empresa.nombre}`, tipo);

    return empresa;
  }

  async impersonarAdmin(empresaId: string) {
    const admin = await this.usuarioRepository.findOne({ 
      where: { empresaId, rol: 'ADMIN' },
      relations: { empresa: true }
    });

    if (!admin) throw new NotFoundException('No se encontró un administrador para esta empresa');

    // REGISTRAMOS LA ACCIÓN
    await this.registrarLog(`Super Admin ingresó como soporte a: ${admin.empresa.nombre}`, 'warning');

    const payload = { 
      sub: admin.id, email: admin.email, rol: admin.rol, empresaId: admin.empresaId, sucursalId: admin.sucursalId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol, empresaId: admin.empresaId, sucursalId: admin.sucursalId }
    };
  }
}
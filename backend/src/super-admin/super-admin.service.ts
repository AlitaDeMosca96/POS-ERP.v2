import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { JwtService } from '@nestjs/jwt';
import * as os from 'os'; // <-- NUEVO

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly jwtService: JwtService,
  ) {}

  async getDashboardMetrics() {
    // 1. Métricas SaaS
    const empresas = await this.empresaRepository.find({ relations: { plan: true } });
    
    let mrr = 0;
    let empresasActivas = 0;
    let empresasSuspendidas = 0;

    empresas.forEach(emp => {
      if (emp.activa) {
        empresasActivas++;
        if (emp.plan) {
          mrr += Number(emp.plan.precioMensual);
        }
      } else {
        empresasSuspendidas++;
      }
    });

    const totalUsuarios = await this.usuarioRepository.count();
    
    // 2. Salud del Servidor (Hardware)
    const totalMemoriaGB = os.totalmem() / (1024 ** 3);
    const memoriaLibreGB = os.freemem() / (1024 ** 3);
    const usoMemoriaPorcentaje = ((totalMemoriaGB - memoriaLibreGB) / totalMemoriaGB) * 100;
    
    const cargaCpu = os.loadavg()[0]; // Carga promedio en el último minuto
    
    // 3. Últimos 5 clientes registrados
    const ultimosClientes = await this.empresaRepository.find({
      order: { createdAt: 'DESC' },
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
        cargaCpu: cargaCpu.toFixed(2),
        plataforma: os.platform(),
        uptimeHoras: (os.uptime() / 3600).toFixed(1)
      },
      ultimosClientes: ultimosClientes.map(c => ({
        nombre: c.nombre,
        fecha: c.createdAt
      }))
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

    return empresa;
  }

  async toggleEstado(id: string) {
    const empresa = await this.empresaRepository.findOneBy({ id });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    empresa.activa = !empresa.activa;
    await this.empresaRepository.save(empresa);
    return empresa;
  }

  async impersonarAdmin(empresaId: string) {
    const admin = await this.usuarioRepository.findOne({ 
      where: { empresaId, rol: 'ADMIN' } 
    });

    if (!admin) throw new NotFoundException('No se encontró un administrador para esta empresa');

    const payload = { 
      sub: admin.id, 
      email: admin.email, 
      rol: admin.rol, 
      empresaId: admin.empresaId,
      sucursalId: admin.sucursalId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        empresaId: admin.empresaId,
        sucursalId: admin.sucursalId
      }
    };
  }
}
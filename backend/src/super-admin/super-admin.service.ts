import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { JwtService } from '@nestjs/jwt';

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

  async getEmpresas() {
    const empresas = await this.empresaRepository.find({ 
      order: { createdAt: 'DESC' },
      relations: { plan: true } // <-- Traemos el plan
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
        plan: emp.plan ? emp.plan.nombre : 'Sin Plan' // <-- Lo enviamos al frontend
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
      planId: data.planId || undefined, // <-- Asignamos el plan
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
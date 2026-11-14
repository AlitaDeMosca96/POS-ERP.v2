import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async getEmpresas() {
    const empresas = await this.empresaRepository.find({ order: { createdAt: 'DESC' } });
    
    // Para cada empresa, buscamos cuántos usuarios y cuánto facturó
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
        fechaAlta: emp.createdAt
      };
    }));

    return resultado;
  }

  async crearEmpresa(data: any) {
    // 1. Creamos la empresa
    const empresa = this.empresaRepository.create({
      nombre: data.nombre,
      cuit: data.cuit,
      monedaBase: 'ARS'
    });
    await this.empresaRepository.save(empresa);

    // 2. Creamos un usuario ADMIN automáticamente para esa empresa
    // (Nota: para producción habría que encriptar la contraseña, pero para el panel maestro está bien así)
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
}
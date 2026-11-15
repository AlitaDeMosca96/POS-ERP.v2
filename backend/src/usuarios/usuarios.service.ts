import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async findAll(empresaId?: string) {
    const where: any = {};
    if (empresaId) where.empresaId = empresaId;
    return this.usuarioRepository.find({ 
      where,
      select: { id: true, email: true, rol: true, activo: true, empresaId: true, sucursalId: true } 
    });
  }

  async findOne(id: string, empresaId?: string) {
    const where: any = { id };
    if (empresaId) where.empresaId = empresaId;
    
    const usuario = await this.usuarioRepository.findOne({ 
      where,
      relations: { empresa: true }, // <-- AGREGADO PARA VALIDAR EMPRESA ACTIVA
      select: { 
        id: true, email: true, rol: true, activo: true, 
        empresaId: true, sucursalId: true, intentosFallidos: true, bloqueadoHasta: true
      }
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async findByEmail(email: string) {
    return this.usuarioRepository.findOne({ 
      where: { email },
      select: { 
        id: true, email: true, password: true, rol: true, activo: true, 
        empresaId: true, sucursalId: true, twoFactorSecret: true, twoFactorEnabled: true,
        intentosFallidos: true, bloqueadoHasta: true
      }
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto, empresaId?: string) {
    const usuario = await this.findOne(id, empresaId); 
    await this.usuarioRepository.update(usuario.id, updateUsuarioDto);
    return this.findOne(usuario.id, empresaId);
  }

  async remove(id: string, empresaId?: string) {
    const usuario = await this.findOne(id, empresaId);
    await this.usuarioRepository.delete(usuario.id);
    return { message: 'Usuario eliminado correctamente' };
  }

  async registrarIntentoFallido(email: string) {
    const usuario = await this.findByEmail(email);
    if (!usuario) return;

    const intentos = usuario.intentosFallidos + 1;
    let bloqueadoHasta: Date | null = null;

    if (intentos >= 5) {
      bloqueadoHasta = new Date();
      bloqueadoHasta.setMinutes(bloqueadoHasta.getMinutes() + 15);
    }

    await this.usuarioRepository.update(usuario.id, { intentosFallidos: intentos, bloqueadoHasta });
  }

  async resetearIntentosFallidos(email: string) {
    const usuario = await this.findByEmail(email);
    if (!usuario) return;
    await this.usuarioRepository.update(usuario.id, { intentosFallidos: 0, bloqueadoHasta: null });
  }
}
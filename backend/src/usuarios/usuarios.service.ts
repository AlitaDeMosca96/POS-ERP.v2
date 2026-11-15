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
      select: { id: true, email: true, rol: true, activo: true, empresaId: true, sucursalId: true }
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async findByEmail(email: string) {
    return this.usuarioRepository.findOne({ 
      where: { email },
      select: { id: true, email: true, password: true, rol: true, activo: true, empresaId: true, sucursalId: true, twoFactorSecret: true, twoFactorEnabled: true }
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
}
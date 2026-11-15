import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { Rol } from './enums/rol.enum'; // <-- IMPORTAMOS EL ENUM

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuarioRepository.create({
      email: createUsuarioDto.email,
      password: createUsuarioDto.password,
      nombre: createUsuarioDto.nombre,
      rol: createUsuarioDto.rol || Rol.CAJERO, // <-- USAMOS EL ENUM
      empresaId: createUsuarioDto.empresaId,
      sucursal: createUsuarioDto.sucursalId ? { id: createUsuarioDto.sucursalId } : undefined
    });
    
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
    
    return this.usuarioRepository.save(usuario);
  }

  findAll(empresaId: string) {
    return this.usuarioRepository.find({ 
      where: { empresaId },
      relations: { empresa: true, sucursal: true } 
    });
  }

  findOne(id: string) {
    return this.usuarioRepository.findOne({ 
      where: { id },
      relations: { empresa: true, sucursal: true }
    });
  }

  async findByEmail(email: string) {
    return this.usuarioRepository.createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .addSelect('usuario.twoFactorSecret')
      .leftJoinAndSelect('usuario.empresa', 'empresa')
      .leftJoinAndSelect('usuario.sucursal', 'sucursal')
      .where('usuario.email = :email', { email })
      .getOne();
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }
    return this.usuarioRepository.update(id, updateUsuarioDto as any);
  }

  async remove(id: string) {
    return this.usuarioRepository.softDelete(id);
  }
}
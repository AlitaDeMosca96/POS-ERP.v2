import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';

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
      rol: createUsuarioDto.rol || 'CAJERO',
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

  findByEmail(email: string) {
    return this.usuarioRepository.findOne({ 
      where: { email },
      relations: { empresa: true, sucursal: true }
    });
  }

  update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioRepository.update(id, updateUsuarioDto);
  }

  remove(id: string) {
    return this.usuarioRepository.delete(id);
  }
}
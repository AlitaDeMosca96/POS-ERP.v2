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
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
    return this.usuarioRepository.save(usuario);
  }

  findAll() {
    return this.usuarioRepository.find({ relations: { empresa: true } });
  }

  findOne(id: string) {
    return this.usuarioRepository.findOne({ 
      where: { id },
      relations: { empresa: true }
    });
  }

  // NUEVA FUNCIÓN
  findByEmail(email: string) {
    return this.usuarioRepository.findOne({ 
      where: { email },
      relations: { empresa: true }
    });
  }

  update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioRepository.update(id, updateUsuarioDto);
  }

  remove(id: string) {
    return this.usuarioRepository.delete(id);
  }
}
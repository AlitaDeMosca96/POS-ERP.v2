import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const existe = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });

    return this.usuarioRepository.save(usuario);
  }

  findAll(empresaId: string, sucursalId: string | null) {
    const where: any = { empresaId };
    if (sucursalId) where.sucursalId = sucursalId;
    return this.usuarioRepository.find({ where, relations: { sucursal: true } });
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async findByEmail(email: string) {
    return this.usuarioRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'nombre', 'rol', 'empresaId', 'sucursalId', 'activo', 'twoFactorSecret', 'twoFactorEnabled', 'intentosFallidos', 'bloqueadoHasta']
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt(12);
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }
    return this.usuarioRepository.update(id, updateUsuarioDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.usuarioRepository.softDelete(id);
  }

  async registrarIntentoFallido(email: string) {
    const user = await this.findByEmail(email);
    if (!user) return;

    const intentos = (user.intentosFallidos || 0) + 1;
    let bloqueadoHasta = user.bloqueadoHasta;

    if (intentos >= 5) {
      bloqueadoHasta = new Date();
      bloqueadoHasta.setMinutes(bloqueadoHasta.getMinutes() + 15);
    }

    await this.usuarioRepository.update(user.id, { intentosFallidos: intentos, bloqueadoHasta });
  }

  async resetearIntentosFallidos(email: string) {
    const user = await this.findByEmail(email);
    if (!user) return;
    await this.usuarioRepository.update(user.id, { intentosFallidos: 0, bloqueadoHasta: null });
  }
}
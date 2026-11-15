import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usuariosService: UsuariosService;

  const mockUsuariosService = {
    findByEmail: jest.fn(),
    resetearIntentosFallidos: jest.fn(),
    registrarIntentoFallido: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token_falso_123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
  });

  it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
    mockUsuariosService.findByEmail.mockResolvedValue(null);
    const resultado = await authService.validateUser('no@existe.com', '123');
    expect(resultado).toBeNull();
  });

  it('debería retornar null si la contraseña es incorrecta', async () => {
    const hashIncorrecto = await bcrypt.hash('otra_clave', 10);
    mockUsuariosService.findByEmail.mockResolvedValue({ 
      password: hashIncorrecto, 
      rol: 'ADMIN',
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });
    
    const resultado = await authService.validateUser('test@test.com', 'clave_mala');
    expect(resultado).toBeNull();
  });

  it('debería devolver el usuario si las credenciales son correctas', async () => {
    const hashCorrecto = await bcrypt.hash('clave_buena', 10);
    mockUsuariosService.findByEmail.mockResolvedValue({ 
      id: '123', email: 'test@test.com', password: hashCorrecto, rol: 'ADMIN', empresaId: 'emp-1',
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });
    
    const resultado = await authService.validateUser('test@test.com', 'clave_buena');
    expect(resultado).toBeDefined();
    expect(resultado.email).toBe('test@test.com');
  });
});
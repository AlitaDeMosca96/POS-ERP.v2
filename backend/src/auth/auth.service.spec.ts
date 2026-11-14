import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usuariosService: UsuariosService;

  // Mock de UsuariosService
  const mockUsuariosService = {
    findByEmail: jest.fn(),
  };

  // Mock de JwtService
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
    await expect(authService.login({ email: 'no@existe.com', password: '123' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
    const hashIncorrecto = await bcrypt.hash('otra_clave', 10);
    mockUsuariosService.findByEmail.mockResolvedValue({ 
      password: hashIncorrecto, 
      rol: 'ADMIN' 
    });
    
    await expect(authService.login({ email: 'test@test.com', password: 'clave_mala' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('debería devolver un token si las credenciales son correctas', async () => {
    const hashCorrecto = await bcrypt.hash('clave_buena', 10);
    mockUsuariosService.findByEmail.mockResolvedValue({ 
      id: '123', email: 'test@test.com', password: hashCorrecto, rol: 'ADMIN', empresaId: 'emp-1' 
    });
    
    const resultado = await authService.login({ email: 'test@test.com', password: 'clave_buena' });
    expect(resultado.access_token).toBe('token_falso_123');
  });
});
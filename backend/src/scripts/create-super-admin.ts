import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Rol } from '../usuarios/enums/rol.enum';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

async function bootstrap() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve));

  const email = await question('Email del Super Admin: ');
  const password = await question('Contraseña (mín. 8 caracteres, 1 mayúscula, 1 número, 1 símbolo): ');

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!regex.test(password)) {
    console.error('\n❌ Error: La contraseña no cumple con la política de seguridad.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  const existe = await usuariosService.findByEmail(email);
  if (existe) {
    console.error('\n❌ Error: El email ya está registrado.');
    await app.close();
    process.exit(1);
  }

  // El servicio ya hashea la contraseña con bcrypt
  await usuariosService.create({
    email,
    password,
    nombre: 'Super Admin',
    rol: Rol.SUPER_ADMIN,
  });

  console.log('\n✅ Super Admin creado con éxito.');
  console.log('⚠️ IMPORTANTE: Logueate en el sistema y configurá el 2FA de inmediato (es obligatorio por auditoría).');
  
  await app.close();
  rl.close();
}

bootstrap();
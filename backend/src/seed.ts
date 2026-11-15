import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsuariosService } from './usuarios/usuarios.service';
import { Rol } from './usuarios/enums/rol.enum';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  const email = 'admin@tuapp.com';
  const password = 'admin123';
  
  const existe = await usuariosService.findByEmail(email);
  if (!existe) {
    const hash = await bcrypt.hash(password, 10);
    await usuariosService.create({
      email,
      password: hash,
      nombre: 'Super Admin',
      rol: Rol.SUPER_ADMIN,
    });
    console.log('✅ Super Admin creado con éxito:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log('⚠️ El Super Admin ya existe en la base de datos.');
  }
  await app.close();
}
bootstrap();
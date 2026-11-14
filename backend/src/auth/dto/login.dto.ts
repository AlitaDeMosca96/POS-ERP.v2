export class LoginDto {
  email: string;
  password: string;
  twoFactorCode?: string; // <-- Agregar esta línea
}
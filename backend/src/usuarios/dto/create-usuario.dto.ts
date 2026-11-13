export class CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  rol?: string;
  empresaId: string;
  sucursalId?: string; // <-- NUEVO
}
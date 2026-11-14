export class CreateCajaDto {
  saldoInicial: number;
  usuarioId: string;
  empresaId: string;
  sucursalId?: string; // <-- NUEVO
}
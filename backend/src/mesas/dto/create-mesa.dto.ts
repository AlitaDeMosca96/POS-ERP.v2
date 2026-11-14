export class CreateMesaDto {
  nombre: string;
  capacidad: number;
  empresaId: string;
  sucursalId?: string; // <-- NUEVO
}
export class CreateProductoDto {
  nombre: string;
  precio: number;
  costo: number;
  stock: number; // <-- AGREGADO
  empresaId: string;
}
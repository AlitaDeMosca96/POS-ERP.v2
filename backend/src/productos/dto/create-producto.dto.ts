export class CreateProductoDto {
  nombre: string;
  precio: number;
  costo: number;
  stock: number;
  empresaId: string;
  categoriaId?: string;
}
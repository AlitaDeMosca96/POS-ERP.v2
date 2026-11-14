import { Categoria, Producto } from '../hooks/usePOS';

interface Props {
  categorias: Categoria[];
  productos: Producto[];
  categoriaActiva: string;
  onCategoriaChange: (id: string) => void;
  onProductoClick: (p: Producto) => void;
}

export default function Catalog({ categorias, productos, categoriaActiva, onCategoriaChange, onProductoClick }: Props) {
  const filtrados = categoriaActiva === 'ALL' ? productos : productos.filter(p => p.categoriaId === categoriaActiva);

  return (
    <div className="w-2/3 flex flex-col border-r border-gray-300">
      <div className="bg-white p-4 shadow-sm flex gap-2 overflow-x-auto">
        <button onClick={() => onCategoriaChange('ALL')} className={`px-4 py-2 rounded-full font-bold ${categoriaActiva === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Todos</button>
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => onCategoriaChange(cat.id)} className={`px-4 py-2 rounded-full font-bold ${categoriaActiva === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat.nombre}</button>
        ))}
      </div>
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtrados.map(prod => (
            <button key={prod.id} onClick={() => onProductoClick(prod)} className="p-4 rounded-lg shadow border bg-white hover:shadow-lg flex flex-col justify-between h-32">
              <span className="font-bold text-gray-800 text-lg">{prod.nombre}</span>
              <span className="text-green-600 font-bold self-end text-xl">${prod.precio}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
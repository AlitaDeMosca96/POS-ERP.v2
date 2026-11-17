import { Mesa, Cliente, ItemCarrito } from '../hooks/usePOS';

interface Props {
  carrito: ItemCarrito[];
  mesas: Mesa[];
  clientes: Cliente[];
  mesaActivaId: string;
  clienteActivoId: string;
  total: number;
  onMesaChange: (id: string) => void;
  onClienteChange: (id: string) => void;
  onGuardar: () => void;
  onCobrar: () => void;
  onQuitar: (index: number) => void;
  onCambiarCantidad: (index: number, cantidad: number) => void;
}

export default function Cart({ carrito, mesas, clientes, mesaActivaId, clienteActivoId, total, onMesaChange, onClienteChange, onGuardar, onCobrar, onQuitar, onCambiarCantidad }: Props) {
  return (
    <div className="w-1/3 bg-white shadow-xl flex flex-col">
      <div className="p-4 bg-gray-800 text-white flex flex-col gap-2">
        <h2 className="text-xl font-bold">Ticket Actual</h2>
        <div className="flex gap-2">
          <select value={mesaActivaId} onChange={e => onMesaChange(e.target.value)} className="w-1/2 bg-gray-700 text-white p-1 rounded text-sm">
            <option value="">Mostrador</option>
            {mesas.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.estado === 'OCUPADA' ? '(Ocupada)' : ''}</option>)}
          </select>
          <select value={clienteActivoId} onChange={e => onClienteChange(e.target.value)} className="w-1/2 bg-gray-700 text-white p-1 rounded text-sm">
            <option value="">Consumidor Final</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {carrito.length === 0 ? <p className="text-gray-400 text-center mt-10">No hay productos</p> : (
          <ul className="space-y-3">
            {carrito.map((item, i) => (
              <li key={i} className="flex justify-between border-b pb-2 items-center">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-gray-800 leading-tight">{item.nombre}</p>
                  <p className="text-sm text-gray-500">${item.precio} c/u</p>
                  {item.notas && <p className="text-xs text-blue-600">({item.notas})</p>}
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => onCambiarCantidad(i, item.cantidad - 1)} className="w-7 h-7 bg-gray-200 rounded text-gray-700 font-bold hover:bg-gray-300 transition">-</button>
                  <span className="w-6 text-center font-bold">{item.cantidad}</span>
                  <button onClick={() => onCambiarCantidad(i, item.cantidad + 1)} className="w-7 h-7 bg-gray-200 rounded text-gray-700 font-bold hover:bg-gray-300 transition">+</button>
                </div>

                <div className="w-20 text-right font-bold text-gray-700">${(item.precio * item.cantidad).toFixed(2)}</div>
                
                <button onClick={() => onQuitar(i)} className="text-red-500 hover:text-red-700 ml-2 font-bold text-lg p-1">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-between text-2xl font-bold mb-4 text-gray-800"><span>Total:</span><span>${total.toFixed(2)}</span></div>
        <div className="flex gap-2">
          <button onClick={onGuardar} disabled={carrito.length === 0} className="w-1/2 bg-yellow-500 text-white py-3 rounded font-bold hover:bg-yellow-600 disabled:bg-gray-300 transition">Guardar Mesa</button>
          <button onClick={onCobrar} disabled={carrito.length === 0 && !mesaActivaId} className="w-1/2 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-300 transition">{carrito.length === 0 && mesaActivaId ? 'Liberar' : 'Cobrar'}</button>
        </div>
      </div>
    </div>
  );
}
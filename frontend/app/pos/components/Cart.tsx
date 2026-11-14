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
}

export default function Cart({ carrito, mesas, clientes, mesaActivaId, clienteActivoId, total, onMesaChange, onClienteChange, onGuardar, onCobrar }: Props) {
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
              <li key={i} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-semibold text-gray-800">{item.nombre}</p>
                  <p className="text-sm text-gray-500">{item.cantidad} x ${item.precio}</p>
                  {item.notas && <p className="text-xs text-blue-600">({item.notas})</p>}
                </div>
                <span className="font-bold text-gray-700">${item.precio * item.cantidad}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-between text-2xl font-bold mb-4 text-gray-800"><span>Total:</span><span>${total}</span></div>
        <div className="flex gap-2">
          <button onClick={onGuardar} disabled={carrito.length === 0} className="w-1/2 bg-yellow-500 text-white py-3 rounded font-bold hover:bg-yellow-600 disabled:bg-gray-300">Guardar Mesa</button>
          <button onClick={onCobrar} disabled={carrito.length === 0 && !mesaActivaId} className="w-1/2 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-300">{carrito.length === 0 && mesaActivaId ? 'Liberar' : 'Cobrar'}</button>
        </div>
      </div>
    </div>
  );
}
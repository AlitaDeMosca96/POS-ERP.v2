import { Modificador, Producto } from '../hooks/usePOS';

interface Props {
  producto: Producto | null;
  modificadores: Modificador[];
  seleccionados: Modificador[];
  onToggle: (mod: Modificador) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ModifierModal({ producto, modificadores, seleccionados, onToggle, onConfirm, onClose }: Props) {
  if (!producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h3 className="text-xl font-bold">Opciones para: {producto.nombre}</h3>
        </div>
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {modificadores.map(mod => (
            <label key={mod.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={seleccionados.some(m => m.id === mod.id)}
                  onChange={() => onToggle(mod)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-gray-800">{mod.nombre}</span>
              </div>
              <span className="text-green-600 font-bold">
                {Number(mod.precioExtra) > 0 ? `+ $${mod.precioExtra}` : 'Gratis'}
              </span>
            </label>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t flex gap-3">
          <button onClick={onClose} className="w-1/2 bg-gray-300 text-gray-800 font-bold py-2 rounded hover:bg-gray-400">Cancelar</button>
          <button onClick={onConfirm} className="w-1/2 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Agregar al Ticket</button>
        </div>
      </div>
    </div>
  );
}
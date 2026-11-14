import { useState } from 'react';

interface Props {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (datosPago: any) => void;
}

export default function PaymentModal({ isOpen, total, onClose, onConfirm }: Props) {
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [esDelivery, setEsDelivery] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('0');
  const [tipoFactura, setTipoFactura] = useState<'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C'>('FACTURA_B');
  const [cuit, setCuit] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

  if (!isOpen) return null;

  const totalFinal = total + (esDelivery ? Number(costoEnvio) : 0);
  const vuelto = Number(montoRecibido) - totalFinal;

  const handleConfirm = () => {
    if (metodoPago === 'EFECTIVO' && Number(montoRecibido) < totalFinal) {
      alert('El monto recibido es menor al total a pagar.');
      return;
    }
    if (esDelivery && !direccion) {
      alert('Por favor, ingresá la dirección de entrega.');
      return;
    }

    let cuitLimpio = null;
    if (tipoFactura !== 'FACTURA_B') {
      cuitLimpio = cuit.replace(/[^0-9]/g, ''); // Solo números
      if (cuitLimpio.length !== 11) {
        alert('El CUIT debe tener exactamente 11 dígitos numéricos.');
        return;
      }
    }

    onConfirm({
      metodoPago,
      direccionEntrega: esDelivery ? direccion : null,
      costoEnvio: esDelivery ? Number(costoEnvio) : 0,
      tipoFactura,
      cuitFactura: tipoFactura !== 'FACTURA_B' ? cuitLimpio : null,
      razonSocialFactura: tipoFactura !== 'FACTURA_B' ? razonSocial : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-green-600 text-white p-4 text-center">
          <h3 className="text-2xl font-bold">Cobrar Ticket</h3>
          <p className="text-3xl font-light mt-2">Total: ${totalFinal}</p>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-2">Comprobante Fiscal</label>
            <select value={tipoFactura} onChange={e => setTipoFactura(e.target.value as any)} className="w-full border p-2 rounded text-gray-800 font-medium mb-3">
              <option value="FACTURA_B">Factura B (Consumidor Final)</option>
              <option value="FACTURA_A">Factura A (Responsable Inscripto)</option>
              <option value="FACTURA_C">Factura C (Monotributista)</option>
            </select>
            {tipoFactura !== 'FACTURA_B' && (
              <div className="space-y-3 mt-3">
                <input 
                  type="text" 
                  placeholder="CUIT (11 dígitos)" 
                  value={cuit} 
                  onChange={e => setCuit(e.target.value)} 
                  maxLength={13}
                  className="w-full border p-2 rounded text-gray-800" 
                />
                <input 
                  type="text" 
                  placeholder="Razón Social" 
                  value={razonSocial} 
                  onChange={e => setRazonSocial(e.target.value)} 
                  className="w-full border p-2 rounded text-gray-800" 
                />
              </div>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={esDelivery} onChange={(e) => setEsDelivery(e.target.checked)} className="w-6 h-6 text-orange-600 rounded" />
              <span className="font-bold text-orange-800 text-lg">Es Delivery</span>
            </label>
            {esDelivery && (
              <div className="mt-4 space-y-3">
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full border p-2 rounded text-gray-800" placeholder="Dirección de entrega..." />
                <input type="number" value={costoEnvio} onChange={e => setCostoEnvio(e.target.value)} className="w-full border p-2 rounded text-gray-800" placeholder="Costo de envío" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setMetodoPago('EFECTIVO')} className={`py-2 rounded border font-bold ${metodoPago === 'EFECTIVO' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 text-gray-600'}`}>Efectivo</button>
              <button onClick={() => setMetodoPago('TARJETA')} className={`py-2 rounded border font-bold ${metodoPago === 'TARJETA' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>Tarjeta</button>
              <button onClick={() => setMetodoPago('TRANSFERENCIA')} className={`py-2 rounded border font-bold ${metodoPago === 'TRANSFERENCIA' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-gray-50 text-gray-600'}`}>QR / Transf.</button>
            </div>
          </div>

          {metodoPago === 'EFECTIVO' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <input type="number" value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} className="w-full text-2xl border p-3 rounded text-gray-800 font-bold" placeholder="Monto recibido" autoFocus />
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-600">Vuelto:</span>
                <span className={vuelto >= 0 ? 'text-green-600' : 'text-red-600'}>${vuelto > 0 ? vuelto.toFixed(2) : '0.00'}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex gap-3">
          <button onClick={onClose} className="w-1/2 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300">Cancelar</button>
          <button onClick={handleConfirm} className="w-1/2 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Confirmar Pago</button>
        </div>
      </div>
    </div>
  );
}
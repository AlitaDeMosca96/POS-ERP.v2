'use client';

interface Venta {
  id: string;
  createdAt: string;
  total: number;
  metodoPago: string;
  cuitFactura?: string;
  razonSocialFactura?: string;
  numeroComprobante?: string;
  cliente?: { nombre: string };
  mesa?: { nombre: string };
  empresa?: { nombre: string; cuit: string; direccion?: string };
  sucursal?: { nombre: string; direccion?: string };
  detalles: {
    cantidad: number;
    precioUnitario: number;
    notas?: string;
    producto: { nombre: string };
  }[];
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: Venta | null;
}

export default function TicketModal({ isOpen, onClose, venta }: TicketModalProps) {
  if (!isOpen || !venta) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .ticket-print-area, .ticket-print-area * { visibility: visible; }
          .ticket-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 no-print">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="bg-green-600 text-white p-3 text-center no-print">
            <h3 className="text-lg font-bold">¡Venta Exitosa!</h3>
          </div>

          <div className="p-6 overflow-y-auto font-mono text-sm text-black ticket-print-area bg-white">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold uppercase">{venta.empresa?.nombre || 'Comercio'}</h2>
              <p className="text-xs">CUIT: {venta.empresa?.cuit || '---'}</p>
              <p className="text-xs">{venta.sucursal?.direccion || venta.empresa?.direccion || '---'}</p>
              <p className="text-xs mt-2">------------------------------</p>
            </div>

            <div className="text-center font-bold text-red-600 my-2 border-y border-red-600 py-1">
              DOCUMENTO NO VÁLIDO COMO FACTURA
            </div>

            <div className="flex justify-between mb-1 text-xs mt-2">
              <span>FECHA:</span>
              <span>{new Date(venta.createdAt).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span>TICKET N°:</span>
              <span>{venta.numeroComprobante || venta.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span>UBICACIÓN:</span>
              <span>{venta.mesa ? venta.mesa.nombre : 'Mostrador'}</span>
            </div>
            
            <p className="text-xs my-2">------------------------------</p>
            
            {/* DATOS DEL CLIENTE (Opcional) */}
            <div className="mb-4 text-xs">
              {venta.cuitFactura && (
                <>
                  <div className="flex justify-between mt-1">
                    <span>CUIT:</span>
                    <span>{venta.cuitFactura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RAZÓN SOC:</span>
                    <span>{venta.razonSocialFactura}</span>
                  </div>
                </>
              )}
              {!venta.cuitFactura && venta.cliente && (
                <div className="flex justify-between mt-1">
                  <span>CLIENTE:</span>
                  <span>{venta.cliente.nombre}</span>
                </div>
              )}
            </div>

            <p className="text-xs my-2">------------------------------</p>
            
            <div className="mb-4">
              {venta.detalles.map((det, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between">
                    <span>{det.cantidad}x {det.producto?.nombre || 'Producto eliminado'}</span>
                    <span>${(Number(det.precioUnitario) * det.cantidad).toFixed(2)}</span>
                  </div>
                  {det.notas && <div className="text-xs pl-4 text-gray-600">* {det.notas}</div>}
                </div>
              ))}
            </div>

            <p className="text-xs my-2">------------------------------</p>
            
            <div className="flex justify-between font-bold text-lg mb-2">
              <span>TOTAL:</span>
              <span>${Number(venta.total).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-xs uppercase mb-4">
              <span>PAGO:</span>
              <span>{venta.metodoPago}</span>
            </div>

            <div className="text-center mt-6 text-xs">
              <p>¡Gracias por su visita!</p>
              <p>Vuelva pronto</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex gap-2 no-print">
            <button onClick={onClose} className="w-1/2 bg-gray-300 text-gray-800 font-bold py-2 rounded hover:bg-gray-400">Cerrar</button>
            <button onClick={handlePrint} className="w-1/2 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
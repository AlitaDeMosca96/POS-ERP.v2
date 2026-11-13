'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PedidoDetalle {
  id: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
  producto: { nombre: string };
}

interface Pedido {
  id: string;
  total: number;
  createdAt: string;
  metodoPago: string;
  mesa?: { nombre: string };
  cliente?: { nombre: string };
  detalles: PedidoDetalle[];
}

export default function HistorialPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    fetch('http://localhost:3000/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router, token]);

  if (loading) return <div className="p-10 text-center">Cargando historial...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Historial de Ventas</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Fecha / Hora</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Origen</th>
                <th className="p-4 font-semibold">Detalle</th>
                <th className="p-4 font-semibold">Pago</th>
                <th className="p-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id} className="border-b hover:bg-gray-50 text-gray-800 text-sm">
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(pedido.createdAt).toLocaleString('es-AR')}
                  </td>
                  <td className="p-4 font-medium">
                    {pedido.cliente ? pedido.cliente.nombre : 'Consumidor Final'}
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                      {pedido.mesa ? pedido.mesa.nombre : 'Mostrador'}
                    </span>
                  </td>
                  <td className="p-4">
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {pedido.detalles.map((det, index) => (
                        <li key={index} className="mb-1">
                          {det.cantidad}x {det.producto?.nombre || 'Producto Eliminado'}
                          {det.notas && <span className="text-blue-500 ml-1">({det.notas})</span>}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      pedido.metodoPago === 'EFECTIVO' ? 'bg-green-100 text-green-700' : 
                      pedido.metodoPago === 'TARJETA' ? 'bg-blue-100 text-blue-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {pedido.metodoPago}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-green-600">
                    ${Number(pedido.total).toFixed(2)}
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No hay ventas registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
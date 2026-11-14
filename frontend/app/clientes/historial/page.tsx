'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PedidoDetalle {
  id: string;
  cantidad: number;
  precioUnitario: number;
  producto: {
    nombre: string;
  };
}

interface Pedido {
  id: string;
  total: number;
  createdAt: string;
  detalles: PedidoDetalle[];
}

export default function HistorialPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('/api/pedidos', {
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
  }, [router]);

  if (loading) return <div className="p-10 text-center">Cargando historial...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
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
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Detalle del Pedido</th>
                <th className="p-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(pedido.createdAt).toLocaleString('es-AR')}
                  </td>
                  <td className="p-4">
                    <ul className="list-disc list-inside text-sm">
                      {pedido.detalles.map((det, index) => (
                        <li key={index}>
                          {det.cantidad}x {det.producto?.nombre || 'Producto eliminado'} 
                          (${det.precioUnitario} c/u)
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-right font-bold text-green-600 text-lg">
                    ${Number(pedido.total).toFixed(2)}
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Todavía no hay ventas registradas.
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
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PedidoDetalle {
  id: string;
  cantidad: number;
  notas?: string;
  producto: { nombre: string };
}

interface Pedido {
  id: string;
  createdAt: string;
  mesa?: { nombre: string };
  detalles: PedidoDetalle[];
}

export default function CocinaPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const sucursalActiva = typeof window !== 'undefined' ? localStorage.getItem('sucursalActiva') : '';

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const cargarPedidos = async () => {
      try {
        // Agregamos el filtro de sucursal
        const url = sucursalActiva 
          ? `/api/pedidos/cocina?sucursalId=${sucursalActiva}` 
          : '/api/pedidos/cocina';

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setPedidos(await res.json());
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    cargarPedidos();
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, [router, token, sucursalActiva]);

  const handleMarcarListo = async (id: string) => {
    try {
      await fetch(`/api/pedidos/${id}/cocina`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl">Cargando comandas...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-bold text-green-400">Monitor de Cocina (KDS)</h1>
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white underline">
          Volver al Dashboard
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500">
          <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-2xl">No hay comandas pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pedidos.map(pedido => (
            <div key={pedido.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl flex flex-col">
              
              <div className="bg-yellow-500 text-black p-3 flex justify-between items-center font-bold text-lg">
                <span>{pedido.mesa?.nombre || 'Mostrador'}</span>
                <span>{new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-3">
                  {pedido.detalles.map(det => (
                    <li key={det.id} className="flex flex-col gap-1 text-xl border-b border-gray-700 pb-2">
                      <div className="flex gap-3">
                        <span className="font-bold text-green-400">{det.cantidad}x</span>
                        <span>{det.producto.nombre}</span>
                      </div>
                      {det.notas && (
                        <div className="text-sm font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded inline-block w-fit">
                          ⚠ {det.notas}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-850">
                <button 
                  onClick={() => handleMarcarListo(pedido.id)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 text-xl rounded-lg transition"
                >
                  ✓ Marcar Listo
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
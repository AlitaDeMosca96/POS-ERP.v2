'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../lib/api';

interface PedidoDetalle { id: string; cantidad: number; notas?: string; producto: { nombre: string }; }
interface PedidoDelivery { id: string; total: number; createdAt: string; direccionEntrega: string; costoEnvio: number; cliente?: { nombre: string, telefono?: string }; detalles: PedidoDetalle[]; }

export default function DeliveryPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const sucursalActiva = typeof window !== 'undefined' ? localStorage.getItem('sucursalActiva') : '';

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const url = sucursalActiva ? `/pedidos/delivery?sucursalId=${sucursalActiva}` : '/pedidos/delivery';
        const data = await fetcher(url);
        if (data) setPedidos(data);
        setLoading(false);
      } catch (error) { console.error(error); }
    };

    cargarPedidos();
    const interval = setInterval(cargarPedidos, 10000);
    return () => clearInterval(interval);
  }, [sucursalActiva]);

  const handleMarcarEnviado = async (id: string) => {
    if (!confirm('¿Despachar este pedido a la dirección indicada?')) return;
    try {
      await fetcher(`/pedidos/${id}/delivery`, { method: 'PATCH', body: JSON.stringify({ estadoDelivery: 'ENVIADO' }) });
      setPedidos(prev => prev.filter(p => p.id !== id));
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="p-10 text-center text-xl">Buscando pedidos de delivery...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">🛵 Despacho de Delivery</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No hay pedidos pendientes</h2>
            <p className="text-gray-500">Todos los envíos están al día.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-xl shadow-md border border-orange-200 overflow-hidden flex flex-col">
                <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Pedido #{pedido.id.slice(0, 4).toUpperCase()}</span>
                  <span className="text-sm bg-orange-600 px-2 py-1 rounded">{new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Dirección de entrega:</p>
                    <p className="font-bold text-gray-800 text-lg leading-tight mb-2">{pedido.direccionEntrega}</p>
                    {pedido.cliente && <p className="text-sm text-gray-600">👤 {pedido.cliente.nombre} {pedido.cliente.telefono ? `- 📞 ${pedido.cliente.telefono}` : ''}</p>}
                  </div>
                  <div className="space-y-2 mb-4">
                    {pedido.detalles.map(det => (
                      <div key={det.id} className="flex justify-between text-sm"><span className="text-gray-700"><span className="font-bold">{det.cantidad}x</span> {det.producto.nombre}</span></div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4 text-lg font-bold">
                    <span className="text-gray-600">Total (con envío):</span>
                    <span className="text-green-600">${Number(pedido.total).toFixed(2)}</span>
                  </div>
                  <button onClick={() => handleMarcarEnviado(pedido.id)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition">Marcar como Enviado</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
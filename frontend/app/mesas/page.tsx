'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../lib/api';
import toast from 'react-hot-toast';

interface Mesa { id: string; nombre: string; capacidad: number; estado: string; }
interface PedidoDetalle { id: string; cantidad: number; precioUnitario: number; producto: { nombre: string }; }
interface Pedido { id: string; total: number; createdAt: string; detalles: PedidoDetalle[]; }

export default function MesasPage() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState('4');
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const sucursalActiva = typeof window !== 'undefined' ? localStorage.getItem('sucursalActiva') : '';

  useEffect(() => {
    cargarMesas();
  }, [sucursalActiva]);

  const cargarMesas = async () => {
    try {
      const url = sucursalActiva ? `/mesas?sucursalId=${sucursalActiva}` : '/mesas';
      const data = await fetcher(url);
      setMesas(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetcher('/mesas', {
        method: 'POST',
        body: JSON.stringify({ 
          nombre, 
          capacidad: Number(capacidad),
          sucursalId: sucursalActiva || null
        })
      });
      toast.success('Mesa creada con éxito');
      setNombre(''); setCapacidad('4');
      cargarMesas();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la mesa');
    }
  };

  const handleVerDetalle = async (mesa: Mesa) => {
    if (mesa.estado === 'LIBRE') return;
    setMesaSeleccionada(mesa);
    setLoadingDetalle(true);
    setPedidoDetalle(null);
    try {
      const pedido = await fetcher(`/pedidos/mesa/${mesa.id}`);
      setPedidoDetalle(pedido);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Mesas</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nueva Mesa</h2>
          <form onSubmit={handleCrearMesa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Ej: Mesa 1, Barra 2" required value={nombre} onChange={e => setNombre(e.target.value)} className="border p-2 rounded text-gray-800" />
            <input type="number" placeholder="Capacidad (personas)" required value={capacidad} onChange={e => setCapacidad(e.target.value)} className="border p-2 rounded text-gray-800" />
            <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">Crear Mesa</button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mesas.map(mesa => (
            <div 
              key={mesa.id} 
              onClick={() => handleVerDetalle(mesa)}
              className={`p-6 rounded-lg shadow-sm border text-center transition ${mesa.estado === 'OCUPADA' ? 'bg-red-50 border-red-200 cursor-pointer hover:shadow-md' : 'bg-white border-gray-200'}`}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{mesa.nombre}</h3>
              <p className="text-gray-500 mb-4">Capacidad: {mesa.capacidad} pers.</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${mesa.estado === 'LIBRE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{mesa.estado}</span>
            </div>
          ))}
        </div>
      </div>

      {mesaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Detalle: {mesaSeleccionada.nombre}</h3>
              <button onClick={() => setMesaSeleccionada(null)} className="text-gray-300 hover:text-white font-bold text-xl">&times;</button>
            </div>
            <div className="p-6">
              {loadingDetalle ? <p className="text-center text-gray-500">Cargando pedido...</p> : pedidoDetalle ? (
                <>
                  <ul className="space-y-3 mb-6">
                    {pedidoDetalle.detalles.map((det, idx) => (
                      <li key={idx} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{det.producto?.nombre}</p>
                          <p className="text-sm text-gray-500">{det.cantidad} x ${det.precioUnitario}</p>
                        </div>
                        <span className="font-bold text-gray-700">${det.cantidad * Number(det.precioUnitario)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-4 border-t border-gray-300">
                    <span>Total:</span><span>${Number(pedidoDetalle.total).toFixed(2)}</span>
                  </div>
                </>
              ) : <p className="text-center text-gray-500">No hay un pedido abierto en esta mesa.</p>}
            </div>
            <div className="bg-gray-50 p-4 flex justify-end">
              <button onClick={() => setMesaSeleccionada(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
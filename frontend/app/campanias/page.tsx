'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetcher } from '../../lib/api';

interface Campania { id: string; asunto: string; mensaje: string; cantidadEnviados: number; fecha: string; }

export default function CampaniasPage() {
  const router = useRouter();
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [loading, setLoading] = useState(true);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { cargarCampanias(); }, []);

  const cargarCampanias = async () => {
    try {
      const data = await fetcher('/campanias');
      setCampanias(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCampania = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await fetcher('/campanias', { method: 'POST', body: JSON.stringify({ asunto, mensaje }) });
      toast.success('¡Campaña enviada con éxito a todos los clientes!');
      setAsunto(''); setMensaje('');
      cargarCampanias();
    } catch (error: any) { toast.error(error.message || 'Error al enviar la campaña'); } finally { setEnviando(false); }
  };

  if (loading) return <div className="p-10 text-center">Cargando campañas...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* CARTEL BETA AGREGADO */}
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-md text-center font-bold mb-6">
          ⚠️ MÓDULO EN DESARROLLO (BETA) - El envío de campañas no está operativo, solo simula la acción.
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Campañas de Marketing</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Enviar Nueva Promoción</h2>
          <p className="text-sm text-gray-500 mb-4">Este mensaje se enviará a todos los clientes registrados en la base de datos.</p>
          <form onSubmit={handleCrearCampania} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
              <input type="text" placeholder="Ej: ¡20% de descuento este fin de semana!" required value={asunto} onChange={e => setAsunto(e.target.value)} className="w-full border p-2 rounded text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea placeholder="Hola! Te esperamos este viernes con una promo especial..." required value={mensaje} onChange={e => setMensaje(e.target.value)} className="w-full border p-2 rounded text-gray-800 h-32 resize-none" />
            </div>
            <button type="submit" disabled={enviando} className="bg-pink-600 text-white font-bold py-3 px-6 rounded hover:bg-pink-700 disabled:bg-pink-300 transition">{enviando ? 'Enviando...' : 'Enviar Campaña'}</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Asunto</th>
                <th className="p-4 font-semibold">Mensaje</th>
                <th className="p-4 font-semibold text-center">Enviados</th>
              </tr>
            </thead>
            <tbody>
              {campanias.map(camp => (
                <tr key={camp.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(camp.fecha).toLocaleString('es-AR')}</td>
                  <td className="p-4 font-medium">{camp.asunto}</td>
                  <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{camp.mensaje}</td>
                  <td className="p-4 text-center"><span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-bold">{camp.cantidadEnviados} clientes</span></td>
                </tr>
              ))}
              {campanias.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay campañas enviadas aún.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetcher } from '../../lib/api';

interface Cliente { id: string; nombre: string; }
interface Mesa { id: string; nombre: string; capacidad: number; }
interface Reserva { id: string; fechaHora: string; cantidadPersonas: number; estado: string; mesa: Mesa; cliente: Cliente; }

export default function ReservasPage() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaHora, setFechaHora] = useState('');
  const [cantidadPersonas, setCantidadPersonas] = useState('2');
  const [mesaId, setMesaId] = useState('');
  const [clienteId, setClienteId] = useState('');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [resRes, resCli, resMes] = await Promise.all([fetcher('/reservas'), fetcher('/clientes'), fetcher('/mesas')]);
      setReservas(resRes || []);
      setClientes(resCli || []);
      setMesas(resMes || []);
      if (resCli && resCli.length > 0) setClienteId(resCli[0].id);
      if (resMes && resMes.length > 0) setMesaId(resMes[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaHora || !mesaId || !clienteId) return toast.error('Completá todos los campos');
    try {
      await fetcher('/reservas', {
        method: 'POST',
        body: JSON.stringify({ fechaHora: new Date(fechaHora).toISOString(), cantidadPersonas: Number(cantidadPersonas), mesaId, clienteId })
      });
      toast.success('Reserva creada con éxito');
      setFechaHora(''); setCantidadPersonas('2');
      cargarDatos();
    } catch (error: any) { toast.error(error.message || 'Error al crear la reserva'); }
  };

  const handleCancelarReserva = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    try {
      await fetcher(`/reservas/${id}`, { method: 'PATCH', body: JSON.stringify({ estado: 'CANCELADA' }) });
      cargarDatos();
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="p-10 text-center">Cargando reservas...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Libro de Reservas</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Nueva Reserva</h2>
          <form onSubmit={handleCrearReserva} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha y Hora</label>
              <input type="datetime-local" required value={fechaHora} onChange={e => setFechaHora(e.target.value)} className="w-full border p-2 rounded text-gray-800" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cliente</label>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)} className="w-full border p-2 rounded text-gray-800">
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mesa</label>
              <select value={mesaId} onChange={e => setMesaId(e.target.value)} className="w-full border p-2 rounded text-gray-800">
                {mesas.map(m => <option key={m.id} value={m.id}>{m.nombre} (Cap: {m.capacidad})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Personas</label>
              <input type="number" required value={cantidadPersonas} onChange={e => setCantidadPersonas(e.target.value)} className="w-full border p-2 rounded text-gray-800" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700 h-[42px]">Reservar</button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Fecha / Hora</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Mesa</th>
                <th className="p-4 font-semibold">Personas</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(res => (
                <tr key={res.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{new Date(res.fechaHora).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-4">{res.cliente?.nombre}</td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{res.mesa?.nombre}</span></td>
                  <td className="p-4 text-center">{res.cantidadPersonas}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${res.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : res.estado === 'CUMPLIDA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{res.estado}</span>
                  </td>
                  <td className="p-4 text-center">
                    {res.estado === 'PENDIENTE' && <button onClick={() => handleCancelarReserva(res.id)} className="text-red-500 hover:underline text-sm font-bold">Cancelar</button>}
                  </td>
                </tr>
              ))}
              {reservas.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay reservas registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
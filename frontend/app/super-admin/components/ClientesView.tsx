'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetcher } from '../../../lib/api';
import ModalCrearCliente from './ModalCrearCliente';

interface Empresa { id: string; nombre: string; cuit: string; activa: boolean; usuarios: number; totalVentas: number; fechaAlta: string; plan?: string; }
interface Plan { id: string; nombre: string; precioMensual: number; }

export default function ClientesView({ searchQuery = '' }: { searchQuery?: string }) {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [resEmp, resPlanes] = await Promise.all([
        fetcher('/super-admin/empresas'),
        fetcher('/planes')
      ]);
      if (resEmp) setEmpresas(resEmp);
      if (resPlanes) setPlanes(resPlanes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (id: string, estadoActual: boolean) => {
    const accion = estadoActual ? 'SUSPENDER' : 'ACTIVAR';
    if (!confirm(`¿Estás seguro de ${accion} esta empresa?`)) return;
    try {
      await fetcher(`/super-admin/empresas/${id}/toggle`, { method: 'PATCH' });
      toast.success(`Empresa ${estadoActual ? 'suspendida' : 'activada'}`);
      cargarDatos();
    } catch (error: any) { toast.error(error.message || 'Error al cambiar estado'); }
  };

  const handleImpersonar = async (id: string) => {
    if (!confirm('¿Entrar como soporte a esta empresa?')) return;
    try {
      const data = await fetcher(`/super-admin/empresas/${id}/impersonar`, { method: 'POST' });
      if (data) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.removeItem('sucursalActiva');
        router.push('/dashboard');
      }
    } catch (error: any) { toast.error(error.message || 'Error al impersonar'); }
  };

  if (loading) return <div className="text-[#D4AF37] animate-pulse">Cargando clientes...</div>;

  const empresasFiltradas = empresas.filter(e => {
    const coincideNombre = e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || e.cuit.includes(searchQuery);
    const coincideEstado = filtroEstado === 'TODOS' ? true : filtroEstado === 'ACTIVAS' ? e.activa : !e.activa;
    return coincideNombre && coincideEstado;
  });

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-light text-white uppercase tracking-widest">
            Directorio de Empresas {searchQuery && `(Filtrado: ${searchQuery})`}
          </h2>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setFiltroEstado('TODOS')} className={`px-3 py-1 text-xs font-bold rounded ${filtroEstado === 'TODOS' ? 'bg-gray-700 text-white' : 'bg-[#111] text-gray-500 hover:text-white'}`}>TODAS</button>
            <button onClick={() => setFiltroEstado('ACTIVAS')} className={`px-3 py-1 text-xs font-bold rounded ${filtroEstado === 'ACTIVAS' ? 'bg-green-900/50 text-green-400 border border-green-900' : 'bg-[#111] text-gray-500 hover:text-green-400'}`}>ACTIVAS</button>
            <button onClick={() => setFiltroEstado('SUSPENDIDAS')} className={`px-3 py-1 text-xs font-bold rounded ${filtroEstado === 'SUSPENDIDAS' ? 'bg-red-900/50 text-red-400 border border-red-900' : 'bg-[#111] text-gray-500 hover:text-red-400'}`}>SUSPENDIDAS</button>
          </div>
        </div>
        <button onClick={() => setModalAbierto(true)} className="bg-[#111] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 px-6 rounded transition-all text-xs uppercase tracking-widest">
          + Nueva Empresa
        </button>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-black/50 text-gray-500 text-xs border-b border-gray-800 uppercase tracking-wider">
            <th className="p-4 font-medium">Empresa / CUIT</th>
            <th className="p-4 font-medium text-center">Plan</th>
            <th className="p-4 font-medium text-center">Usuarios</th>
            <th className="p-4 font-medium text-right">Ventas</th>
            <th className="p-4 font-medium text-center">Estado</th>
            <th className="p-4 font-medium text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresasFiltradas.map(emp => (
            <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-[#111] transition-colors">
              <td className="p-4">
                <p className="font-medium text-gray-200 text-base">{emp.nombre}</p>
                <p className="text-xs text-gray-600">{emp.cuit}</p>
              </td>
              <td className="p-4 text-center"><span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">{emp.plan}</span></td>
              <td className="p-4 text-center"><span className="bg-gray-900 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-800">{emp.usuarios}</span></td>
              <td className="p-4 text-right font-light text-[#D4AF37]">${emp.totalVentas.toLocaleString('es-AR')}</td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${emp.activa ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-red-900/20 text-red-400 border-red-900'}`}>
                  {emp.activa ? 'ACTIVA' : 'SUSPENDIDA'}
                </span>
              </td>
              <td className="p-4 text-center flex flex-col gap-2 items-center">
                <button onClick={() => handleImpersonar(emp.id)} className="text-xs bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-3 py-1 rounded transition w-full">Entrar (Soporte)</button>
                <button onClick={() => handleToggleEstado(emp.id, emp.activa)} className={`text-xs px-3 py-1 rounded transition w-full border ${emp.activa ? 'bg-red-900/20 border-red-900 text-red-400 hover:bg-red-900/40' : 'bg-green-900/20 border-green-900 text-green-400 hover:bg-green-900/40'}`}>{emp.activa ? 'Suspender' : 'Activar'}</button>
              </td>
            </tr>
          ))}
          {empresasFiltradas.length === 0 && (
            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No se encontraron empresas.</td></tr>
          )}
        </tbody>
      </table>

      <ModalCrearCliente isOpen={modalAbierto} onClose={() => setModalAbierto(false)} onSuccess={cargarDatos} planes={planes} />
    </div>
  );
}
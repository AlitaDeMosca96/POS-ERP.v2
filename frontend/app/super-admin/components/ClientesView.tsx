'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Empresa { id: string; nombre: string; cuit: string; activa: boolean; usuarios: number; totalVentas: number; fechaAlta: string; plan?: string; }
interface Plan { id: string; nombre: string; precioMensual: number; }

export default function ClientesView({ searchQuery = '' }: { searchQuery?: string }) {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [planId, setPlanId] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [resEmp, resPlanes] = await Promise.all([
        fetch('http://localhost:3000/super-admin/empresas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/planes', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resEmp.ok) setEmpresas(await resEmp.json());
      if (resPlanes.ok) {
        const data = await resPlanes.json();
        setPlanes(data);
        if (data.length > 0) setPlanId(data[0].id);
      }
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const handleCrearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/super-admin/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, cuit, adminNombre, adminEmail, adminPassword, planId })
      });
      if (res.ok) {
        alert('¡Empresa creada con éxito!');
        setModalAbierto(false);
        setNombre(''); setCuit(''); setAdminNombre(''); setAdminEmail(''); setAdminPassword('');
        cargarDatos();
      }
    } catch (error) { console.error(error); }
  };

  const handleToggleEstado = async (id: string, estadoActual: boolean) => {
    const accion = estadoActual ? 'SUSPENDER' : 'ACTIVAR';
    if (!confirm(`¿Estás seguro de ${accion} esta empresa?`)) return;
    try {
      await fetch(`http://localhost:3000/super-admin/empresas/${id}/toggle`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      cargarDatos();
    } catch (error) { console.error(error); }
  };

  const handleImpersonar = async (id: string) => {
    if (!confirm('¿Entrar como soporte a esta empresa?')) return;
    try {
      const res = await fetch(`http://localhost:3000/super-admin/empresas/${id}/impersonar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.removeItem('sucursalActiva');
        router.push('/dashboard');
      }
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="text-[#D4AF37] animate-pulse">Cargando clientes...</div>;

  // FILTRADO POR BUSCADOR
  const empresasFiltradas = empresas.filter(e => 
    e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.cuit.includes(searchQuery)
  );

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-light text-white uppercase tracking-widest">
          Directorio de Empresas {searchQuery && `(Filtrado: ${searchQuery})`}
        </h2>
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
              <td className="p-4 text-right font-light text-[#D4AF37]">${emp.totalVentas.toFixed(2)}</td>
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

      {/* MODAL CREAR EMPRESA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D4AF37]/30">
            <div className="bg-black p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-light text-white uppercase tracking-widest">Alta de Cliente</h3>
              <button onClick={() => setModalAbierto(false)} className="text-gray-500 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCrearEmpresa} className="p-6 space-y-5">
              <div className="space-y-3">
                <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-b border-gray-800 pb-1">Datos de la Empresa</h4>
                <input type="text" placeholder="Nombre del Restaurante" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <input type="text" placeholder="CUIT" required value={cuit} onChange={e => setCuit(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <div className="pt-2">
                  <label className="block text-xs text-gray-500 mb-1">Plan de Suscripción</label>
                  <select value={planId} onChange={e => setPlanId(e.target.value)} className="w-full bg-black border border-gray-800 text-[#D4AF37] p-3 rounded focus:border-[#D4AF37] outline-none transition-all">
                    {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} - ${p.precioMensual}/mes</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider border-b border-gray-800 pb-1">Usuario Administrador</h4>
                <input type="text" placeholder="Nombre del Dueño" required value={adminNombre} onChange={e => setAdminNombre(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <input type="email" placeholder="Email (para login)" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
                <input type="password" placeholder="Contraseña temporal" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#D4AF37] outline-none transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalAbierto(false)} className="w-1/3 bg-transparent border border-gray-600 text-gray-400 font-bold py-3 rounded hover:text-white hover:border-white transition">Cancelar</button>
                <button type="submit" className="w-2/3 bg-[#D4AF37] text-black font-bold py-3 rounded hover:bg-[#E5C158] transition shadow-[0_0_15px_rgba(212,175,55,0.3)]">Crear Empresa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
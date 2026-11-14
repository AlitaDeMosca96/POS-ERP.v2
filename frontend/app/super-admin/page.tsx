'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Empresa {
  id: string;
  nombre: string;
  cuit: string;
  activa: boolean;
  usuarios: number;
  totalVentas: number;
  fechaAlta: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario de nueva empresa
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    cargarEmpresas();
  }, [router, token]);

  const cargarEmpresas = async () => {
    try {
      const res = await fetch('http://localhost:3000/super-admin/empresas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setEmpresas(await res.json());
      } else {
        alert('No tenés permisos para ver esto');
        router.push('/dashboard');
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCrearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/super-admin/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, cuit, adminNombre, adminEmail, adminPassword })
      });

      if (res.ok) {
        alert('¡Empresa y usuario Administrador creados con éxito!');
        setModalAbierto(false);
        setNombre(''); setCuit(''); setAdminNombre(''); setAdminEmail(''); setAdminPassword('');
        cargarEmpresas();
      } else {
        alert('Error al crear la empresa');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xl">Iniciando Panel Maestro...</div>;

  // Métricas globales
  const totalEmpresas = empresas.length;
  const totalUsuarios = empresas.reduce((acc, emp) => acc + emp.usuarios, 0);
  const recaudacionTotal = empresas.reduce((acc, emp) => acc + emp.totalVentas, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      {/* HEADER */}
      <nav className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">S</div>
          <h1 className="text-xl font-bold text-white tracking-wide">Super Admin</h1>
        </div>
        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white transition">
          Cerrar Sesión Maestra
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* MÉTRICAS GLOBALES DEL SAAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Empresas Registradas</h3>
            <p className="text-4xl font-bold text-white">{totalEmpresas}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Usuarios Totales</h3>
            <p className="text-4xl font-bold text-white">{totalUsuarios}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Volumen Transaccionado</h3>
            <p className="text-4xl font-bold text-emerald-400">${recaudacionTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* TABLA DE EMPRESAS */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Clientes del SaaS (Tenants)</h2>
            <button 
              onClick={() => setModalAbierto(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2 text-sm"
            >
              + Nueva Empresa
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-700">
                <th className="p-4 font-medium">Empresa / CUIT</th>
                <th className="p-4 font-medium text-center">Usuarios</th>
                <th className="p-4 font-medium text-right">Ventas Totales</th>
                <th className="p-4 font-medium text-center">Estado</th>
                <th className="p-4 font-medium text-center">Alta</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(emp => (
                <tr key={emp.id} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition">
                  <td className="p-4">
                    <p className="font-bold text-white text-base">{emp.nombre}</p>
                    <p className="text-xs text-slate-500">{emp.cuit}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                      {emp.usuarios}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-400">
                    ${emp.totalVentas.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                      ACTIVA
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm text-slate-400">
                    {new Date(emp.fechaAlta).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL DE CREACIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-600">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Dar de Alta Cliente SaaS</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCrearEmpresa} className="p-6 space-y-5">
              <div className="space-y-3">
                <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wider border-b border-slate-700 pb-1">Datos de la Empresa</h4>
                <input 
                  type="text" placeholder="Nombre del Restaurante / Empresa" required
                  value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input 
                  type="text" placeholder="CUIT" required
                  value={cuit} onChange={e => setCuit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wider border-b border-slate-700 pb-1">Usuario Administrador</h4>
                <input 
                  type="text" placeholder="Nombre del Dueño" required
                  value={adminNombre} onChange={e => setAdminNombre(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input 
                  type="email" placeholder="Email (para login)" required
                  value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input 
                  type="password" placeholder="Contraseña temporal" required
                  value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setModalAbierto(false)}
                  className="w-1/3 bg-slate-700 text-white font-bold py-3 rounded hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-2/3 bg-emerald-600 text-white font-bold py-3 rounded hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50"
                >
                  Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
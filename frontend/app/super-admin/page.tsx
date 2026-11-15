'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetcher } from '../../lib/api';

export default function SuperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState<any>(null);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar sesión
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    
    if (!token || !usuarioStr || usuarioStr === 'undefined') {
      router.push('/master-login');
      return;
    }

    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario.rol !== 'SUPER_ADMIN') {
        router.push('/master-login');
        return;
      }
    } catch (e) {
      router.push('/master-login');
      return;
    }

    // Cargar datos del backend
    Promise.all([
      fetcher('/super-admin/metrics'),
      fetcher('/super-admin/empresas')
    ])
      .then(([metricsData, empresasData]) => {
        setMetrics(metricsData);
        setEmpresas(empresasData);
      })
      .catch((err) => {
        console.error('Error cargando datos:', err);
        if (err.message === 'Sesión expirada') {
          router.push('/master-login');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/master-login');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#d4af37] animate-pulse">Cargando datos maestros...</p>
        </div>
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-light text-white tracking-widest uppercase">Dashboard Global</h1>
              <p className="text-gray-500 mt-1">Monitoreo en tiempo real de tu red</p>
            </div>
            <div className="flex items-center space-x-4">
              <input 
                type="text" 
                placeholder="Buscar empresa..." 
                className="bg-[#121212] border border-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#121212] p-6 rounded-xl border border-[#2a2a2a] shadow-lg border-l-4 border-l-[#d4af37]">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">MRR (Mensual)</p>
              <h3 className="text-3xl font-light text-white mb-1">${metrics?.mrr?.toLocaleString('es-AR') || 0}</h3>
              <p className="text-xs text-[#d4af37]">Ingreso Recurrente</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-xl border border-[#2a2a2a] shadow-lg">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Empresas Activas</p>
              <h3 className="text-3xl font-light text-white mb-1">{metrics?.empresasActivas || 0}</h3>
              <p className="text-xs text-green-500">En la red</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-xl border border-[#2a2a2a] shadow-lg">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Suspendidas</p>
              <h3 className="text-3xl font-light text-white mb-1">{metrics?.empresasSuspendidas || 0}</h3>
              <p className="text-xs text-red-500">Requieren atención</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-xl border border-[#2a2a2a] shadow-lg">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Usuarios Globales</p>
              <h3 className="text-3xl font-light text-white mb-1">{metrics?.totalUsuarios || 0}</h3>
              <p className="text-xs text-gray-400">Registrados</p>
            </div>
          </div>

          {/* Tabla de Empresas */}
          <div className="bg-[#121212] rounded-xl border border-[#2a2a2a] overflow-hidden shadow-lg">
            <div className="p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-light text-white tracking-wider">Empresas Registradas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a] text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Empresa</th>
                    <th className="p-4 font-medium">CUIT</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Usuarios</th>
                    <th className="p-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {empresas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No hay empresas registradas.</td>
                    </tr>
                  ) : (
                    empresas.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-4 text-white">{emp.nombre}</td>
                        <td className="p-4 text-gray-400">{emp.cuit || '-'}</td>
                        <td className="p-4 text-[#d4af37]">{emp.plan}</td>
                        <td className="p-4 text-gray-400">{emp.usuarios}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.activa ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {emp.activa ? 'Activa' : 'Suspendida'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // Vista para secciones en construcción
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </div>
          <h2 className="text-2xl font-light text-white mb-2 uppercase tracking-widest">Sección en Construcción</h2>
          <p className="text-gray-500">Muy pronto podrás gestionar esto desde acá.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f0f0f] border-r border-[#2a2a2a] flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-[#2a2a2a]">
          <div className="w-8 h-8 bg-[#d4af37] rounded flex items-center justify-center mr-3">
            <span className="text-[#0a0a0a] font-serif font-bold text-lg">M</span>
          </div>
          <span className="text-white font-semibold tracking-widest text-sm uppercase">Master<span className="text-[#d4af37]">CTRL</span></span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('clientes')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'clientes' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Clientes SaaS
          </button>

          <button 
            onClick={() => setActiveTab('planes')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'planes' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Planes y Suscripciones
          </button>

          {/* ENLACE REAL PARA SEGURIDAD */}
          <Link 
            href="/super-admin/seguridad"
            className="w-full flex items-center px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Seguridad y Auditoría
          </Link>

          <button 
            onClick={() => setActiveTab('operaciones')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'operaciones' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Operaciones
          </button>

          <button 
            onClick={() => setActiveTab('equipo')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'equipo' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Equipo Interno
          </button>

          <button 
            onClick={() => setActiveTab('partners')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'partners' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Partners
          </button>

          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'config' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-[#2a2a2a]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            DESCONECTAR
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
        {renderContent()}
      </main>
    </div>
  );
}
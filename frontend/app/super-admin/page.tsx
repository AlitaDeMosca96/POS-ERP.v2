'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientesView from './components/ClientesView';

export default function SuperAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/master-login');
      return;
    }
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.rol !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
    }
    setLoading(false);
  }, [router, token]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/master-login');
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-[#D4AF37] flex items-center justify-center text-xl tracking-widest uppercase">Iniciando Búnker...</div>;

  return (
    <div className="flex h-screen bg-[#050505] text-gray-300 font-sans selection:bg-[#D4AF37] selection:text-black overflow-hidden">
      <Sidebar seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-light text-white uppercase tracking-widest">
              {seccionActiva === 'dashboard' ? 'Dashboard Global' : seccionActiva === 'clientes' ? 'Gestión de Clientes' : seccionActiva}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Monitoreo en tiempo real de tu red</p>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-gray-800 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">SISTEMA ONLINE</span>
          </div>
        </header>

        {seccionActiva === 'dashboard' && <DashboardView />}
        {seccionActiva === 'clientes' && <ClientesView />}
        
        {seccionActiva !== 'dashboard' && seccionActiva !== 'clientes' && (
          <div className="bg-[#0a0a0a] p-12 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="w-20 h-20 bg-[#111] border border-[#D4AF37]/30 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-xl text-white font-light uppercase tracking-widest mb-2">Sección en construcción</h3>
            <p className="text-gray-500 max-w-md">Estamos migrando las otras pestañas a componentes modulares.</p>
          </div>
        )}
      </main>
    </div>
  );
}
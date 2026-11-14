'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ClientesView from './components/ClientesView';
// ... import other views ...

export default function SuperAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // 1. Persistencia: Leemos del localStorage al iniciar
  const [seccionActiva, setSeccionActiva] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sa_active_section') || 'dashboard';
    }
    return 'dashboard';
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [empresasList, setEmpresasList] = useState<{id: string, nombre: string}[]>([]);
  
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
    
    fetch('http://localhost:3000/super-admin/empresas', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setEmpresasList(data.map((e: any) => ({ id: e.id, nombre: e.nombre })));
        setLoading(false);
      });
  }, [router, token]);

  // 2. Función para cambiar de pestaña y guardarla
  const handleSetSeccion = (seccion: string) => {
    setSeccionActiva(seccion);
    localStorage.setItem('sa_active_section', seccion);
  };

  const handleLogout = () => {
    localStorage.clear(); // Esto borra el token y la sección activa
    router.push('/master-login');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleSetSeccion('clientes');
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-[#D4AF37] flex items-center justify-center text-xl tracking-widest uppercase">Iniciando Búnker...</div>;

  const titulos: Record<string, string> = {
    dashboard: 'Dashboard Global',
    clientes: 'Gestión de Clientes',
    planes: 'Planes y Suscripciones',
    seguridad: 'Seguridad y Auditoría',
    operaciones: 'Operaciones del Sistema',
    equipo: 'Equipo Interno',
    partners: 'Red de Partners',
    config: 'Configuración Global'
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-300 font-sans selection:bg-[#D4AF37] selection:text-black overflow-hidden">
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { background: '#111', color: '#fff', border: '1px solid #333' },
          success: { iconTheme: { primary: '#D4AF37', secondary: '#000' } }
        }} 
      />

      {/* Usamos handleSetSeccion en lugar de setSeccionActiva directo */}
      <Sidebar seccionActiva={seccionActiva} setSeccionActiva={handleSetSeccion} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-8 relative">
        <Header 
          title={titulos[seccionActiva]} 
          onSearch={handleSearch} 
          empresas={empresasList} 
          onLogout={handleLogout} 
        />

        {/* Usamos handleSetSeccion también acá */}
        {seccionActiva === 'dashboard' && <DashboardView setSeccionActiva={handleSetSeccion} />}
        {seccionActiva === 'clientes' && <ClientesView searchQuery={searchQuery} />}
        
        {seccionActiva !== 'dashboard' && seccionActiva !== 'clientes' && (
          <div className="bg-[#0a0a0a] p-12 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="w-20 h-20 bg-[#111] border border-[#D4AF37]/30 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-xl text-white font-light uppercase tracking-widest mb-2">Sección en construcción</h3>
            <p className="text-gray-500 max-w-md">Muy pronto podrás gestionar esto desde acá.</p>
          </div>
        )}
      </main>
    </div>
  );
}
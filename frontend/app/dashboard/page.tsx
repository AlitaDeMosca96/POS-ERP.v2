'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Buscamos si hay un usuario y un token guardados
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('usuario');

    if (!token || !userStr) {
      // Si no hay token, lo mandamos al login
      router.push('/');
    } else {
      setUsuario(JSON.parse(userStr));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/');
  };

  if (!usuario) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra superior */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Mi ERP Gastronómico</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Hola, {usuario.nombre} ({usuario.rol})</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="p-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Sistema</h2>
          <p className="text-gray-600">
            Este es el panel principal. Acá vas a poder ver tus ventas, gestionar el stock y administrar tu local.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="font-bold text-blue-800">Ventas de Hoy</h3>
              <p className="text-3xl font-light text-blue-600">$ 0.00</p>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="font-bold text-green-800">Mesas Ocupadas</h3>
              <p className="text-3xl font-light text-green-600">0 / 20</p>
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-200">
              <h3 className="font-bold text-purple-800">Alertas de Stock</h3>
              <p className="text-3xl font-light text-purple-600">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
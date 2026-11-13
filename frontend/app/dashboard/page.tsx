'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [totalVentas, setTotalVentas] = useState(0);
  const [cantidadVentas, setCantidadVentas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('usuario');

    if (!token || !userStr) {
      router.push('/');
      return;
    }

    setUsuario(JSON.parse(userStr));

    fetch('http://localhost:3000/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          router.push('/');
          return null; 
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          const total = data.reduce((acc: number, pedido: any) => acc + Number(pedido.total), 0);
          setTotalVentas(total);
          setCantidadVentas(data.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/');
  };

  if (loading || !usuario) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Mi ERP Gastronómico</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Hola, {usuario.nombre} ({usuario.rol})</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Resumen del Día</h2>
            
            <div className="flex gap-2 flex-wrap justify-end">
              <button onClick={() => router.push('/proveedores')} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Proveedores
              </button>
              <button onClick={() => router.push('/empleados')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Empleados
              </button>
              <button onClick={() => router.push('/sucursales')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Sucursales
              </button>
              <button onClick={() => router.push('/cocina')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Cocina
              </button>
              <button onClick={() => router.push('/insumos')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Insumos
              </button>
              <button onClick={() => router.push('/caja')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Caja
              </button>
              <button onClick={() => router.push('/mesas')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Mesas
              </button>
              <button onClick={() => router.push('/historial')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Historial
              </button>
              <button onClick={() => router.push('/productos')} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                Productos
              </button>
              <button onClick={() => router.push('/pos')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">
                + Ir al POS
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
              <h3 className="font-bold text-green-800 text-lg">Ingresos Totales</h3>
              <p className="text-4xl font-light text-green-600 mt-2">${totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <h3 className="font-bold text-blue-800 text-lg">Tickets Emitidos</h3>
              <p className="text-4xl font-light text-blue-600 mt-2">{cantidadVentas}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
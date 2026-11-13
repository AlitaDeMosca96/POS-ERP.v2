'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface Resumen {
  totalVentas: number;
  cantidadPedidos: number;
  metodosPago: { name: string; value: number }[];
  topProductos: { nombre: string; cantidad: number; total: number }[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('usuario');

    if (!token || !userStr) {
      router.push('/');
      return;
    }

    setUsuario(JSON.parse(userStr));

    fetch('http://localhost:3000/reportes/resumen', {
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
        if (data) setResumen(data);
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

  if (loading || !usuario) return <div className="p-10 text-center text-xl font-bold">Cargando datos del negocio...</div>;

  const metodosPagoData = resumen?.metodosPago.filter(m => m.value > 0) || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Mi ERP Gastronómico</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Hola, {usuario.nombre} ({usuario.rol})</span>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Tablero de Control</h2>
            
            <div className="flex gap-2 flex-wrap justify-end">
              <button onClick={() => router.push('/clientes')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Clientes</button>
              <button onClick={() => router.push('/compras')} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Compras</button>
              <button onClick={() => router.push('/proveedores')} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Proveedores</button>
              <button onClick={() => router.push('/empleados')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Empleados</button>
              <button onClick={() => router.push('/sucursales')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Sucursales</button>
              <button onClick={() => router.push('/cocina')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Cocina</button>
              <button onClick={() => router.push('/insumos')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Insumos</button>
              <button onClick={() => router.push('/caja')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Caja</button>
              <button onClick={() => router.push('/mesas')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Mesas</button>
              <button onClick={() => router.push('/historial')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Historial</button>
              <button onClick={() => router.push('/productos')} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">Productos</button>
              <button onClick={() => router.push('/pos')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow transition text-sm">+ Ir al POS</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
              <h3 className="font-bold text-green-800 text-lg">Ingresos Totales</h3>
              <p className="text-4xl font-light text-green-600 mt-2">${resumen?.totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <h3 className="font-bold text-blue-800 text-lg">Tickets Emitidos</h3>
              <p className="text-4xl font-light text-blue-600 mt-2">{resumen?.cantidadPedidos}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 text-xl mb-6 text-center">Ventas por Medio de Pago</h3>
              {metodosPagoData.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No hay ventas registradas aún.</p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metodosPagoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {metodosPagoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 text-xl mb-6 text-center">Top 5 Productos Más Vendidos</h3>
              {(!resumen?.topProductos || resumen.topProductos.length === 0) ? (
                <p className="text-center text-gray-500 mt-10">No hay ventas registradas aún.</p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={resumen.topProductos}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <XAxis dataKey="nombre" tick={{fontSize: 12}} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value} unidades`} />
                      <Bar dataKey="cantidad" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                        {resumen.topProductos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetcher } from '../../lib/api';
import { verificarSesion } from '../../lib/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Usuario {
  id: string;
  email: string;
  rol: string;
}

interface Resumen {
  totalVentas: number;
  cantidadPedidos: number;
  metodosPago: { name: string; value: number }[];
  topProductos: { nombre: string; cantidad: number; total: number }[];
}

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = verificarSesion();
    if (!user) return;

    setUsuario(user as Usuario);

    fetcher('/reportes/resumen')
      .then((data) => {
        setResumen(data);
      })
      .catch((err) => {
        console.error('Error cargando resumen:', err);
        if (err.message === 'Sesión expirada') {
          router.push('/');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando dashboard...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Bienvenido, {usuario?.email} ({usuario?.rol})</p>
          </div>
          <div className="space-x-4">
            <Link href="/caja" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Ir a Caja
            </Link>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-600">Ventas Totales</h2>
            <p className="text-3xl font-bold text-gray-900">
              ${resumen?.totalVentas?.toLocaleString('es-AR') || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-600">Cantidad de Pedidos</h2>
            <p className="text-3xl font-bold text-gray-900">
              {resumen?.cantidadPedidos || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Ventas por Método de Pago</h2>
            <div className="h-64">
              {resumen?.metodosPago?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resumen.metodosPago}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {resumen.metodosPago.map((entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 mt-10">No hay ventas registradas</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Top 5 Productos</h2>
            <div className="h-64">
              {resumen?.topProductos?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resumen.topProductos}>
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 mt-10">No hay productos vendidos</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
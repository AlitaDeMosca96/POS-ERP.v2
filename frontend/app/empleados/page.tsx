'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Sucursal {
  id: string;
  nombre: string;
}

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  sucursal?: Sucursal;
}

export default function EmpleadosPage() {
  const router = useRouter();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('CAJERO');
  const [sucursalId, setSucursalId] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    cargarDatos();
  }, [router, token]);

  const cargarDatos = async () => {
    try {
      const [resEmp, resSuc] = await Promise.all([
        fetch('http://localhost:3000/usuarios', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/sucursales', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setEmpleados(await resEmp.json());
      const sucs = await resSuc.json();
      setSucursales(sucs);
      if (sucs.length > 0) setSucursalId(sucs[0].id);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCrearEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, email, password, rol, sucursalId: sucursalId || null })
      });

      if (res.ok) {
        alert('Empleado creado con éxito');
        setNombre(''); setEmail(''); setPassword('');
        cargarDatos();
      } else {
        alert('Error al crear el empleado. Verificá si el email ya existe.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nuevo Empleado</h2>
          <form onSubmit={handleCrearEmpleado} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text" placeholder="Nombre" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <select value={rol} onChange={e => setRol(e.target.value)} className="border p-2 rounded text-gray-800">
              <option value="ADMIN">Administrador</option>
              <option value="CAJERO">Cajero / Mozo</option>
              <option value="COCINERO">Cocinero</option>
            </select>
            <select value={sucursalId} onChange={e => setSucursalId(e.target.value)} className="border p-2 rounded text-gray-800">
              <option value="">Sin Sucursal</option>
              {sucursales.map(suc => (
                <option key={suc.id} value={suc.id}>{suc.nombre}</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">
              Guardar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Sucursal</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(emp => (
                <tr key={emp.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{emp.nombre}</td>
                  <td className="p-4 text-gray-500">{emp.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${emp.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {emp.rol}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{emp.sucursal?.nombre || 'Global'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
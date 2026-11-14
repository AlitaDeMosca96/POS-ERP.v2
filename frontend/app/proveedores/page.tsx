'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}

export default function ProveedoresPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    cargarProveedores();
  }, [router, token]);

  const cargarProveedores = async () => {
    try {
      const res = await fetch('/api/proveedores', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProveedores(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCrearProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, telefono, email, direccion })
      });

      if (res.ok) {
        alert('Proveedor creado con éxito');
        setNombre(''); setTelefono(''); setEmail(''); setDireccion('');
        cargarProveedores();
      } else {
        alert('Error al crear el proveedor');
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
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Proveedores</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nuevo Proveedor</h2>
          <form onSubmit={handleCrearProveedor} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text" placeholder="Nombre / Empresa" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="text" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="text" placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">
              Guardar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Proveedor</th>
                <th className="p-4 font-semibold">Contacto</th>
                <th className="p-4 font-semibold">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map(prov => (
                <tr key={prov.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{prov.nombre}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {prov.telefono && <div>📞 {prov.telefono}</div>}
                    {prov.email && <div>✉️ {prov.email}</div>}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{prov.direccion || '-'}</td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">No hay proveedores cargados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
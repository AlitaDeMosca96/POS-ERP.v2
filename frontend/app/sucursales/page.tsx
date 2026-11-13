'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
}

export default function SucursalesPage() {
  const router = useRouter();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    cargarSucursales();
  }, [router, token]);

  const cargarSucursales = async () => {
    try {
      const res = await fetch('http://localhost:3000/sucursales', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSucursales(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCrearSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/sucursales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, direccion })
      });

      if (res.ok) {
        alert('Sucursal creada con éxito');
        setNombre(''); setDireccion('');
        cargarSucursales();
      } else {
        alert('Error al crear la sucursal');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Sucursales</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
            Volver al Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nueva Sucursal</h2>
          <form onSubmit={handleCrearSucursal} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text" placeholder="Nombre (Ej: Local Centro)" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <input
              type="text" placeholder="Dirección" required value={direccion} onChange={e => setDireccion(e.target.value)}
              className="border p-2 rounded text-gray-800"
            />
            <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">
              Crear Sucursal
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sucursales.map(suc => (
            <div key={suc.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{suc.nombre}</h3>
              <p className="text-gray-500">{suc.direccion}</p>
            </div>
          ))}
          {sucursales.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              No hay sucursales creadas aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
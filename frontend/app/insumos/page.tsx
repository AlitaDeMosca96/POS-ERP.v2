'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetcher } from '../../lib/api';

interface Insumo { id: string; nombre: string; unidadMedida: string; stock: number; costo: number; }

export default function InsumosPage() {
  const router = useRouter();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('UNIDAD');
  const [stock, setStock] = useState('');
  const [costo, setCosto] = useState('');

  // Función movida arriba del useEffect
  const cargarInsumos = async () => {
    try {
      const data = await fetcher('/insumos');
      setInsumos(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    cargarInsumos(); 
  }, []);

  const handleCrearInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetcher('/insumos', {
        method: 'POST',
        body: JSON.stringify({ nombre, unidadMedida, stock: Number(stock), costo: Number(costo) })
      });
      toast.success('Insumo creado con éxito');
      setNombre(''); setUnidadMedida('UNIDAD'); setStock(''); setCosto('');
      cargarInsumos();
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Error al crear el insumo'); 
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Materias Primas e Insumos</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agregar Nuevo Insumo</h2>
          <form onSubmit={handleCrearInsumo} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" placeholder="Nombre (Ej: Pan de burger)" required value={nombre} onChange={e => setNombre(e.target.value)} className="border p-2 rounded text-gray-800" />
            <select value={unidadMedida} onChange={e => setUnidadMedida(e.target.value)} className="border p-2 rounded text-gray-800">
              <option value="UNIDAD">Unidad</option>
              <option value="KG">Kilogramos</option>
              <option value="GRAMOS">Gramos</option>
              <option value="LITROS">Litros</option>
              <option value="ML">Mililitros</option>
            </select>
            <input type="number" placeholder="Stock Inicial" required value={stock} onChange={e => setStock(e.target.value)} className="border p-2 rounded text-gray-800" />
            <input type="number" placeholder="Costo por unidad" required value={costo} onChange={e => setCosto(e.target.value)} className="border p-2 rounded text-gray-800" />
            <button type="submit" className="bg-teal-600 text-white font-bold p-2 rounded hover:bg-teal-700">Guardar Insumo</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Insumo</th>
                <th className="p-4 font-semibold">Unidad</th>
                <th className="p-4 font-semibold">Costo</th>
                <th className="p-4 font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map(insumo => (
                <tr key={insumo.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{insumo.nombre}</td>
                  <td className="p-4 text-gray-500">{insumo.unidadMedida}</td>
                  <td className="p-4 text-teal-600 font-bold">${insumo.costo}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${insumo.stock > 10 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{insumo.stock} {insumo.unidadMedida.toLowerCase()}</span>
                  </td>
                </tr>
              ))}
              {insumos.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay insumos cargados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
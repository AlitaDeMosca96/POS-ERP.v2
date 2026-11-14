'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetcher } from '../../lib/api';

interface Cliente { id: string; nombre: string; telefono: string; email: string; }

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    try {
      const data = await fetcher('/clientes');
      setClientes(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetcher('/clientes', {
        method: 'POST',
        body: JSON.stringify({ nombre, telefono, email })
      });
      toast.success('Cliente registrado con éxito');
      setNombre(''); setTelefono(''); setEmail('');
      cargarClientes();
    } catch (error: any) { toast.error(error.message || 'Error al registrar el cliente'); }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Base de Clientes (CRM)</h1>
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Volver al Dashboard</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Registrar Nuevo Cliente</h2>
          <form onSubmit={handleCrearCliente} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Nombre y Apellido" required value={nombre} onChange={e => setNombre(e.target.value)} className="border p-2 rounded text-gray-800" />
            <input type="text" placeholder="Teléfono / WhatsApp" value={telefono} onChange={e => setTelefono(e.target.value)} className="border p-2 rounded text-gray-800" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded text-gray-800" />
            <button type="submit" className="bg-pink-600 text-white font-bold p-2 rounded hover:bg-pink-700">Guardar Cliente</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Contacto</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cli => (
                <tr key={cli.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{cli.nombre}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {cli.telefono && <div>📞 {cli.telefono}</div>}
                    {cli.email && <div>✉️ {cli.email}</div>}
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-500">No hay clientes registrados aún</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}